import axiosInstance from "@/src/lib/axios";

export const classService = {
  getClasses: async () => {
    const res = await axiosInstance.get("/classes");
    return res.data;
  },
  createClass: async (name: string) => {
    const res = await axiosInstance.post("/classes", { name });
    return res.data;
  },
  deleteClass: async (id: string) => {
    return await axiosInstance.delete(`/classes/${id}`);
  },
  updateClassName: async (id: string, name: string) => {
    const res = await axiosInstance.patch(`/classes/${id}`, { name });
    return res.data;
  },

  // --- CÁC API MỚI CHO QUẢN LÝ HỌC SINH ---

  // Lấy danh sách học sinh của lớp
  getClassMembers: async (classId: string) => {
    const res = await axiosInstance.get(`/classes/${classId}/members`);
    return res.data;
  },
  // CẬP NHẬT LẠI HÀM NÀY TRONG eduflow-client/src/services/class.service.ts
  addStudent: async (classId: string, email: string) => {
    // Sửa đường dẫn thành /classes/:id/members
    const res = await axiosInstance.post(`/classes/${classId}/members`, {
      email,
    });
    return res.data;
  },
  // Duyệt hoặc Từ chối học sinh (Pending)
  updateMemberStatus: async (
    classId: string,
    studentId: string,
    status: "ACTIVE" | "REJECTED",
  ) => {
    const res = await axiosInstance.patch(
      `/classes/${classId}/members/${studentId}/status`,
      { status },
    );
    return res.data;
  },
  // Đuổi (Kick) học sinh khỏi lớp
  removeStudent: async (classId: string, studentId: string) => {
    const res = await axiosInstance.delete(
      `/classes/${classId}/members/${studentId}`,
    );
    return res.data;
  },

  getTeacherDashboard: async () => {
    const res = await axiosInstance.get("/classes/teacher/dashboard");
    return res.data;
  },

  // [STUDENT] Lấy danh sách lớp đã tham gia hoặc đang chờ duyệt
  getStudentClasses: async () => {
    const res = await axiosInstance.get("/classes/student/me");
    return res.data;
  },

  // [STUDENT] Gửi yêu cầu tham gia lớp bằng Class ID
  joinClass: async (classId: string) => {
    const res = await axiosInstance.post("/classes/join", { classId });
    return res.data;
  },
};
