"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { quizService } from "@/src/services/quiz.service";

export default function QuizReviewPage() {
  const params = useParams<{ id: string }>();
  const quizId = params.id as string;
  const router = useRouter();

  const [reviewData, setReviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await quizService.getReview(quizId);
        setReviewData(res.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bài làm", error);
        alert("Không thể tải chi tiết bài làm.");
        router.push("/student/classes");
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [quizId, router]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeTaken = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0m 0s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (loading)
    return (
      <div className="flex-1 p-8 text-center animate-pulse">
        Loading review details...
      </div>
    );
  if (!reviewData) return null;

  const {
    quizTitle,
    className,
    showPoint,
    score,
    timeTaken,
    submittedAt,
    questions,
  } = reviewData;

  return (
    <main className="flex-1 w-full p-4 md:p-8 max-w-[1280px] mx-auto transition-all duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Action */}
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-primary font-semibold text-[14px] hover:text-primary-container transition-colors group"
          >
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            Back to Class
          </button>
        </div>

        {/* Review Header Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-secondary-container/20 text-secondary border border-secondary-container/50 px-3 py-1 rounded-full font-semibold text-[12px] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  check_circle
                </span>{" "}
                Submitted
              </span>
              <span className="text-on-surface-variant text-[14px]">
                on {formatDate(submittedAt)}
              </span>
            </div>
            <h2 className="text-[24px] md:text-[32px] font-bold text-on-surface leading-tight">
              {quizTitle}
            </h2>
            <p className="text-on-surface-variant font-medium mt-1">
              {className}
            </p>
          </div>

          {/* Cột điểm số - Ẩn nếu giáo viên không cho xem điểm */}
          <div className="flex gap-8 w-full md:w-auto bg-surface p-4 rounded-lg border border-outline-variant">
            {showPoint ? (
              <div className="text-center">
                <p className="text-[12px] font-semibold text-on-surface-variant uppercase mb-1">
                  Score
                </p>
                <p className="text-[24px] font-bold text-primary">
                  {score}
                  <span className="text-on-surface-variant text-[16px] font-normal">
                    /10
                  </span>
                </p>
              </div>
            ) : (
              <div className="text-center flex flex-col justify-center">
                <p className="text-[12px] font-semibold text-on-surface-variant uppercase mb-1">
                  Score
                </p>
                <span className="material-symbols-outlined text-outline">
                  visibility_off
                </span>
              </div>
            )}
            <div className="w-px bg-outline-variant"></div>
            <div className="text-center">
              <p className="text-[12px] font-semibold text-on-surface-variant uppercase mb-1">
                Time Taken
              </p>
              <p className="text-[24px] font-bold text-on-surface">
                {formatTimeTaken(timeTaken)}
              </p>
            </div>
          </div>
        </div>

        {/* Cảnh báo nếu không được xem điểm */}
        {!showPoint && (
          <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant text-on-surface-variant text-[14px] flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">info</span>
            The teacher has hidden the quiz results. Below are the answers you
            selected.
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((q: any, idx: number) => {
            const isQCorrect = q.isCorrect;
            // Nếu không show point, mặc định màu xám (không check đúng sai)
            let qStatusClass =
              "bg-surface-container text-on-surface-variant border-outline-variant";
            let qStatusIcon = "";
            let qStatusText = "";

            if (showPoint) {
              if (isQCorrect === true) {
                qStatusClass =
                  "bg-secondary-container/10 text-secondary border-secondary/20";
                qStatusIcon = "check_circle";
                qStatusText = "Correct";
              } else if (isQCorrect === false) {
                qStatusClass =
                  "bg-error-container/20 text-error border-error/20";
                qStatusIcon = "cancel";
                qStatusText = "Incorrect";
              }
            }

            return (
              <div
                key={q.id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  {/* Tiêu đề câu hỏi */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-[14px] text-on-surface-variant shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-[18px] text-on-surface font-medium whitespace-pre-line">
                        {q.content}
                      </p>
                    </div>

                    {/* Badge Đúng/Sai (Chỉ hiện nếu showPoint = true) */}
                    {showPoint && qStatusText && (
                      <div
                        className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded font-semibold text-[12px] ${qStatusClass}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {qStatusIcon}
                        </span>
                        {qStatusText}
                      </div>
                    )}
                  </div>

                  {/* Danh sách đáp án */}
                  <div className="space-y-3 pl-12">
                    {q.options.map((opt: any, oIdx: number) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      const isSelected = q.studentAnswer === opt.id;
                      const isCorrectAnswer = opt.isCorrect === true; // Chỉ có khi showPoint = true

                      // Logic render giao diện từng cục Option
                      let optClass =
                        "border-outline-variant bg-surface opacity-60";
                      let letterClass =
                        "border-outline-variant text-on-surface-variant";
                      let rightIcon = null;

                      if (showPoint) {
                        if (isSelected && isCorrectAnswer) {
                          // HS chọn đúng
                          optClass =
                            "border-secondary bg-secondary-container/5 border-2 shadow-sm opacity-100";
                          letterClass =
                            "border-secondary bg-secondary text-white";
                          rightIcon = (
                            <span className="material-symbols-outlined text-secondary">
                              check
                            </span>
                          );
                        } else if (isSelected && !isCorrectAnswer) {
                          // HS chọn sai
                          optClass =
                            "border-error bg-error-container/10 border-2 shadow-sm opacity-100";
                          letterClass = "border-error bg-error text-white";
                          rightIcon = (
                            <span className="text-error font-semibold text-[12px] flex items-center gap-1">
                              Your Answer{" "}
                              <span className="material-symbols-outlined text-[16px]">
                                close
                              </span>
                            </span>
                          );
                        } else if (!isSelected && isCorrectAnswer) {
                          // Đáp án đúng (mà HS không chọn)
                          optClass =
                            "border-secondary bg-secondary-container/5 border shadow-sm opacity-100";
                          letterClass = "border-secondary text-secondary";
                          rightIcon = (
                            <span className="text-secondary font-semibold text-[12px] flex items-center gap-1">
                              Correct Answer{" "}
                              <span className="material-symbols-outlined text-[16px]">
                                check
                              </span>
                            </span>
                          );
                        }
                      } else {
                        // Trạng thái không chấm điểm
                        if (isSelected) {
                          optClass =
                            "border-primary bg-primary-container/5 border-2 shadow-sm opacity-100";
                          letterClass = "border-primary bg-primary text-white";
                          rightIcon = (
                            <span className="text-primary font-semibold text-[12px]">
                              Your Answer
                            </span>
                          );
                        }
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-3 p-4 rounded-lg transition-colors relative overflow-hidden ${optClass}`}
                        >
                          {isSelected && (
                            <div
                              className={`absolute left-0 top-0 bottom-0 w-1 ${showPoint ? (isCorrectAnswer ? "bg-secondary" : "bg-error") : "bg-primary"}`}
                            ></div>
                          )}
                          <div
                            className={`w-6 h-6 rounded-full border flex items-center justify-center font-semibold text-[12px] shrink-0 transition-colors ${letterClass}`}
                          >
                            {letter}
                          </div>
                          <span
                            className={`text-[16px] flex-1 ${isSelected ? "font-medium" : ""}`}
                          >
                            {opt.content}
                          </span>
                          {rightIcon}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-8 pb-12 flex justify-center">
          <Link
            href="/student"
            className="bg-primary text-white font-semibold text-[14px] px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
