import { IsNotEmpty, IsObject } from 'class-validator';

export class SubmitQuizDto {
  // Tương tự lưu nháp, khi nộp bài FE cũng gửi cục JSON chứa toàn bộ đáp án cuối cùng
  @IsObject()
  @IsNotEmpty()
  answers: Record<string, string>;
}
