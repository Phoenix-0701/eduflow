"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/src/store/useAuthStore";
import { quizService } from "@/src/services/quiz.service";
import Link from "next/link";

export default function StudentDashboard() {
  const user = useAuthStore((state) => state.user);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardInfo = async () => {
      try {
        const res = await quizService.getStudentDashboard();
        setDashboardData(res.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard Student", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardInfo();
  }, []);

  // Format thời gian hiển thị thân thiện
  const formatDeadline = (dateString: string) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24 && diffHours > 0) {
      return `Due in ${Math.ceil(diffHours)} hours`;
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  const upcomingQuizzes = dashboardData?.upcomingQuizzes || [];
  const recentAttempts = dashboardData?.recentAttempts || [];

  return (
    <main className="p-4 md:p-8 max-w-[1280px] mx-auto w-full flex flex-col gap-8">
      {/* Banner */}
      <section className="relative w-full rounded-xl overflow-hidden bg-primary border border-outline-variant/30 flex items-center p-8 min-h-[160px] shadow-sm">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at right, var(--tw-colors-primary-container) 0%, transparent 60%)",
          }}
        ></div>
        <div className="relative z-10 flex flex-col gap-2">
          <h1 className="text-[24px] md:text-[32px] font-bold text-white">
            Have a nice day, {user?.name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-[16px] text-white/80 max-w-2xl">
            You have {upcomingQuizzes.length} upcoming quizzes. Stay focused,
            you're making great progress this semester.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upcoming Quizzes */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                event_upcoming
              </span>{" "}
              Upcoming Quizzes
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {upcomingQuizzes.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant">
                Tuyệt vời! Bạn không có bài kiểm tra nào sắp tới.
              </div>
            ) : (
              upcomingQuizzes.map((quiz: any) => {
                const isUrgent =
                  new Date(quiz.deadline).getTime() - new Date().getTime() <
                  24 * 60 * 60 * 1000;

                return (
                  <article
                    key={quiz.id}
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isUrgent ? "bg-error-container text-error" : "bg-primary-container/20 text-primary"}`}
                      >
                        <span className="material-symbols-outlined">
                          {isUrgent ? "warning" : "functions"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-[18px] font-semibold text-on-surface leading-tight">
                          {quiz.title}
                        </h3>
                        <p className="text-[14px] text-on-surface-variant">
                          {quiz.class.name} • {quiz.class.teacher.name}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span
                            className={`text-[12px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full ${isUrgent ? "text-error bg-error-container/50" : "text-primary bg-primary-container/20"}`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              schedule
                            </span>{" "}
                            {formatDeadline(quiz.deadline)}
                          </span>
                          <span className="text-[12px] font-semibold text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              timer
                            </span>{" "}
                            {quiz.duration} mins
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Link vào làm bài */}
                    <Link
                      href={`/student/quizzes/${quiz.id}/take`}
                      className="w-full sm:w-auto bg-primary text-white font-semibold text-[14px] px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap text-center"
                    >
                      Take Test
                    </Link>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column: Recent Quizzes */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">
                history
              </span>{" "}
              Recent Quizzes
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {recentAttempts.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant">
                Bạn chưa làm bài kiểm tra nào.
              </div>
            ) : (
              recentAttempts.map((attempt: any) => (
                <article
                  key={attempt.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:border-outline transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <h3 className="text-[16px] font-semibold text-on-surface leading-tight">
                        {attempt.quiz.title}
                      </h3>
                      <p className="text-[14px] text-on-surface-variant">
                        {attempt.quiz.class.name}
                      </p>
                    </div>
                    <span className="bg-surface-container text-on-surface-variant text-[12px] font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        done
                      </span>{" "}
                      Submitted
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                        Score
                      </span>
                      <span className="text-[24px] text-primary font-bold">
                        {attempt.score !== null ? attempt.score : "?"}
                        <span className="text-on-surface-variant text-[14px] font-normal">
                          /10
                        </span>
                      </span>
                    </div>
                    <button className="border border-outline-variant bg-transparent text-primary font-semibold text-[14px] px-4 py-2 rounded-lg hover:bg-surface-container-low transition-colors">
                      View Results
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
