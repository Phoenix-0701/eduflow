"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { classService } from "@/src/services/class.service";

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      fetchClasses(); // Tự động load lại trang để thấy lớp vừa xin vào (trạng thái Pending)
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Lỗi: Không thể tham gia lớp này.",
      );
    } finally {
      setIsJoining(false);
    }
  };

  // Phân loại lớp
  const activeClasses = classes.filter((c) => c.status === "ACTIVE");
  const pendingClasses = classes.filter(
    (c) => c.status === "PENDING" || c.status === "REJECTED",
  );

  // Các background ngẫu nhiên cho Card đỡ trống trải
  const bgGradients = [
    "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
  ];

  return (
    <main className="flex-1 p-4 md:p-8 max-w-[1280px] mx-auto w-full flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
          Join Class
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-on-surface-variant animate-pulse">
          Đang tải danh sách lớp...
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm">
          <span className="material-symbols-outlined text-[48px] mb-4 opacity-30">
            school
          </span>
          <h3 className="text-lg font-bold text-on-surface mb-2">
            Bạn chưa tham gia lớp học nào
          </h3>
          <p>Hãy nhấn nút "Join Class" và nhập mã do giáo viên cung cấp nhé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Render Active Classes */}
          {activeClasses.map((item, idx) => (
            <article
              key={item.classId}
              className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col h-full cursor-pointer"
            >
              <div
                className="h-32 relative overflow-hidden"
                style={{ background: bgGradients[idx % bgGradients.length] }}
              >
                <div className="absolute inset-0 opacity-20 mix-blend-multiply bg-black"></div>
                <div className="absolute top-3 right-3 bg-white/20 text-white font-semibold text-[12px] px-2 py-1 rounded-md backdrop-blur-md flex items-center gap-1 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>{" "}
                  Active
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h2
                  className="text-[18px] font-bold text-on-surface mb-1 line-clamp-2"
                  title={item.class.name}
                >
                  {item.class.name}
                </h2>
                <div className="flex items-center gap-2 text-on-surface-variant mb-6 text-sm font-medium">
                  <span className="material-symbols-outlined text-[16px]">
                    person
                  </span>
                  {item.class.teacher.name}
                </div>
                <div className="mt-auto">
                  <Link
                    href={`/student/classes/${item.classId}`}
                    className="block w-full text-center bg-transparent border border-outline-variant text-primary font-semibold text-[14px] py-2 rounded-lg hover:bg-surface-container-low transition-colors"
                  >
                    Enter Class
                  </Link>
                </div>
              </div>
            </article>
          ))}

          {/* Render Pending Classes */}
          {pendingClasses.map((item, idx) => (
            <article
              key={item.classId}
              className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden shadow-sm flex flex-col h-full opacity-70 grayscale-[30%]"
            >
              <div className="h-32 bg-surface-variant relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-surface/40 backdrop-blur-[2px]"></div>
                <div className="relative z-10 bg-surface-container-lowest text-on-surface-variant font-semibold text-[14px] px-4 py-2 rounded-full flex items-center gap-2 border border-outline-variant shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">
                    {item.status === "REJECTED" ? "block" : "hourglass_empty"}
                  </span>
                  {item.status === "REJECTED"
                    ? "Bị từ chối"
                    : "Pending Approval"}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h2
                  className="text-[18px] font-bold text-on-surface mb-1 line-clamp-2"
                  title={item.class.name}
                >
                  {item.class.name}
                </h2>
                <div className="flex items-center gap-2 text-on-surface-variant mb-6 text-sm font-medium">
                  <span className="material-symbols-outlined text-[16px]">
                    person
                  </span>
                  {item.class.teacher.name}
                </div>
                <div className="mt-auto">
                  <button
                    className="w-full bg-surface-container border border-surface-variant text-outline font-semibold text-[14px] py-2 rounded-lg cursor-not-allowed"
                    disabled
                  >
                    Enter Class
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
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Content */}
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
              <p className="text-[16px] text-on-surface-variant mb-6">
                Enter the unique{" "}
                <span className="font-bold text-on-surface">Class ID</span>{" "}
                provided by your teacher to request enrollment.
              </p>

              <div className="mb-6">
                <label
                  className="block text-[12px] font-semibold text-on-surface mb-1"
                  htmlFor="class-id"
                >
                  Class ID
                </label>
                <input
                  id="class-id"
                  type="text"
                  required
                  value={classIdToJoin}
                  onChange={(e) => setClassIdToJoin(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-[16px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                  placeholder="e.g., 123e4567-e89b-12d3..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg font-semibold text-[14px] text-on-surface-variant hover:bg-surface-container-low transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining}
                  className="px-6 py-2 rounded-lg font-semibold text-[14px] bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {isJoining ? "Sending..." : "Enroll"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
