"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { classService } from "@/src/services/class.service";

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "PENDING">("ACTIVE");

  // States cho Modal Join Class
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classIdToJoin, setClassIdToJoin] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await classService.getStudentClasses();
      const classList = Array.isArray(res) ? res : res?.data || [];
      setClasses(classList);
    } catch (error) {
      console.error("Lỗi khi tải danh sách lớp", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classIdToJoin.trim()) return;

    setIsJoining(true);
    try {
      await classService.joinClass(classIdToJoin.trim());
      alert("Đã gửi yêu cầu tham gia lớp. Vui lòng chờ giáo viên phê duyệt!");
      setIsModalOpen(false);
      setClassIdToJoin("");
      fetchClasses();
      setActiveTab("PENDING"); // Tự động chuyển qua tab chờ duyệt để học sinh xem
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Lỗi: Không thể tham gia lớp này.",
      );
    } finally {
      setIsJoining(false);
    }
  };

  const activeClasses = classes.filter((c) => c.status === "ACTIVE");
  const pendingClasses = classes.filter(
    (c) => c.status === "PENDING" || c.status === "REJECTED",
  );

  const bgGradients = [
    "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
  ];

  return (
    <main className="flex-1 p-4 md:p-8 max-w-[1280px] mx-auto w-full flex flex-col gap-6 transition-all duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant pb-6">
        <div>
          <h1 className="text-[24px] md:text-[32px] font-bold text-on-surface mb-1">
            My Classes
          </h1>
          <p className="text-[16px] text-on-surface-variant">
            Manage your enrolled courses and check pending approvals.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white font-semibold text-[14px] px-6 py-3 rounded-full hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Join a Class
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-6 border-b border-outline-variant">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`pb-4 px-2 border-b-2 font-bold text-[14px] transition-all ${
            activeTab === "ACTIVE"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Active Classes ({activeClasses.length})
        </button>
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`pb-4 px-2 border-b-2 font-bold text-[14px] transition-all flex items-center gap-2 ${
            activeTab === "PENDING"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Pending Requests
          {pendingClasses.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "PENDING" ? "bg-primary text-white" : "bg-error text-white"}`}
            >
              {pendingClasses.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-on-surface-variant animate-pulse">
          Đang tải danh sách lớp...
        </div>
      ) : activeTab === "ACTIVE" ? (
        // HIỂN THỊ ACTIVE CLASSES
        activeClasses.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm">
            <span className="material-symbols-outlined text-[48px] mb-4 opacity-30">
              school
            </span>
            <h3 className="text-lg font-bold text-on-surface mb-2">
              Bạn chưa tham gia lớp học nào
            </h3>
            <p>Hãy nhấn nút "Join a Class" và nhập mã để tham gia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-out]">
            {activeClasses.map((item, idx) => (
              <article
                key={item.classId}
                className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col h-full"
              >
                <div
                  className="h-32 relative overflow-hidden"
                  style={{ background: bgGradients[idx % bgGradients.length] }}
                >
                  <div className="absolute inset-0 opacity-20 mix-blend-multiply bg-black"></div>
                  <div className="absolute top-3 right-3 bg-white/20 text-white font-semibold text-[12px] px-2 py-1 rounded-md backdrop-blur-md">
                    Active
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-[20px] font-bold text-on-surface mb-1 line-clamp-2">
                    {item.class.name}
                  </h2>
                  <div className="flex items-center gap-2 text-on-surface-variant mb-6 text-sm font-medium">
                    <span className="material-symbols-outlined text-[16px]">
                      person
                    </span>{" "}
                    {item.class.teacher.name}
                  </div>
                  <div className="mt-auto">
                    <Link
                      href={`/student/classes/${item.classId}`}
                      className="block w-full text-center bg-primary/10 text-primary font-bold text-[14px] py-2.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                    >
                      Enter Class
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      ) : // HIỂN THỊ PENDING CLASSES
      pendingClasses.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/50 border-dashed">
          Không có yêu cầu tham gia lớp nào đang chờ duyệt.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-out]">
          {pendingClasses.map((item, idx) => (
            <article
              key={item.classId}
              className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden shadow-sm flex flex-col h-full opacity-80"
            >
              <div className="h-32 bg-surface-container-high relative overflow-hidden flex items-center justify-center">
                <div className="relative z-10 bg-white text-on-surface-variant font-bold text-[14px] px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">
                    {item.status === "REJECTED" ? "block" : "hourglass_empty"}
                  </span>
                  {item.status === "REJECTED"
                    ? "Bị từ chối"
                    : "Pending Approval"}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-[20px] font-bold text-on-surface mb-1 line-clamp-2">
                  {item.class.name}
                </h2>
                <div className="flex items-center gap-2 text-on-surface-variant mb-6 text-sm font-medium">
                  <span className="material-symbols-outlined text-[16px]">
                    person
                  </span>{" "}
                  {item.class.teacher.name}
                </div>
                <div className="mt-auto">
                  <button
                    className="w-full bg-surface-container text-outline font-bold text-[14px] py-2.5 rounded-lg cursor-not-allowed"
                    disabled
                  >
                    Waiting for Teacher...
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Join Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
          <div
            className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/50 w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[24px] font-bold text-on-surface">
                Join a Class
              </h3>
              <button
                className="text-on-surface-variant hover:bg-surface-container-low p-1 rounded-full transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleJoinClass}>
              <p className="text-[14px] text-on-surface-variant mb-6">
                Enter the{" "}
                <span className="font-bold text-on-surface text-primary">
                  8-character Class Code
                </span>{" "}
                provided by your teacher to request enrollment.
              </p>

              <div className="mb-6">
                <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Class Code
                </label>
                <input
                  type="text"
                  required
                  value={classIdToJoin}
                  onChange={(e) => setClassIdToJoin(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-[16px] focus:ring-2 focus:ring-primary outline-none transition-shadow font-mono uppercase"
                  placeholder="e.g., 78A84F27"
                  maxLength={36}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg font-bold text-[14px] text-on-surface-variant hover:bg-surface-container-low"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining}
                  className="px-6 py-2 rounded-lg font-bold text-[14px] bg-primary text-white hover:bg-primary/90 shadow-sm disabled:opacity-70"
                >
                  {isJoining ? "Sending..." : "Request to Join"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
