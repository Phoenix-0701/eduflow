import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateClassDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên lớp không được để trống' })
  name: string;
}
