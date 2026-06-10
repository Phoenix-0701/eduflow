"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { quizService } from "@/src/services/quiz.service";

export default function PreTestPage() {
  const params = useParams<{ id: string }>();
  const quizId = params.id as string;
  const router = useRouter();

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;

    const fetchQuizDetails = async () => {
      try {
        const res = await quizService.getQuizById(quizId);
        setQuiz(res.data);
      } catch (error) {
        console.error("Lỗi khi tải thông tin bài kiểm tra", error);
        alert("Không thể tải thông tin bài kiểm tra.");
        router.push("/student/classes"); // Lỗi thì back về list classes
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId, router]);

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

  if (loading) {
    return (
      <div className="flex-1 p-8 text-center animate-pulse">
        Loading test details...
      </div>
    );
  }

  if (!quiz) return null;

  // Tính toán số lần làm bài
  const attemptsCount = quiz.attempts?.length || 0;
  const remainingAttempts = quiz.maxAttempt - attemptsCount;
  const canTakeTest =
    remainingAttempts > 0 &&
    (!quiz.deadline || new Date(quiz.deadline) > new Date());

  return (
    <main className="flex-1 w-full p-4 md:p-8 max-w-[1280px] mx-auto transition-all duration-300">
      <div className="max-w-4xl mx-auto mt-4 md:mt-8">
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
                <Link
                  href={`/student/classes/${quiz.classId}`}
                  className="hover:text-primary transition-colors"
                >
                  {quiz.class?.name}
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-[16px] mx-1">
                  chevron_right
                </span>
                <span className="text-on-surface font-semibold">
                  Assessment
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-[24px] md:text-[32px] font-bold text-on-surface mb-1">
            {quiz.title}
          </h1>
          <p className="text-[16px] text-on-surface-variant">
            Quizzes & Assessments
          </p>
        </div>

        {/* Centralized Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="p-6 border-b border-outline-variant flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-secondary-container text-on-secondary-container font-semibold text-[12px] mb-2 uppercase tracking-wide">
                <span className="material-symbols-outlined text-[14px]">
                  assignment
                </span>
                Assessment Detail
              </div>
              <h1 className="text-[24px] font-bold text-on-surface leading-tight">
                {quiz.title}
              </h1>
            </div>
          </div>

          {/* Card Body (Stats & Notes) */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-outline-variant bg-surface-bright">
            {/* Stats Grid */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant flex flex-col">
                <span className="material-symbols-outlined text-outline mb-2">
                  schedule
                </span>
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  Duration
                </span>
                <span className="text-[24px] font-bold text-on-surface mt-1">
                  {quiz.duration}{" "}
                  <span className="text-[16px] font-normal">mins</span>
                </span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant flex flex-col">
                <span className="material-symbols-outlined text-outline mb-2">
                  restart_alt
                </span>
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  Attempts
                </span>
                <span className="text-[24px] font-bold text-on-surface mt-1">
                  {quiz.maxAttempt}{" "}
                  <span className="text-[16px] text-on-surface-variant font-normal">
                    Allowed
                  </span>
                </span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant flex flex-col">
                <span className="material-symbols-outlined text-outline mb-2">
                  fact_check
                </span>
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  Questions
                </span>
                <span className="text-[24px] font-bold text-on-surface mt-1">
                  {quiz._count?.questions || 0}
                </span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant flex flex-col">
                <span className="material-symbols-outlined text-outline mb-2">
                  event
                </span>
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  Deadline
                </span>
                <span className="text-[16px] font-bold text-error mt-2">
                  {formatDate(quiz.deadline)}
                </span>
              </div>
            </div>

            {/* Teacher's Note */}
            <div className="bg-surface-container p-5 rounded-lg flex flex-col border border-outline-variant h-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary">
                  info
                </span>
                <h3 className="font-semibold text-sm text-on-surface">
                  Instructor's Note
                </h3>
              </div>
              <p className="text-[14px] text-on-surface-variant italic leading-relaxed whitespace-pre-line">
                {quiz.note ||
                  "The teacher has not left any notes for this quiz."}
              </p>
            </div>
          </div>

          {/* History Section */}
          <div className="p-6">
            <h3 className="text-[18px] font-bold text-on-surface mb-4">
              Attempt History
            </h3>

            {attemptsCount === 0 ? (
              <div className="text-center py-6 text-on-surface-variant bg-surface-container-lowest border border-outline-variant/50 rounded-lg border-dashed">
                You haven't taken this test yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-outline-variant">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
                      <th className="p-4">Attempt</th>
                      <th className="p-4">Date Completed</th>
                      <th className="p-4">Score</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-on-surface">
                    {quiz.attempts.map((attempt: any, index: number) => {
                      const isSubmitted = !!attempt.submittedAt;
                      return (
                        <tr
                          key={attempt.id}
                          className="border-b border-outline-variant last:border-0 hover:bg-surface-bright transition-colors"
                        >
                          <td className="p-4 font-semibold">
                            Attempt {index + 1}
                          </td>
                          <td className="p-4 text-on-surface-variant">
                            {isSubmitted
                              ? formatDate(attempt.submittedAt)
                              : "Đang làm dở..."}
                          </td>
                          <td className="p-4 font-bold text-primary">
                            {isSubmitted
                              ? `${attempt.score !== null ? attempt.score : "?"}/10`
                              : "-"}
                          </td>
                          <td className="p-4">
                            {isSubmitted ? (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-secondary-container/30 text-secondary font-semibold text-[12px]">
                                Submitted
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-amber-100 text-amber-800 font-semibold text-[12px]">
                                Draft
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {isSubmitted ? (
                              <Link
                                href={`/student/quizzes/${quiz.id}/review`}
                                className="inline-block px-4 py-1.5 rounded-lg border border-outline-variant text-on-surface font-semibold text-[12px] hover:bg-surface-container-low transition-colors"
                              >
                                Review
                              </Link>
                            ) : (
                              <Link
                                href={`/student/quizzes/${quiz.id}/take`}
                                className="inline-block px-4 py-1.5 rounded-lg border border-primary text-primary font-semibold text-[12px] hover:bg-primary-container hover:text-on-primary-container transition-colors"
                              >
                                Resume
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CTA Footer */}
          <div className="p-6 border-t border-outline-variant bg-surface-bright flex flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-on-surface-variant mb-4">
              {remainingAttempts > 0
                ? `You have ${remainingAttempts} attempt(s) remaining. The highest score will be recorded.`
                : "The deadline has passed or you have used all available attempts."}
            </p>

            {canTakeTest ? (
              <Link
                href={`/student/quizzes/${quiz.id}/take`}
                className="bg-primary text-white font-bold text-[14px] px-8 py-4 rounded-full shadow-sm hover:bg-primary/90 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                {attemptsCount === 0
                  ? "Start Quiz"
                  : `Start Attempt ${attemptsCount + 1}`}
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </Link>
            ) : (
              <button
                disabled
                className="bg-surface-variant text-outline font-bold text-[14px] px-8 py-4 rounded-full flex items-center gap-2 cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">
                  lock
                </span>
                The deadline has passed or you have used all available attempts
              </button>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href={`/student/classes/${quiz.classId}`}
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              arrow_back
            </span>
            Return to Course Overview
          </Link>
        </div>
      </div>
    </main>
  );
}
