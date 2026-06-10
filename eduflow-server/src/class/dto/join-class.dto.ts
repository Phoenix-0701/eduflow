import { IsNotEmpty, IsString } from 'class-validator'; // <-- Đổi IsUUID thành IsString

export class JoinClassDto {
  @IsNotEmpty()
  @IsString() // <-- Đổi IsUUID thành IsString
  classId: string;
}
