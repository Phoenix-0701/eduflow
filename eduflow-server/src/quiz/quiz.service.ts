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
        questions: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            content: true,
            options: {
              select: { id: true, content: true },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Bài kiểm tra không tồn tại hoặc đã bị xóa');
    }

    const isMember = await this.prisma.classMember.findUnique({
      where: { classId_studentId: { classId: quiz.classId, studentId } },
    });

    if (!isMember || isMember.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập bài kiểm tra này',
      );
    }

    return quiz; // 🌟 HÔM TRƯỚC BẠN THIẾU DÒNG NÀY NÊN UI BỊ TRẮNG
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

  // [TEACHER] Xem báo cáo thống kê của 1 bài kiểm tra
  async getQuizReport(teacherId: string, quizId: string) {
    // 1. Lấy bài test kèm theo lớp và danh sách các lần nộp bài
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId, isDeleted: false },
      include: {
        class: {
          include: {
            members: { where: { status: 'ACTIVE' } }, // Lấy ds học sinh để tính tỷ lệ hoàn thành
          },
        },
        attempts: {
          where: { submittedAt: { not: null } }, // Chỉ lấy bài ĐÃ NỘP
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!quiz || quiz.class.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Không có quyền truy cập hoặc bài test không tồn tại',
      );
    }

    const totalStudents = quiz.class.members.length;
    const submittedAttempts = quiz.attempts;

    // 2. Khởi tạo các biến thống kê
    let highest = 0;
    let lowest = 0;
    let average = 0;
    const distribution = {
      '0-2': 0,
      '3-4': 0,
      '5-6': 0,
      '6-7': 0,
      '7-8': 0,
      '8-9': 0,
      '9-10': 0,
    };

    // 3. Tính toán nếu có người nộp bài
    if (submittedAttempts.length > 0) {
      const scores = submittedAttempts.map((a) => a.score || 0);
      highest = Math.max(...scores);
      lowest = Math.min(...scores);
      average = Number(
        (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      );

      // Phân bổ phổ điểm cho biểu đồ
      scores.forEach((s) => {
        if (s <= 2) distribution['0-2']++;
        else if (s <= 4) distribution['3-4']++;
        else if (s <= 6) distribution['5-6']++;
        else if (s <= 7) distribution['6-7']++;
        else if (s <= 8) distribution['7-8']++;
        else if (s <= 9) distribution['8-9']++;
        else distribution['9-10']++;
      });
    }

    // Đếm số học sinh duy nhất đã làm bài
    const uniqueStudentsAttempted = new Set(
      submittedAttempts.map((a) => a.studentId),
    ).size;
    const completionRate =
      totalStudents > 0
        ? Math.round((uniqueStudentsAttempted / totalStudents) * 100)
        : 0;

    return {
      quiz: {
        id: quiz.id,
        title: quiz.title,
        classId: quiz.classId,
        className: quiz.class.name,
        deadline: quiz.deadline,
      },
      stats: {
        average,
        highest,
        lowest,
        completionRate,
        totalStudents,
        uniqueStudentsAttempted,
      },
      distribution,
      attempts: submittedAttempts,
    };
  }
  async getStudentDashboard(studentId: string) {
    const activeClasses = await this.prisma.classMember.findMany({
      where: { studentId, status: 'ACTIVE' },
      select: { classId: true },
    });
    const classIds = activeClasses.map((c) => c.classId);

    const now = new Date();

    const upcomingQuizzes = await this.prisma.quiz.findMany({
      where: {
        classId: { in: classIds },
        isDeleted: false,
        deadline: { gt: now }, // 🌟 ĐÃ XÓA { deadline: null } ĐỂ HẾT LỖI 500
        attempts: {
          none: {
            studentId: studentId,
            submittedAt: { not: null },
          },
        },
      },
      include: {
        class: { select: { name: true, teacher: { select: { name: true } } } },
      },
      orderBy: { deadline: 'asc' },
      take: 5,
    });

    const recentAttempts = await this.prisma.attempt.findMany({
      where: {
        studentId: studentId,
        submittedAt: { not: null },
      },
      include: {
        quiz: {
          select: { title: true, class: { select: { name: true } } },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 5,
    });

    return {
      upcomingQuizzes,
      recentAttempts,
    };
  }
  // [STUDENT] Lấy chi tiết bài làm (Review)
  // [STUDENT] Lấy chi tiết bài làm (Review)
  async getAttemptReview(studentId: string, quizId: string) {
    const attempt = await this.prisma.attempt.findFirst({
      where: { studentId, quizId },
      orderBy: { startedAt: 'desc' },
      include: {
        quiz: {
          include: {
            class: { select: { name: true } },
            questions: {
              orderBy: { orderIndex: 'asc' },
              include: { options: true },
            },
          },
        },
        details: true,
      },
    });

    if (!attempt) throw new NotFoundException('Không tìm thấy bài làm');

    const quiz = attempt.quiz;
    const isSubmitted = !!attempt.submittedAt;

    const savedAnswers: Record<string, string> = {};

    if (isSubmitted) {
      attempt.details.forEach((detail) => {
        savedAnswers[detail.questionId] = detail.selectedOptionId;
      });
    } else {
      const draft = await this.prisma.draftAttempt.findUnique({
        where: { quizId_studentId: { quizId, studentId } },
      });
      if (draft && draft.savedState) {
        Object.assign(savedAnswers, draft.savedState);
      }
    }

    const questionsWithReview = quiz.questions.map((q) => {
      const selectedOptionId = savedAnswers[q.id];
      const correctOption = q.options.find((o) => o.isCorrect);
      const isCorrect = selectedOptionId === correctOption?.id;

      return {
        id: q.id,
        content: q.content,
        options: q.options.map((o) => ({
          id: o.id,
          content: o.content,
          isCorrect: isSubmitted && quiz.showPoint ? o.isCorrect : undefined,
        })),
        studentAnswer: selectedOptionId,
        isCorrect: isSubmitted && quiz.showPoint ? isCorrect : undefined,
      };
    });

    let timeTaken = 0;
    if (attempt.submittedAt) {
      timeTaken = Math.floor(
        (attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000,
      );
    }

    return {
      attemptId: attempt.id,
      quizTitle: quiz.title,
      className: quiz.class.name,
      showPoint: quiz.showPoint,
      isSubmitted,
      score: attempt.score,
      timeTaken: timeTaken,
      submittedAt: attempt.submittedAt,
      questions: questionsWithReview,
    };
  }
}
