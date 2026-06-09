"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { classService } from "@/src/services/class.service";
import { quizService } from "@/src/services/quiz.service";

export default function ClassDetailPage() {
  const params = useParams<{ id: string }>();
  const classId = params.id as string;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"QUIZZES" | "STUDENTS">("QUIZZES");
  const [classDetail, setClassDetail] = useState<any>(null);

  // States cho Quizzes
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  // States cho Students
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // State cho Pop-up Thông báo (Toast)
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  // Load Dữ liệu ban đầu
  useEffect(() => {
    if (!classId) return;

    const fetchClassInfoAndQuizzes = async () => {
      setLoadingQuizzes(true);
      try {
        const classRes = await classService.getClasses();
        const classList = Array.isArray(classRes)
          ? classRes
          : classRes?.data || [];
        const currentClass = classList.find((c: any) => c.id === classId);
        setClassDetail(currentClass);

        const quizRes = await quizService.getQuizzesByClass(classId);
        const quizList = Array.isArray(quizRes) ? quizRes : quizRes?.data || [];
        setQuizzes(quizList);
      } catch (error) {
        console.error("Lỗi tải dữ liệu lớp học:", error);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    fetchClassInfoAndQuizzes();
  }, [classId]);

  // Load Dữ liệu học sinh khi chuyển sang tab STUDENTS
  useEffect(() => {
    if (activeTab === "STUDENTS" && classId) {
      fetchMembers();
    }
  }, [activeTab, classId]);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await classService.getClassMembers(classId);
      // 🌟 SỬA LỖI Ở ĐÂY: Fallback an toàn để luôn lấy đúng mảng dữ liệu
      const memberList = Array.isArray(res) ? res : res?.data || [];
      setMembers(memberList);
    } catch (error) {
      console.error("Lỗi tải danh sách học sinh:", error);
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  // --- XỬ LÝ HỌC SINH (STUDENT ACTIONS) ---

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentEmail.trim()) return;

    setIsAddingStudent(true);
    try {
      await classService.addStudent(classId, newStudentEmail);
      // 🌟 SỬA LỖI UI: Dùng pop-up thay vì alert()
      showToast("Đã thêm học sinh vào lớp thành công!", "success");
      setNewStudentEmail("");
      fetchMembers(); // Load lại danh sách
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Không thể thêm học sinh này.",
        "error",
      );
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleUpdateStatus = async (
    studentId: string,
    status: "ACTIVE" | "REJECTED",
  ) => {
    try {
      await classService.updateMemberStatus(classId, studentId, status);
      showToast(
        `Đã ${status === "ACTIVE" ? "duyệt" : "từ chối"} học sinh!`,
        "success",
      );
      fetchMembers(); // Load lại danh sách
    } catch (error: any) {
      showToast("Có lỗi xảy ra khi cập nhật trạng thái.", "error");
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (confirm("Bạn có chắc chắn muốn đuổi học sinh này khỏi lớp?")) {
      try {
        await classService.removeStudent(classId, studentId);
        showToast("Đã xóa học sinh khỏi lớp.", "success");
        fetchMembers();
      } catch (error) {
        showToast("Lỗi khi xóa học sinh.", "error");
      }
    }
  };

  // --- UTILS ---
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Lọc học sinh
  const activeMembers = members.filter((m) => m.status === "ACTIVE");
  const pendingMembers = members.filter((m) => m.status === "PENDING");

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full flex-1 flex flex-col gap-6 relative">
      {/* 🌟 GIAO DIỆN POP-UP TOAST THÔNG BÁO 🌟 */}
      {toast.show && (
        <div
          className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-[fadeIn_0.3s_ease-out] text-white ${toast.type === "success" ? "bg-[#10B981]" : "bg-error"}`}
        >
          <span className="material-symbols-outlined text-[24px]">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-outline-variant">
        <div>
          <h2 className="text-[24px] md:text-[32px] font-bold text-on-surface tracking-tight">
            {classDetail?.name || "Loading..."}
            <span className="text-on-surface-variant font-normal text-lg ml-3">
              #{classId?.substring(0, 8).toUpperCase()}
            </span>
          </h2>
          <p className="text-on-surface-variant mt-1">
            Manage quizzes, assignments, and student progress for this class.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-outline-variant mb-2">
        <nav className="flex gap-6 -mb-px">
          <button
            onClick={() => setActiveTab("QUIZZES")}
            className={`pb-4 px-1 border-b-2 font-semibold text-[14px] flex items-center gap-2 transition-colors ${
              activeTab === "QUIZZES"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${activeTab === "QUIZZES" ? "fill" : ""}`}
            >
              quiz
            </span>
            Quizzes
          </button>
          <button
            onClick={() => setActiveTab("STUDENTS")}
            className={`pb-4 px-1 border-b-2 font-semibold text-[14px] flex items-center gap-2 transition-colors ${
              activeTab === "STUDENTS"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${activeTab === "STUDENTS" ? "fill" : ""}`}
            >
              group
            </span>
            Students
          </button>
        </nav>
      </div>

      {/* TAB CONTENT: QUIZZES */}
      {activeTab === "QUIZZES" && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col animate-[fadeIn_0.3s_ease-in-out]">
          <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-bright">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Search quizzes..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href={`/teacher/classes/${classId}/create-quiz`}
                className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm ml-2 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>{" "}
                Create Test
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="p-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider w-1/3">
                    Quiz Title
                  </th>
                  <th className="p-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="p-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="p-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-sm text-on-surface">
                {loadingQuizzes ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-on-surface-variant"
                    >
                      Đang tải...
                    </td>
                  </tr>
                ) : quizzes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-on-surface-variant"
                    >
                      Chưa có bài kiểm tra nào.
                    </td>
                  </tr>
                ) : (
                  quizzes.map((quiz) => (
                    <tr
                      key={quiz.id}
                      className="hover:bg-surface-container-lowest transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary-container/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[18px]">
                              calculate
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{quiz.title}</p>
                            <p className="text-[12px] text-on-surface-variant">
                              Attempts: {quiz._count?.attempts || 0}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[12px] font-semibold bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>{" "}
                          Active
                        </span>
                      </td>
                      <td className="p-4">{quiz.duration} mins</td>
                      <td className="p-4">{formatDate(quiz.deadline)}</td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/teacher/quizzes/${quiz.id}/report`}
                          className="p-1.5 inline-block text-on-surface-variant hover:text-primary transition-colors rounded hover:bg-surface-container"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            bar_chart
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: STUDENTS */}
      {activeTab === "STUDENTS" && (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
          {/* Add Student Section */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
            <div>
              <h3 className="text-[18px] font-bold text-on-surface">
                Add New Student
              </h3>
              <p className="text-sm text-on-surface-variant mt-1">
                Invite a student to join this class via email.
              </p>
            </div>
            <form
              onSubmit={handleAddStudent}
              className="flex w-full md:w-auto gap-2"
            >
              <div className="relative flex-1 md:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-outline"
                  placeholder="student@school.edu"
                />
              </div>
              <button
                disabled={isAddingStudent}
                type="submit"
                className="px-5 py-2 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-70"
              >
                <span className="material-symbols-outlined text-[18px]">
                  person_add
                </span>
                {isAddingStudent ? "Adding..." : "Add Student"}
              </button>
            </form>
          </section>

          {/* Pending Approvals */}
          {pendingMembers.length > 0 && (
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="p-4 border-b border-error/20 bg-error/5">
                <h3 className="text-sm font-bold text-error">
                  Pending Approvals ({pendingMembers.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface border-b border-outline-variant text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
                      <th className="px-6 py-3">Student</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Request Date</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-on-surface divide-y divide-outline-variant">
                    {pendingMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-surface-container-lowest transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold">
                          {member.student?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          {member.student?.email}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          {formatDate(member.joinedAt)}
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() =>
                              handleUpdateStatus(member.studentId, "ACTIVE")
                            }
                            className="px-3 py-1 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(member.studentId, "REJECTED")
                            }
                            className="px-3 py-1 border border-error text-error rounded-md text-xs font-semibold hover:bg-error/10 transition-colors"
                          >
                            Decline
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Student List Table (Active) */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="text-sm font-bold text-on-surface">
                Student Roster ({activeMembers.length})
              </h3>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">
                  search
                </span>
                <input
                  className="pl-9 pr-4 py-1.5 bg-surface-container-lowest rounded-md border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-48"
                  placeholder="Search students..."
                  type="text"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface border-b border-outline-variant text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Join Date</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-on-surface divide-y divide-outline-variant">
                  {loadingMembers ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-on-surface-variant"
                      >
                        Đang tải danh sách...
                      </td>
                    </tr>
                  ) : activeMembers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-on-surface-variant"
                      >
                        Lớp học chưa có học sinh nào.
                      </td>
                    </tr>
                  ) : (
                    activeMembers.map((member, idx) => {
                      const colors = [
                        "bg-primary/10 text-primary",
                        "bg-secondary-container text-on-secondary-container",
                        "bg-tertiary-container text-on-tertiary-container",
                        "bg-[#F59E0B]/20 text-[#D97706]",
                      ];
                      const avatarColor = colors[idx % colors.length];

                      return (
                        <tr
                          key={member.id}
                          className="hover:bg-surface-container-lowest transition-colors group"
                        >
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${avatarColor}`}
                            >
                              {getInitials(member.student?.name)}
                            </div>
                            <span className="font-semibold text-on-surface">
                              {member.student?.name || "Unknown"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant">
                            {member.student?.email}
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant">
                            {formatDate(member.joinedAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() =>
                                handleRemoveStudent(member.studentId)
                              }
                              title="Kick Student"
                              className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error/10"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                person_remove
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
