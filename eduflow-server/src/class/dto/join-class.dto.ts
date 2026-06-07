import { IsNotEmpty, IsUUID } from 'class-validator';

export class JoinClassDto {
  // Bắt buộc phải là chuỗi UUID hợp lệ (định dạng ID của Prisma)
  @IsUUID('all', { message: 'Mã lớp học không đúng định dạng' })
  @IsNotEmpty({ message: 'Vui lòng nhập mã lớp học' })
  classId: string;
}
