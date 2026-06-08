"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/src/store/useAuthStore";
import { classService } from "@/src/services/class.service";

export default function TeacherDashboard() {
  const user = useAuthStore((state) => state.user);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardInfo = async () => {
      try {
        const res = await classService.getTeacherDashboard();
        // Do TransformInterceptor trả về nằm trong trường .data, API res.data bọc thêm .data nữa
        setDashboardData(res.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardInfo();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getQuizStatus = (deadline: string) => {
    if (!deadline)
      return {
        label: "Active",
        style: "bg-[#10B981]/10 text-[#10B981]",
        dot: "bg-[#10B981]",
      };
    const isEnded = new Date(deadline) < new Date();
    if (isEnded) {
      return {
        label: "Completed",
        style: "bg-surface-variant text-on-surface-variant",
        dot: "bg-outline",
      };
    }
    return {
      label: "Active",
      style: "bg-[#10B981]/10 text-[#10B981]",
      dot: "bg-[#10B981]",
    };
  };

  if (loading) {
    return (
      <main className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-pulse">
        <div className="h-10 bg-surface-variant rounded w-48 mb-2"></div>
        <div className="h-6 bg-surface-variant rounded w-96 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="h-32 bg-surface-variant rounded-xl"></div>
          <div className="h-32 bg-surface-variant rounded-xl"></div>
          <div className="h-32 bg-surface-variant rounded-xl"></div>
        </div>
        <div className="h-64 bg-surface-variant rounded-xl"></div>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-8 max-w-[1280px] mx-auto w-full">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-[24px] md:text-[32px] font-bold text-on-surface tracking-tight">
            Overview
          </h2>
          <p className="text-[16px] text-on-surface-variant mt-1">
            Welcome back, {user?.name || "Teacher"}. Here's what's happening
            today.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">assignment</span>
            </div>
          </div>
          <h3 className="font-semibold text-[14px] text-on-surface-variant mb-1 relative z-10">
            Active Tests
          </h3>
          <p className="font-bold text-[48px] text-on-surface relative z-10 leading-none">
            {dashboardData?.activeTests || 0}
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
              <span className="material-symbols-outlined">class</span>
            </div>
          </div>
          <h3 className="font-semibold text-[14px] text-on-surface-variant mb-1 relative z-10">
            Total Classes
          </h3>
          <p className="font-bold text-[48px] text-on-surface relative z-10 leading-none">
            {dashboardData?.totalClasses || 0}
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6]">
              <span className="material-symbols-outlined">groups</span>
            </div>
          </div>
          <h3 className="font-semibold text-[14px] text-on-surface-variant mb-1 relative z-10">
            Total Students
          </h3>
          <p className="font-bold text-[48px] text-on-surface relative z-10 leading-none">
            {dashboardData?.totalStudents || 0}
          </p>
        </div>
      </div>

      {/* Recent Tests Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-bright">
          <div>
            <h3 className="font-semibold text-[18px] text-on-surface">
              Recent Tests
            </h3>
            <p className="text-[14px] text-on-surface-variant mt-1">
              Manage and track your latest assignments.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="font-semibold text-[12px] text-on-surface-variant px-6 py-4 uppercase tracking-wider w-1/3">
                  Test Name
                </th>
                <th className="font-semibold text-[12px] text-on-surface-variant px-6 py-4 uppercase tracking-wider">
                  Status
                </th>
                <th className="font-semibold text-[12px] text-on-surface-variant px-6 py-4 uppercase tracking-wider hidden sm:table-cell">
                  Duration
                </th>
                <th className="font-semibold text-[12px] text-on-surface-variant px-6 py-4 uppercase tracking-wider hidden md:table-cell">
                  Deadline
                </th>
                <th className="font-semibold text-[12px] text-on-surface-variant px-6 py-4 uppercase tracking-wider">
                  Completion Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
              {dashboardData?.recentQuizzes?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-on-surface-variant"
                  >
                    Chưa có bài kiểm tra nào được tạo.
                  </td>
                </tr>
              ) : (
                dashboardData?.recentQuizzes?.map((quiz: any) => {
                  const status = getQuizStatus(quiz.deadline);
                  const totalMembers = quiz.class?._count?.members || 0;
                  const attempts = quiz._count?.attempts || 0;
                  const completionRate =
                    totalMembers > 0
                      ? Math.round((attempts / totalMembers) * 100)
                      : 0;

                  return (
                    <tr
                      key={quiz.id}
                      className="hover:bg-surface-container/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary-container/10 flex items-center justify-center text-primary hidden sm:flex">
                            <span className="material-symbols-outlined text-[18px]">
                              calculate
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-on-surface">
                              {quiz.title}
                            </div>
                            <div className="text-xs text-on-surface-variant mt-0.5">
                              {quiz.class?.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${status.style}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status.dot}`}
                          ></span>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell text-sm text-on-surface-variant">
                        {quiz.duration} mins
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-sm text-on-surface-variant">
                        {formatDate(quiz.deadline)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-surface-variant rounded-full overflow-hidden max-w-[120px]">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-on-surface-variant w-12">
                            {attempts}/{totalMembers}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
