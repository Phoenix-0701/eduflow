"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { quizService } from "@/src/services/quiz.service";

export default function QuizStatisticsPage() {
  const params = useParams<{ id: string }>();
  const quizId = params.id as string;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await quizService.getQuizReport(quizId);
        setReport(res.data);
      } catch (error) {
        console.error("Lỗi khi tải báo cáo", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [quizId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse">Loading statistics...</div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center text-error">Cannot load quiz data.</div>
    );
  }

  const { quiz, stats, distribution, attempts } = report;

  // Tính toán chiều cao tối đa cho biểu đồ (Bar chart logic)
  const maxCount = Math.max(
    ...Object.values(distribution as Record<string, number>),
    1,
  );
  const chartLabels = ["0-2", "3-4", "5-6", "6-7", "7-8", "8-9", "9-10"];

  return (
    <main className="p-4 md:p-8 max-w-[1280px] mx-auto w-full transition-all duration-300">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex text-on-surface-variant text-[12px] font-medium mb-6"
      >
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <Link
              href="/teacher/classes"
              className="hover:text-primary transition-colors"
            >
              Classes
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="material-symbols-outlined text-[16px] mx-1">
                chevron_right
              </span>
              <Link
                href={`/teacher/classes/${quiz.classId}`}
                className="hover:text-primary transition-colors"
              >
                {quiz.className}
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="material-symbols-outlined text-[16px] mx-1">
                chevron_right
              </span>
              <span className="text-on-surface font-semibold">Statistics</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[32px] font-bold text-on-surface">
            {quiz.title}
          </h2>
          <p className="text-[16px] text-on-surface-variant mt-1">
            {quiz.className} • Conducted on {formatDate(quiz.deadline)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 font-semibold text-[14px] transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Quiz
          </button>
        </div>
      </div>

      {/* Stats Overview Bento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col">
          <span className="text-[14px] font-semibold text-on-surface-variant mb-2">
            Average Score
          </span>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-[32px] font-bold text-primary">
              {stats.average}
            </span>
            <span className="text-[14px] text-on-surface-variant">/ 10</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col">
          <span className="text-[14px] font-semibold text-on-surface-variant mb-2">
            Highest Score
          </span>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-[32px] font-bold text-secondary">
              {stats.highest}
            </span>
            <span className="text-[14px] text-on-surface-variant">/ 10</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col">
          <span className="text-[14px] font-semibold text-on-surface-variant mb-2">
            Lowest Score
          </span>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-[32px] font-bold text-error">
              {stats.lowest}
            </span>
            <span className="text-[14px] text-on-surface-variant">/ 10</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col">
          <span className="text-[14px] font-semibold text-on-surface-variant mb-2">
            Completion Rate
          </span>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-[32px] font-bold text-on-surface">
              {stats.completionRate}%
            </span>
            <span className="text-[14px] text-on-surface-variant">
              {stats.uniqueStudentsAttempted}/{stats.totalStudents} students
            </span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-[18px] font-bold text-on-surface mb-6">
          Score Distribution
        </h3>
        <div className="h-64 flex items-end justify-between gap-2 border-b border-outline-variant pb-2 relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[12px] text-on-surface-variant pr-2 border-r border-outline-variant pb-2 w-8 text-right">
            <span>{maxCount}</span>
            <span>{Math.round(maxCount * 0.75)}</span>
            <span>{Math.round(maxCount * 0.5)}</span>
            <span>{Math.round(maxCount * 0.25)}</span>
            <span>0</span>
          </div>

          {/* Chart Bars (Dynamic) */}
          <div className="flex-1 flex items-end justify-around ml-10 h-full">
            {chartLabels.map((label, idx) => {
              const count = distribution[label] || 0;
              const heightPercent = (count / maxCount) * 100;
              return (
                <div
                  key={label}
                  className="w-12 bg-primary/80 hover:bg-primary rounded-t transition-all duration-500 relative group flex items-end"
                  style={{ height: `${Math.max(heightPercent, 2)}%` }} // Tối thiểu 2% để luôn thấy gạch ngang nếu là 0
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[12px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {count} student(s)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-around ml-10 mt-2 text-[12px] font-semibold text-on-surface-variant">
          {chartLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      {/* Student Results Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h3 className="text-[18px] font-bold text-on-surface">
            Student Results
          </h3>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none w-64 bg-surface"
              placeholder="Search students..."
              type="text"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  Student Name
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  Score
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  Submission Time
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {attempts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-on-surface-variant"
                  >
                    Chưa có học sinh nào nộp bài.
                  </td>
                </tr>
              ) : (
                attempts.map((attempt: any, idx: number) => {
                  const colors = [
                    "bg-primary/10 text-primary",
                    "bg-secondary-container text-on-secondary-container",
                    "bg-tertiary-container text-on-tertiary-container",
                    "bg-error-container text-error",
                  ];
                  const avatarColor = colors[idx % colors.length];
                  const scoreColor =
                    attempt.score >= 8
                      ? "bg-secondary-container/20 text-on-secondary-container"
                      : attempt.score >= 5
                        ? "bg-surface-container-highest text-on-surface-variant"
                        : "bg-error-container/50 text-error";

                  return (
                    <tr
                      key={attempt.id}
                      className="hover:bg-surface-container-lowest/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] ${avatarColor}`}
                          >
                            {getInitials(attempt.student?.name)}
                          </div>
                          <span className="text-[14px] text-on-surface font-semibold">
                            {attempt.student?.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold ${scoreColor}`}
                        >
                          {attempt.score} / 10
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[14px] text-on-surface-variant">
                        {formatDate(attempt.submittedAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-primary hover:underline font-semibold text-[14px] transition-colors">
                          View Details
                        </button>
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
