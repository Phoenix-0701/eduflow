"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { classService } from "@/src/services/class.service";
import { quizService } from "@/src/services/quiz.service";

export default function StudentClassDetailPage() {
  const params = useParams<{ id: string }>();
  const classId = params.id as string;

  const [classDetail, setClassDetail] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Lấy thông tin chi tiết của lớp học
        const classRes = await classService.getStudentClasses();
        const classList = Array.isArray(classRes)
          ? classRes
          : classRes?.data || [];
        const currentClass = classList.find((c: any) => c.classId === classId);
        setClassDetail(currentClass?.class);

        // 2. Lấy danh sách bài Quiz (Đã bao gồm attempts nhờ API mới sửa)
        const quizRes = await quizService.getQuizzesByClass(classId);
        const quizList = Array.isArray(quizRes) ? quizRes : quizRes?.data || [];
        setQuizzes(quizList);
      } catch (error) {
        console.error("Lỗi tải dữ liệu chi tiết lớp", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  // Tính toán tiến độ
  const totalQuizzes = quizzes.length;
  const completedQuizzes = quizzes.filter(
    (q) => q.attempts && q.attempts.length > 0 && q.attempts[0].submittedAt,
  ).length;
  const progressPercent =
    totalQuizzes === 0
      ? 0
      : Math.round((completedQuizzes / totalQuizzes) * 100);

  // Format Deadline
  const formatDeadline = (dateString: string) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper sinh màu ngẫu nhiên cho cover lớp học
  const getCoverColor = () =>
    "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)";

  if (loading) {
    return (
      <div className="flex-1 p-8 max-w-7xl mx-auto animate-pulse">
        Loading class details...
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="flex-1 p-8 text-center text-on-surface-variant">
        The class does not exist or you have not been approved to join this
        class.
      </div>
    );
  }

  return (
    <main className="flex-1 w-full p-4 md:p-8 max-w-[1280px] mx-auto transition-all duration-300">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex text-on-surface-variant text-[12px] font-medium mb-6"
      >
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <Link
              href="/student/classes"
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
              <span className="text-on-surface font-semibold">
                {classDetail.name}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[24px] md:text-[32px] font-bold text-on-surface mb-1">
          {classDetail.name}
        </h1>
        <p className="text-[16px] text-on-surface-variant">
          Quizzes & Assessments
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Col: Course Progress Card */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col justify-between sticky top-24">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-semibold text-on-surface">
                Course Progress
              </h3>
              <span className="material-symbols-outlined text-primary">
                monitoring
              </span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2 mb-1 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-[12px] font-medium text-on-surface-variant text-right">
              {progressPercent}% Completed
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant">
            <p className="text-[10px] font-semibold text-outline uppercase tracking-wider mb-2">
              Instructor
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">
                {classDetail.teacher?.name?.charAt(0) || "T"}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-on-surface">
                  {classDetail.teacher?.name || "Unknown Teacher"}
                </p>
                <p className="text-[12px] text-on-surface-variant">Educator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Quiz List */}
        <div className="md:col-span-8 flex flex-col gap-4">
          {quizzes.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant">
              The teacher has not created any quizzes for this class.
            </div>
          ) : (
            quizzes.map((quiz) => {
              const attempt = quiz.attempts?.[0];
              const isCompleted = !!attempt?.submittedAt;
              const isUrgent =
                !isCompleted &&
                quiz.deadline &&
                new Date(quiz.deadline).getTime() - new Date().getTime() <
                  24 * 60 * 60 * 1000;

              return (
                <div
                  key={quiz.id}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 hover:shadow-md transition-shadow duration-300 group flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted
                          ? "bg-secondary-container/30 text-secondary group-hover:bg-secondary group-hover:text-white"
                          : isUrgent
                            ? "bg-error-container text-error"
                            : "bg-primary-container/20 text-primary group-hover:bg-primary group-hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {isCompleted ? "fact_check" : "assignment"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-[18px] font-semibold text-on-surface mb-1 leading-tight">
                        {quiz.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-on-surface-variant">
                        {isCompleted ? (
                          <>
                            <span className="flex items-center gap-1 font-medium text-secondary">
                              <span className="material-symbols-outlined text-[16px]">
                                check_circle
                              </span>{" "}
                              Completed
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <span className="material-symbols-outlined text-[16px]">
                                grade
                              </span>{" "}
                              Score:{" "}
                              {attempt.score !== null ? attempt.score : "?"}/10
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">
                                schedule
                              </span>{" "}
                              {quiz.duration} Mins
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">
                                format_list_bulleted
                              </span>{" "}
                              {quiz._count?.questions || 0} Questions
                            </span>
                            <span
                              className={`flex items-center gap-1 ${isUrgent ? "text-error font-medium" : ""}`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                event
                              </span>
                              {quiz.deadline
                                ? `Due ${formatDeadline(quiz.deadline)}`
                                : "No deadline"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
                    {isCompleted ? (
                      <button className="w-full md:w-auto px-6 py-2.5 bg-transparent border border-outline text-on-surface font-semibold text-[14px] rounded-lg hover:bg-surface-container-high transition-colors">
                        Review Results
                      </button>
                    ) : (
                      <Link
                        href={"/student/quizzes/" + quiz.id}
                        className="block text-center w-full md:w-auto px-6 py-2.5 bg-primary text-white font-semibold text-[14px] rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        Take Quiz
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
