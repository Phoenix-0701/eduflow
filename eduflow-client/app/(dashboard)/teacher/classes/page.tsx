"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { classService } from "@/src/services/class.service";

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States cho Pending Approvals Modal
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi song song 2 API: Lấy danh sách lớp & Lấy danh sách chờ duyệt
      const [classRes, pendingRes] = await Promise.all([
        classService.getClasses(),
        classService.getPendingApprovals(),
      ]);

      setClasses(Array.isArray(classRes) ? classRes : classRes?.data || []);
      setPendingMembers(
        Array.isArray(pendingRes) ? pendingRes : pendingRes?.data || [],
      );
    } catch (error) {
      console.error("Lỗi tải dữ liệu", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Xử lý Duyệt / Từ chối học sinh
  const handleUpdateStatus = async (
    classId: string,
    studentId: string,
    status: "ACTIVE" | "REJECTED",
  ) => {
    setIsProcessing(true);
    try {
      await classService.updateMemberStatus(classId, studentId, status);
      // Xóa học sinh đó khỏi danh sách Pending tạm thời trên UI cho mượt
      setPendingMembers((prev) =>
        prev.filter(
          (m) => !(m.classId === classId && m.studentId === studentId),
        ),
      );
      // Cập nhật lại số lượng học sinh trong Class Card
      fetchData();
    } catch (error) {
      alert("Lỗi cập nhật trạng thái!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 max-w-[1280px] mx-auto w-full transition-all duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[24px] md:text-[32px] font-bold text-on-surface mb-1">
            My Classes
          </h1>
          <p className="text-[16px] text-on-surface-variant">
            Manage your teaching classes and students.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* NÚT XEM DANH SÁCH CHỜ DUYỆT */}
          <button
            onClick={() => setIsPendingModalOpen(true)}
            className="relative bg-surface-container-lowest border border-outline-variant text-on-surface font-semibold text-[14px] px-6 py-3 rounded-lg hover:bg-surface-container-low transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              group_add
            </span>
            Pending Requests
            {pendingMembers.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-error text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                {pendingMembers.length}
              </span>
            )}
          </button>

          <button className="bg-primary text-white font-semibold text-[14px] px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
            <span className="material-symbols-outlined text-[18px]">add</span>{" "}
            Create Class
          </button>
        </div>
      </div>

      {/* Class Grid */}
      {loading ? (
        <div className="text-center py-12 animate-pulse text-on-surface-variant">
          Đang tải danh sách lớp...
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/50">
          Chưa có lớp học nào. Hãy tạo mới!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, idx) => {
            const bgGradients = [
              "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
              "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
            ];

            return (
              <div
                key={cls.id}
                className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col h-full"
              >
                <div
                  className="h-24 relative overflow-hidden"
                  style={{ background: bgGradients[idx % bgGradients.length] }}
                >
                  <div className="absolute inset-0 opacity-20 mix-blend-multiply bg-black"></div>
                  <div className="absolute top-3 right-3 bg-white/20 text-white font-semibold text-[12px] px-2 py-1 rounded-md backdrop-blur-md border border-white/30 shadow-sm">
                    Code: {cls.id.substring(0, 8).toUpperCase()}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-[20px] font-bold text-on-surface mb-2">
                    {cls.name}
                  </h2>
                  <div className="flex gap-4 text-on-surface-variant mb-6 text-[14px]">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[16px]">
                        group
                      </span>{" "}
                      {cls._count?.members || 0} Students
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[16px]">
                        quiz
                      </span>{" "}
                      {cls._count?.quizzes || 0} Quizzes
                    </span>
                  </div>
                  <div className="mt-auto">
                    <Link
                      href={`/teacher/classes/${cls.id}`}
                      className="block w-full text-center bg-transparent border border-outline-variant text-primary font-semibold text-[14px] py-2 rounded-lg hover:bg-surface-container-low transition-colors"
                    >
                      Manage Class
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DANH SÁCH CHỜ DUYỆT TỔNG */}
      {isPendingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={() => setIsPendingModalOpen(false)}
          ></div>
          <div className="relative bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/50 w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright rounded-t-xl">
              <h3 className="text-[20px] font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  group_add
                </span>
                Pending Student Approvals
              </h3>
              <button
                className="text-on-surface-variant hover:bg-surface-container-low p-1 rounded-full transition-colors"
                onClick={() => setIsPendingModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {pendingMembers.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] opacity-20 mb-2">
                    done_all
                  </span>
                  <p>Không có học sinh nào đang chờ duyệt.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingMembers.map((member) => (
                    <div
                      key={`${member.classId}-${member.studentId}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-outline-variant rounded-lg bg-surface-container-lowest hover:border-primary/30 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-[16px] text-on-surface">
                          {member.student.name}
                        </p>
                        <p className="text-[14px] text-on-surface-variant">
                          {member.student.email}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded bg-primary-container/10 text-primary text-[12px] font-semibold border border-primary/20">
                          <span className="material-symbols-outlined text-[14px]">
                            school
                          </span>
                          Class: {member.class.name}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          disabled={isProcessing}
                          onClick={() =>
                            handleUpdateStatus(
                              member.classId,
                              member.studentId,
                              "ACTIVE",
                            )
                          }
                          className="px-4 py-2 bg-primary text-white text-[12px] font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          disabled={isProcessing}
                          onClick={() =>
                            handleUpdateStatus(
                              member.classId,
                              member.studentId,
                              "REJECTED",
                            )
                          }
                          className="px-4 py-2 border border-error text-error text-[12px] font-bold rounded-lg hover:bg-error/10 transition-colors disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
