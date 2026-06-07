import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { AddMemberDto } from './dto/add-member.dto';
import { Roles } from '../common/decorators/role.decorators';
import { Role } from '@prisma/client';
import { JoinClassDto } from './dto/join-class.dto';
import { UpdateMemberStatusDto } from './dto/update-member-status.dto';

// Áp dụng Guard cho toàn bộ Controller này
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  @Roles(Role.TEACHER) // Chỉ Teacher mới được tạo lớp
  async createClass(@Request() req, @Body() createClassDto: CreateClassDto) {
    const teacherId = req.user.id; // Lấy ID từ payload của JWT
    return this.classService.createClass(teacherId, createClassDto);
  }

  @Get()
  @Roles(Role.TEACHER)
  async getMyClasses(@Request() req) {
    const teacherId = req.user.id;
    return this.classService.getTeacherClasses(teacherId);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  async deleteClass(@Request() req, @Param('id') classId: string) {
    const teacherId = req.user.id;
    await this.classService.deleteClass(teacherId, classId);
    return { message: 'Đã xóa lớp học thành công' }; // Nhờ Global Interceptor, message này sẽ được hiển thị chuẩn
  }

  @Post(':id/members')
  @Roles(Role.TEACHER)
  async addStudentToClass(
    @Request() req,
    @Param('id') classId: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    const teacherId = req.user.id;
    const result = await this.classService.addStudentByEmail(
      teacherId,
      classId,
      addMemberDto.email,
    );

    // Nhờ TransformInterceptor đã cài đặt, ta có thể tự do custom message thành công ở đây
    return {
      message: 'Đã thêm học sinh vào lớp thành công',
      result: result,
    };
  }
  @Post('join')
  @Roles(Role.STUDENT)
  async joinClass(@Request() req, @Body() joinDto: JoinClassDto) {
    const studentId = req.user.id;
    const result = await this.classService.joinClass(
      studentId,
      joinDto.classId,
    );
    return {
      message: 'Đã gửi yêu cầu tham gia lớp. Vui lòng chờ giáo viên phê duyệt.',
      result,
    };
  }

  // [TEACHER] - Cập nhật trạng thái của 1 thành viên (Duyệt / Từ chối)
  @Patch(':classId/members/:studentId/status')
  @Roles(Role.TEACHER)
  async approveOrRejectMember(
    @Request() req,
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
    @Body() updateDto: UpdateMemberStatusDto,
  ) {
    const teacherId = req.user.id;
    const result = await this.classService.updateMemberStatus(
      teacherId,
      classId,
      studentId,
      updateDto.status,
    );

    const actionMessage =
      updateDto.status === 'ACTIVE' ? 'phê duyệt' : 'từ chối';
    return {
      message: `Đã ${actionMessage} học sinh thành công`,
      result,
    };
  }
}
