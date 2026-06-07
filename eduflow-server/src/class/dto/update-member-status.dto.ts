import { IsEnum, IsNotEmpty } from 'class-validator';
import { MemberStatus } from '@prisma/client';

export class UpdateMemberStatusDto {
  @IsEnum([MemberStatus.ACTIVE, MemberStatus.REJECTED], {
    message: 'Trạng thái chỉ có thể là ACTIVE hoặc REJECTED',
  })
  @IsNotEmpty()
  status: MemberStatus;
}
