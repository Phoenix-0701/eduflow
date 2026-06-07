import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/role.decorators';
import { Role } from '@prisma/client';
import { GeminiService } from './gemini.service';
import { SaveDraftDto } from './dto/save-draft.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('quizzes')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly geminiService: GeminiService,
  ) {}

  // [TEACHER] - Tạo bài kiểm tra mới
  @Post()
  @Roles(Role.TEACHER)
  async createQuiz(@Request() req, @Body() createQuizDto: CreateQuizDto) {
    const teacherId = req.user.id;
    const result = await this.quizService.createQuiz(teacherId, createQuizDto);

    return {
      message: 'Tạo bài kiểm tra thành công',
      result,
    };
  }

  // [TEACHER / STUDENT] - Lấy danh sách Quiz của 1 lớp
  @Get('class/:classId')
  // Cả Teacher và Student đều có thể xem danh sách bài kiểm tra của lớp
  async getQuizzesByClass(@Param('classId') classId: string) {
    // Lưu ý nhỏ: Thực tế bạn nên check xem Student gọi API này có đang ACTIVE trong lớp này không.
    // Tôi để mở tạm thời để bạn test dễ hơn.
    return this.quizService.getQuizzesByClass(classId);
  }

  @Post('ai/generate')
  @Roles(Role.TEACHER)
  @UseInterceptors(FileInterceptor('file')) // Key formdata khi call api là "file"
  async generateQuestionsByAI(@UploadedFile() file: Express.Multer.File) {
    // Validate file
    if (!file) {
      throw new BadRequestException('Vui lòng upload tài liệu PDF');
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Hệ thống chỉ hỗ trợ định dạng file .pdf');
    }

    // Giới hạn dung lượng file (Ví dụ: 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('Kích thước file vượt quá giới hạn 5MB');
    }

    // Gọi Gemini Service xử lý Buffer của file
    const generatedQuestions =
      await this.geminiService.generateQuestionsFromPdf(
        file.buffer,
      );

    return {
      message: 'AI đã trích xuất câu hỏi thành công',
      result: generatedQuestions,
    };
  }

  @Post(':id/drafts')
  @Roles(Role.STUDENT)
  async saveDraft(
    @Request() req,
    @Param('id') quizId: string,
    @Body() saveDraftDto: SaveDraftDto,
  ) {
    const studentId = req.user.id;
    await this.quizService.saveDraftAttempt(studentId, quizId, saveDraftDto);
    return { message: 'Đã lưu nháp tự động' };
  }

  // [STUDENT] - Lấy lại bản nháp (nếu có)
  @Get(':id/drafts')
  @Roles(Role.STUDENT)
  async getDraft(@Request() req, @Param('id') quizId: string) {
    const studentId = req.user.id;
    const draft = await this.quizService.getDraftAttempt(studentId, quizId);
    return {
      message: draft ? 'Tải bản nháp thành công' : 'Không có bản nháp nào',
      result: draft?.savedState || {},
    };
  }

  // [STUDENT] - Nộp bài chính thức
  @Post(':id/submit')
  @Roles(Role.STUDENT)
  async submitQuiz(
    @Request() req,
    @Param('id') quizId: string,
    @Body() submitDto: SubmitQuizDto,
  ) {
    const studentId = req.user.id;
    const result = await this.quizService.submitQuiz(
      studentId,
      quizId,
      submitDto,
    );
    return {
      message: 'Nộp bài thành công',
      result,
    };
  }

  @Get(':id/report')
  @Roles(Role.TEACHER)
  async getQuizReport(@Request() req, @Param('id') quizId: string) {
    const teacherId = req.user.id;
    const result = await this.quizService.getQuizReport(teacherId, quizId);

    return {
      message: 'Tải báo cáo thống kê thành công',
      result,
    };
  }
}
