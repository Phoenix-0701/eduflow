import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SaveDraftDto } from './dto/save-draft.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async createQuiz(teacherId: string, dto: CreateQuizDto) {
    // 1. Kiểm tra quyền sở hữu lớp học
    const targetClass = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });

    if (!targetClass || targetClass.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền tạo bài kiểm tra cho lớp này',
      );
    }

    // 2. Sử dụng Nested Writes của Prisma để tạo toàn bộ cấu trúc trong 1 query
    return this.prisma.quiz.create({
      data: {
        classId: dto.classId,
        title: dto.title,
        duration: dto.duration,
        deadline: new Date(dto.deadline),
        maxAttempt: dto.maxAttempt ?? 1,
        showPoint: dto.showPoint ?? false,
        note: dto.note,

        // Tạo các câu hỏi liên kết
        questions: {
          create: dto.questions.map((q) => ({
            content: q.content,
            orderIndex: q.orderIndex,
            // Với mỗi câu hỏi, tạo các đáp án liên kết
            options: {
              create: q.options.map((opt) => ({
                content: opt.content,
                isCorrect: opt.isCorrect,
              })),
            },
          })),
        },
      },
      // Trả về cấu trúc đầy đủ để Teacher xác nhận
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
  }
  async getQuizByIdForStudent(studentId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId, isDeleted: false },
      include: {
        class: {
          select: { id: true, name: true, teacher: { select: { name: true } } },
        },
        attempts: {
          where: { studentId },
          orderBy: { startedAt: 'asc' },
        },
        _count: { select: { questions: true } },
        // 🌟 THÊM ĐOẠN NÀY ĐỂ LẤY CÂU HỎI VÀ ĐÁP ÁN (GIẤU isCorrect)
        questions: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            content: true,
            options: {
              select: { id: true, content: true }, // Tuyệt đối không select isCorrect để HS không thể F12 gian lận
            },
          },
        },
      },
    });
  }

  // Lấy danh sách Quiz của một Lớp
  // Lấy danh sách Quiz của lớp
  async getQuizzesByClass(classId: string, userId: string, role: string) {
    return this.prisma.quiz.findMany({
      where: { classId, isDeleted: false },
      include: {
        _count: { select: { questions: true } }, // Đếm tổng số câu hỏi
        attempts:
          role === 'STUDENT'
            ? {
                where: { studentId: userId }, // Chỉ lấy bài nộp của chính học sinh này
              }
            : false, // Nếu là giáo viên tạm thời không cần load attempts ở màn này
      },
      orderBy: { createdAt: 'asc' },
    });
  }
  // Thêm các hàm sau vào trong class QuizService

  // ---------------------------------------------------------
  // [STUDENT] LUỒNG 1: Lưu nháp (Auto-save)
  // ---------------------------------------------------------
  async saveDraftAttempt(studentId: string, quizId: string, dto: SaveDraftDto) {
    // Upsert: Nếu chưa có nháp thì tạo mới, nếu có rồi thì update (Dùng cho API gọi liên tục)
    return this.prisma.draftAttempt.upsert({
      where: {
        quizId_studentId: { quizId, studentId },
      },
      update: {
        savedState: dto.answers,
      },
      create: {
        quizId,
        studentId,
        savedState: dto.answers,
      },
    });
  }

  // Lấy lại bài nháp (Để FE gọi khi học sinh vô tình F5 và load lại trang)
  async getDraftAttempt(studentId: string, quizId: string) {
    return this.prisma.draftAttempt.findUnique({
      where: { quizId_studentId: { quizId, studentId } },
    });
  }

  // ---------------------------------------------------------
  // [STUDENT] LUỒNG 2: Nộp bài và Chấm điểm tự động
  // ---------------------------------------------------------
  async submitQuiz(studentId: string, quizId: string, dto: SubmitQuizDto) {
    // 1. Lấy thông tin bài Quiz kèm theo toàn bộ câu hỏi và đáp án đúng
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId, isDeleted: false },
      include: {
        questions: {
          include: {
            options: { where: { isCorrect: true } }, // Chỉ lấy đáp án đúng để đối chiếu
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Bài kiểm tra không tồn tại');
    }

    // (Tùy chọn: Bạn có thể code thêm logic kiểm tra xem học sinh có vượt quá Max Attempt hay quá Deadline ở đây)

    // 2. Chấm điểm (Tính số câu đúng)
    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    // Mảng chứa chi tiết bài làm để lưu vào DB
    const attemptDetailsData = [];

    quiz.questions.forEach((question) => {
      // Lấy đáp án học sinh chọn cho câu hỏi này từ DTO
      const studentSelectedOptionId = dto.answers[question.id];

      // Lấy ID đáp án đúng từ DB
      const correctOptionId = question.options[0]?.id;

      if (studentSelectedOptionId) {
        attemptDetailsData.push({
          questionId: question.id,
          selectedOptionId: studentSelectedOptionId,
        });

        // So sánh
        if (studentSelectedOptionId === correctOptionId) {
          correctCount++;
        }
      }
    });

    // Tính điểm trên thang 10
    const finalScore =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;
    // Làm tròn 2 chữ số thập phân (Ví dụ: 8.33)
    const roundedScore = Math.round(finalScore * 100) / 100;

    // 3. Sử dụng Prisma Transaction để Lưu bài làm chính thức & Xóa bản nháp
    const result = await this.prisma.$transaction(async (tx) => {
      // 3.1 Lưu Attempt (Kết quả tổng)
      const attempt = await tx.attempt.create({
        data: {
          quizId,
          studentId,
          score: roundedScore,
          submittedAt: new Date(),
          // 3.2 Lưu chi tiết từng câu hỏi (Nested Create)
          details: {
            create: attemptDetailsData,
          },
        },
      });

      // 3.3 Xóa bản nháp (nếu có)
      await tx.draftAttempt.deleteMany({
        where: { quizId, studentId },
      });

      return attempt;
    });

    return {
      score: result.score,
      correctAnswers: correctCount,
      totalQuestions: totalQuestions,
      message: quiz.showPoint
        ? `Bạn đã đạt ${result.score} điểm.`
        : 'Đã nộp bài thành công. Giáo viên đã ẩn điểm số.',
    };
  }

  async getQuizReport(teacherId: string, quizId: string) {
    // 1. Xác thực quyền sở hữu của giáo viên đối với lớp học chứa bài Quiz này
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId, isDeleted: false },
      include: { class: true },
    });

    if (!quiz || quiz.class.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền xem thống kê của bài kiểm tra này',
      );
    }

    // 2. Lấy toàn bộ bài làm chính thức của học sinh (đã nộp)
    const attempts = await this.prisma.attempt.findMany({
      where: {
        quizId: quizId,
        submittedAt: { not: null }, // Chỉ lấy những bài đã nộp
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { score: 'desc' }, // Sắp xếp từ điểm cao xuống thấp
    });

    // Nếu chưa có ai làm bài, trả về mảng rỗng và các chỉ số bằng 0
    if (attempts.length === 0) {
      return {
        overview: {
          totalAttempts: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
        },
        scoreDistribution: [],
        studentResults: [],
      };
    }

    // 3. Tính toán Tổng quan (Overview)
    const scores = attempts.map((a) => a.score || 0);
    const totalAttempts = scores.length;
    const averageScore = Number(
      (scores.reduce((sum, score) => sum + score, 0) / totalAttempts).toFixed(
        2,
      ),
    );
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // 4. Xây dựng mảng Phổ điểm (Score Distribution) cho Bar Chart
    // Chia làm 10 khoảng: 0-1, 1-2, 2-3, ... 9-10
    const scoreDistribution = Array.from({ length: 10 }, (_, i) => ({
      range: `${i}-${i + 1}`,
      count: 0,
    }));

    scores.forEach((score) => {
      // Phân loại điểm vào các khoảng (bucket). Ví dụ: 8.5 -> bucket index 8 ("8-9")
      let index = Math.floor(score);
      // Xử lý case điểm tuyệt đối (10 điểm) sẽ được nhét chung vào cột 9-10
      if (index === 10) index = 9;

      scoreDistribution[index].count++;
    });

    // 5. Định dạng lại bảng điểm chi tiết
    const studentResults = attempts.map((a) => ({
      attemptId: a.id,
      studentId: a.student.id,
      studentName: a.student.name,
      studentEmail: a.student.email,
      score: a.score,
      submittedAt: a.submittedAt,
    }));

    return {
      overview: {
        totalAttempts,
        averageScore,
        highestScore,
        lowestScore,
      },
      scoreDistribution,
      studentResults,
    };
  }
}
