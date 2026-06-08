import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { MemberStatus } from '@prisma/client';

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  async createClass(teacherId: string, dto: CreateClassDto) {
    return this.prisma.class.create({
      data: {
        name: dto.name,
        teacherId: teacherId,
      },
    });
  }

  async getTeacherClasses(teacherId: string) {
    return this.prisma.class.findMany({
      where: {
        teacherId: teacherId,
        isDeleted: false, // Chỉ lấy các lớp chưa bị xóa
      },
      include: {
        _count: {
          select: { members: true, quizzes: true }, // Đếm số HS và số Quiz để trả về cho UI Card
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteClass(teacherId: string, classId: string) {
    const targetClass = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (
      !targetClass ||
      targetClass.teacherId !== teacherId ||
      targetClass.isDeleted
    ) {
      throw new NotFoundException('Không tìm thấy lớp học hợp lệ');
    }

    // Thực hiện Soft Delete
    return this.prisma.class.update({
      where: { id: classId },
      data: { isDeleted: true },
    });
  }
  async addStudentByEmail(teacherId: string, classId: string, email: string) {
    // 1. Kiểm tra Lớp học hợp lệ
    const targetClass = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (
      !targetClass ||
      targetClass.teacherId !== teacherId ||
      targetClass.isDeleted
    ) {
      throw new NotFoundException('Không tìm thấy lớp học hợp lệ');
    }

    // 2. Tìm User theo email và phải là STUDENT
    const student = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Không tìm thấy học sinh với email này');
    }

    // 3. Kiểm tra xem học sinh đã có trong lớp chưa
    const existingMember = await this.prisma.classMember.findUnique({
      where: {
        classId_studentId: {
          classId: classId,
          studentId: student.id,
        },
      },
    });

    // 4. Xử lý các trạng thái
    if (existingMember) {
      if (existingMember.status === MemberStatus.ACTIVE) {
        throw new BadRequestException('Học sinh này đã có trong lớp');
      }

      // Nếu trạng thái đang là PENDING (do học sinh tự xin vào) hoặc REJECTED, ta update lên ACTIVE
      return this.prisma.classMember.update({
        where: {
          classId_studentId: { classId, studentId: student.id },
        },
        data: { status: MemberStatus.ACTIVE },
        include: {
          student: { select: { id: true, name: true, email: true } }, // Trả về thông tin cơ bản của HS
        },
      });
    }

    // 5. Nếu chưa từng tham gia, tạo mới với trạng thái ACTIVE
    return this.prisma.classMember.create({
      data: {
        classId: classId,
        studentId: student.id,
        status: MemberStatus.ACTIVE,
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async joinClass(studentId: string, classId: string) {
    // 1. Kiểm tra xem lớp có tồn tại và đang hoạt động không
    const targetClass = await this.prisma.class.findUnique({
      where: { id: classId, isDeleted: false },
    });

    if (!targetClass) {
      throw new NotFoundException('Lớp học không tồn tại hoặc đã bị xóa');
    }

    // 2. Kiểm tra trạng thái hiện tại của học sinh trong lớp
    const existingMember = await this.prisma.classMember.findUnique({
      where: {
        classId_studentId: { classId, studentId },
      },
    });

    if (existingMember) {
      if (existingMember.status === MemberStatus.ACTIVE) {
        throw new BadRequestException('Bạn đã là thành viên của lớp này rồi');
      }
      if (existingMember.status === MemberStatus.PENDING) {
        throw new BadRequestException(
          'Yêu cầu tham gia của bạn đang chờ giáo viên duyệt',
        );
      }

      // Nếu trước đó bị REJECTED, cho phép gửi lại yêu cầu (chuyển về PENDING)
      if (existingMember.status === MemberStatus.REJECTED) {
        return this.prisma.classMember.update({
          where: { classId_studentId: { classId, studentId } },
          data: { status: MemberStatus.PENDING },
        });
      }
    }

    // 3. Tạo mới yêu cầu PENDING
    return this.prisma.classMember.create({
      data: {
        classId,
        studentId,
        status: MemberStatus.PENDING,
      },
    });
  }

  // ---------------------------------------------------------
  // [TEACHER] LUỒNG 2: Giáo viên duyệt/từ chối học sinh
  // ---------------------------------------------------------
  async updateMemberStatus(
    teacherId: string,
    classId: string,
    studentId: string,
    newStatus: MemberStatus,
  ) {
    // 1. Xác thực giáo viên có quyền quản lý lớp này không
    const targetClass = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!targetClass || targetClass.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác trên lớp học này',
      );
    }

    // 2. Kiểm tra xem học sinh có đang gửi yêu cầu không
    const member = await this.prisma.classMember.findUnique({
      where: { classId_studentId: { classId, studentId } },
    });

    if (!member) {
      throw new NotFoundException(
        'Không tìm thấy dữ liệu học sinh trong lớp này',
      );
    }

    // 3. Cập nhật trạng thái (Duyệt thành ACTIVE hoặc Từ chối thành REJECTED)
    return this.prisma.classMember.update({
      where: { classId_studentId: { classId, studentId } },
      data: { status: newStatus },
      include: {
        student: { select: { name: true, email: true } }, // Trả về kèm tên HS để FE dễ hiển thị
      },
    });
  }

  async getStudentClasses(studentId: string) {
    return this.prisma.classMember.findMany({
      where: { studentId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            teacher: { select: { name: true } }, // Lấy thêm tên giáo viên để hiển thị UI
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async getClassMembers(teacherId: string, classId: string) {
    const targetClass = await this.prisma.class.findUnique({
      where: { id: classId, isDeleted: false },
    });

    if (!targetClass || targetClass.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    return this.prisma.classMember.findMany({
      where: { classId },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  // ---------------------------------------------------------
  // [TEACHER] Đổi tên lớp học
  // ---------------------------------------------------------
  async updateClassName(teacherId: string, classId: string, newName: string) {
    const targetClass = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    // Xác thực quyền sở hữu và lớp chưa bị xóa
    if (
      !targetClass ||
      targetClass.teacherId !== teacherId ||
      targetClass.isDeleted
    ) {
      throw new NotFoundException('Không tìm thấy lớp học hợp lệ');
    }

    return this.prisma.class.update({
      where: { id: classId },
      data: { name: newName },
    });
  }

  // ---------------------------------------------------------
  // [TEACHER] Xóa (kick) học sinh khỏi lớp
  // ---------------------------------------------------------
  async removeStudent(teacherId: string, classId: string, studentId: string) {
    // 1. Xác thực quyền giáo viên đối với lớp này
    const targetClass = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!targetClass || targetClass.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác trên lớp học này',
      );
    }

    // 2. Kiểm tra xem học sinh có nằm trong danh sách lớp không
    const member = await this.prisma.classMember.findUnique({
      where: { classId_studentId: { classId, studentId } },
    });

    if (!member) {
      throw new NotFoundException('Học sinh này không có trong danh sách lớp');
    }

    // 3. Xóa quyền truy cập (Xóa bản ghi trong bảng ClassMember)
    // Dữ liệu làm bài (Attempt) của học sinh vẫn được giữ lại nhờ cấu trúc schema
    return this.prisma.classMember.delete({
      where: { classId_studentId: { classId, studentId } },
    });
  }

  // ---------------------------------------------------------
  // [TEACHER] Lấy thống kê tổng quan cho Dashboard
  // ---------------------------------------------------------
  async getTeacherDashboard(teacherId: string) {
    // 1. Tổng số lớp học
    const totalClasses = await this.prisma.class.count({
      where: { teacherId, isDeleted: false },
    });

    // 2. Tổng số học sinh duy nhất (không tính trùng)
    const uniqueStudents = await this.prisma.classMember.findMany({
      where: {
        class: { teacherId, isDeleted: false },
        status: 'ACTIVE',
      },
      distinct: ['studentId'],
    });
    const totalStudents = uniqueStudents.length;

    // 3. Số bài test đang Active
    const now = new Date();
    const activeTests = await this.prisma.quiz.count({
      where: {
        class: { teacherId, isDeleted: false },
        // ĐÃ XÓA isDeleted: false ở đây vì model Quiz không có cột này
        OR: [{ deadline: { gt: now } }, { deadline: null }],
      },
    });

    // 4. Danh sách 5 bài Test tạo gần đây nhất
    const recentQuizzes = await this.prisma.quiz.findMany({
      where: {
        class: { teacherId, isDeleted: false },
        // ĐÃ XÓA isDeleted: false ở đây
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        class: {
          select: {
            name: true,
            _count: {
              select: { members: { where: { status: 'ACTIVE' } } },
            },
          },
        },
        _count: { select: { attempts: true } },
      },
    });

    return {
      totalClasses,
      totalStudents,
      activeTests,
      recentQuizzes,
    };
  }
}
