import { IsObject, IsOptional, IsNumber } from 'class-validator';

export class SubmitQuizDto {
  @IsObject()
  answers: Record<string, string>;

  // Thêm trường này để nhận số giây làm bài từ Frontend
  @IsOptional()
  @IsNumber()
  timeTaken?: number;
}
