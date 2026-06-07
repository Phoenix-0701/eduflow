import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

// --- DTO cho một Đáp án ---
class CreateOptionDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  isCorrect: boolean;
}

// --- DTO cho một Câu hỏi ---
class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @Min(0)
  orderIndex: number; // Thứ tự hiển thị câu hỏi

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];
}

// --- DTO chính cho bài Quiz ---
export class CreateQuizDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập ID lớp học' })
  classId: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên bài kiểm tra không được để trống' })
  title: string;

  @IsInt()
  @Min(1, { message: 'Thời gian làm bài tối thiểu là 1 phút' })
  duration: number;

  @IsDateString({}, { message: 'Định dạng hạn nộp (deadline) không hợp lệ' })
  deadline: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxAttempt?: number;

  @IsBoolean()
  @IsOptional()
  showPoint?: boolean;

  @IsString()
  @IsOptional()
  note?: string;

  // Danh sách các câu hỏi đi kèm
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
