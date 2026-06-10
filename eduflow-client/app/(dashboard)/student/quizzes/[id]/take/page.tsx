"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { quizService } from "@/src/services/quiz.service";

export default function TakeQuizPage() {
  const params = useParams<{ id: string }>();
  const quizId = params.id as string;
  const router = useRouter();

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Timer states
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("");

  // 1. TẢI DỮ LIỆU BÀI THI VÀ BẢN NHÁP
  useEffect(() => {
    const initQuiz = async () => {
      try {
        // Lấy chi tiết đề thi
        const quizRes = await quizService.getQuizById(quizId);
        const quizData = quizRes.data;
        setQuiz(quizData);
        setQuestions(quizData.questions || []);

        // Lấy bản nháp (Nếu học sinh đã làm dở)
        const draftRes = await quizService.getDraft(quizId);
        if (draftRes.result) {
          setAnswers(draftRes.result);
        }

        // Thiết lập Timer (Lưu vào localStorage để chống F5 gian lận giờ)
        const storageKey = `quiz_${quizId}_endTime`;
        let endTime = localStorage.getItem(storageKey);

        if (!endTime) {
          // Nếu mới bắt đầu làm, set thời gian kết thúc = Hiện tại + duration
          const newEndTime = Date.now() + quizData.duration * 60 * 1000;
          localStorage.setItem(storageKey, newEndTime.toString());
          setTimeLeft(Math.floor((newEndTime - Date.now()) / 1000));
        } else {
          // Nếu đã có, tính lại thời gian còn lại
          const remaining = Math.floor((parseInt(endTime) - Date.now()) / 1000);
          setTimeLeft(remaining > 0 ? remaining : 0);
        }
      } catch (error) {
        alert(
          "Không thể tải bài thi. Có thể bài đã đóng hoặc bạn hết lượt làm.",
        );
        router.push("/student/classes");
      }
    };
    initQuiz();
  }, [quizId, router]);

  // 2. BỘ ĐẾM GIỜ (TIMER)
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      // HẾT GIỜ -> TỰ ĐỘNG NỘP BÀI
      if (!isSubmitting) handleSubmit();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitting]);

  // Format giây thành MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // 3. XỬ LÝ CHỌN ĐÁP ÁN (Kèm Auto-save)
  const handleSelectOption = async (questionId: string, optionId: string) => {
    const newAnswers = { ...answers, [questionId]: optionId };
    setAnswers(newAnswers);

    // Auto-save lên server
    try {
      await quizService.saveDraft(quizId, newAnswers);
      const now = new Date();
      setLastSaved(
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      );
    } catch (e) {
      console.error("Auto-save failed", e);
    }
  };

  // 4. XỬ LÝ NỘP BÀI
  // 4. XỬ LÝ NỘP BÀI
  const handleSubmit = async () => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn nộp bài không? Hành động này không thể hoàn tác.",
      )
    )
      return;

    setIsSubmitting(true);
    try {
      // 🌟 TÍNH THỜI GIAN LÀM BÀI (BẰNG GIÂY)
      let timeTaken = 0;
      const storageKey = `quiz_${quizId}_endTime`;
      const endTimeStr = localStorage.getItem(storageKey);

      if (endTimeStr && quiz?.duration) {
        const endTime = parseInt(endTimeStr);
        const startTime = endTime - quiz.duration * 60 * 1000;
        timeTaken = Math.floor((Date.now() - startTime) / 1000);

        // Chốt chặn an toàn: Đảm bảo không bị số âm và không lố thời gian cho phép
        if (timeTaken < 0) timeTaken = 0;
        if (timeTaken > quiz.duration * 60) timeTaken = quiz.duration * 60;
      }

      // Truyền timeTaken lên server
      await quizService.submitQuiz(quizId, answers, timeTaken);

      // Xóa timer
      localStorage.removeItem(storageKey);
      alert("Nộp bài thành công!");
      router.push(`/student/quizzes/${quizId}/review`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra khi nộp bài");
      setIsSubmitting(false);
    }
  };

  if (!quiz || questions.length === 0)
    return (
      <div className="fixed inset-0 z-[100] bg-surface flex items-center justify-center font-bold">
        Đang tải đề thi...
      </div>
    );

  const currentQuestion = questions[currentIndex];

  return (
    // Fixed inset-0 z-[100] giúp màn hình này đè lên toàn bộ Sidebar/Topbar của Layout gốc
    <div className="fixed inset-0 z-[100] bg-surface flex flex-col antialiased font-body-md text-on-surface">
      {/* Sticky Topbar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant h-16 flex items-center justify-between px-6 shadow-sm shrink-0">
        <h1 className="font-semibold text-[18px] md:text-[20px] line-clamp-1">
          {quiz.title}
        </h1>

        {/* Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-[14px] ${timeLeft !== null && timeLeft < 300 ? "bg-error-container text-error border-error/50 animate-pulse" : "bg-surface-container-low text-on-surface border-outline-variant"}`}
        >
          <span className="material-symbols-outlined text-[20px]">timer</span>
          {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
        </div>

        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] text-outline font-semibold uppercase">
            Auto-saved
          </span>
          <span className="text-[12px] text-on-surface-variant">
            {lastSaved || "Not saved yet"}
          </span>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Area: Question Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
          <div className="w-full max-w-3xl flex flex-col gap-6">
            {/* Mobile Progress */}
            <div className="lg:hidden w-full bg-surface-container-lowest rounded-lg p-4 border border-outline-variant shadow-sm mb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px] font-semibold text-on-surface-variant uppercase">
                  Progress
                </span>
                <span className="text-[14px] font-bold text-primary">
                  {currentIndex + 1} / {questions.length}
                </span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <span className="text-[18px] font-bold text-primary">
                  Question {currentIndex + 1}
                </span>
              </div>

              <h2 className="text-[20px] md:text-[24px] font-semibold text-on-surface mb-8 leading-relaxed whitespace-pre-line">
                {currentQuestion.content}
              </h2>

              <div className="flex flex-col gap-3">
                {currentQuestion.options.map((opt: any, index: number) => {
                  const isSelected = answers[currentQuestion.id] === opt.id;
                  const letter = String.fromCharCode(65 + index); // A, B, C, D

                  return (
                    <label
                      key={opt.id}
                      className={`group flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary-container/5 shadow-sm"
                          : "border-outline-variant hover:bg-surface-container-low hover:border-outline"
                      }`}
                    >
                      <div className="relative flex items-center justify-center w-6 h-6 mr-4 shrink-0">
                        <input
                          type="radio"
                          name={`q_${currentQuestion.id}`}
                          value={opt.id}
                          checked={isSelected}
                          onChange={() =>
                            handleSelectOption(currentQuestion.id, opt.id)
                          }
                          className="peer sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 transition-all ${isSelected ? "border-primary bg-primary" : "border-outline group-hover:border-primary"}`}
                        ></div>
                        {isSelected && (
                          <div className="absolute w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span
                        className={`font-semibold mr-3 ${isSelected ? "text-primary" : "text-on-surface-variant"}`}
                      >
                        {letter}.
                      </span>
                      <span
                        className={`text-[16px] ${isSelected ? "text-on-surface font-medium" : "text-on-surface-variant group-hover:text-on-surface"}`}
                      >
                        {opt.content}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex justify-between items-center mt-4 pt-6 border-t border-outline-variant">
              <button
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                disabled={currentIndex === 0}
                className="px-6 py-3 rounded-lg border border-outline-variant text-on-surface-variant font-semibold hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">
                  arrow_back
                </span>{" "}
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
                >
                  Next{" "}
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_forward
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-lg bg-error text-white font-bold hover:bg-error/90 transition-transform hover:-translate-y-0.5 shadow-md flex items-center gap-2"
                >
                  {isSubmitting ? "Submitting..." : "Submit Attempt"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Navigator (Desktop Only) */}
        <aside className="hidden lg:flex flex-col w-80 shrink-0 border-l border-outline-variant bg-surface-container-lowest shadow-sm h-full">
          <div className="p-6 border-b border-outline-variant">
            <h3 className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">
              Question Navigator
            </h3>
            <div className="flex items-center gap-4 text-[12px] font-medium text-outline">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-primary/20 border border-primary"></span>{" "}
                Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-surface border border-outline-variant"></span>{" "}
                Unanswered
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-5 gap-3">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = currentIndex === idx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`aspect-square rounded-md font-bold text-[14px] flex items-center justify-center transition-all 
                      ${isCurrent ? "ring-2 ring-offset-2 ring-primary" : ""} 
                      ${isAnswered ? "border border-primary bg-primary/10 text-primary" : "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low"}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button in Sidebar */}
          <div className="p-6 border-t border-outline-variant bg-surface-bright">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-on-surface text-surface-container-lowest font-bold text-[16px] hover:bg-on-surface/90 transition-transform hover:-translate-y-0.5 shadow-md disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit Attempt"}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
