"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { quizService } from "@/src/services/quiz.service";

// Định nghĩa Type cho State
type Option = { id: string; content: string; isCorrect: boolean };
type Question = { id: string; content: string; options: Option[] };

export default function CreateQuizPage() {
  const params = useParams<{ id: string }>();
  const classId = params.id;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FORM STATES ---
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState<number>(45);
  const [maxAttempt, setMaxAttempt] = useState<number>(1);
  const [deadline, setDeadline] = useState("");
  const [showPoint, setShowPoint] = useState(true);
  const [note, setNote] = useState("");

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      content: "",
      options: [
        { id: "o1", content: "", isCorrect: true },
        { id: "o2", content: "", isCorrect: false },
        { id: "o3", content: "", isCorrect: false },
        { id: "o4", content: "", isCorrect: false },
      ],
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // --- XỬ LÝ CÂU HỎI & ĐÁP ÁN (MANUAL) ---
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q${Date.now()}`,
        content: "",
        options: [
          { id: `o1-${Date.now()}`, content: "", isCorrect: true },
          { id: `o2-${Date.now()}`, content: "", isCorrect: false },
        ],
      },
    ]);
  };

  const removeQuestion = (qId: string) => {
    setQuestions(questions.filter((q) => q.id !== qId));
  };

  const updateQuestionContent = (qId: string, content: string) => {
    setQuestions(questions.map((q) => (q.id === qId ? { ...q, content } : q)));
  };

  const addOption = (qId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            options: [
              ...q.options,
              { id: `o-${Date.now()}`, content: "", isCorrect: false },
            ],
          };
        }
        return q;
      }),
    );
  };

  const removeOption = (qId: string, optId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          return { ...q, options: q.options.filter((o) => o.id !== optId) };
        }
        return q;
      }),
    );
  };

  const updateOptionContent = (qId: string, optId: string, content: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            options: q.options.map((o) =>
              o.id === optId ? { ...o, content } : o,
            ),
          };
        }
        return q;
      }),
    );
  };

  const setCorrectOption = (qId: string, optId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            options: q.options.map((o) => ({
              ...o,
              isCorrect: o.id === optId,
            })),
          };
        }
        return q;
      }),
    );
  };

  // --- XỬ LÝ AI IMPORT ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      return alert("Chỉ hỗ trợ file PDF!");
    }
    if (file.size > 5 * 1024 * 1024) {
      return alert("File không được vượt quá 5MB!");
    }

    try {
      setIsGenerating(true);
      setError("");

      // Gọi API sang Backend
      const response = await quizService.generateQuestionsByAI(file);

      // 🌟 SỬA LỖI TẠI ĐÂY: Fallback mảng an toàn (Vì response đã là mảng rồi)
      const aiQuestions = Array.isArray(response)
        ? response
        : response?.data || [];

      if (!aiQuestions || aiQuestions.length === 0) {
        throw new Error("AI không tìm thấy câu hỏi nào trong tài liệu này.");
      }

      // Map dữ liệu AI trả về thành State của React
      const mappedQuestions = aiQuestions.map((aiQ: any, qIndex: number) => ({
        id: `ai-q-${Date.now()}-${qIndex}`,
        content: aiQ.content,
        options: aiQ.options.map((aiOpt: any, oIndex: number) => ({
          id: `ai-o-${Date.now()}-${qIndex}-${oIndex}`,
          content: aiOpt.content,
          isCorrect: aiOpt.isCorrect,
        })),
      }));

      // Chèn thêm câu hỏi AI vào danh sách hiện tại
      const isInitialEmpty =
        questions.length === 1 &&
        questions[0].content.trim() === "" &&
        questions[0].options.every((opt: any) => opt.content.trim() === "");

      if (isInitialEmpty) {
        // Nếu chỉ có 1 câu và đang trống -> GHI ĐÈ toàn bộ bằng list của AI
        setQuestions(mappedQuestions);
      } else {
        // Nếu giáo viên đã soạn sẵn vài câu -> NỐI TIẾP list của AI vào bên dưới
        setQuestions([...questions, ...mappedQuestions]);
      }
    } catch (err: any) {
      console.error("LỖI FE:", err);
      // Hiển thị lỗi chi tiết nếu có
      setError(
        err.response?.data?.message ||
          err.message ||
          "Lỗi khi AI đọc file. Vui lòng thử lại.",
      );
    } finally {
      setIsGenerating(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  // --- LƯU BÀI THI VÀO DATABASE ---
  const handleSaveTest = async () => {
    if (!title) return setError("Vui lòng nhập tên bài kiểm tra!");
    if (!deadline) return setError("Vui lòng chọn thời hạn (Deadline)!");
    if (questions.length === 0)
      return setError("Bài kiểm tra phải có ít nhất 1 câu hỏi!");

    // Validate: Đảm bảo câu hỏi nào cũng có nội dung và có 1 đáp án đúng
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].content)
        return setError(`Câu ${i + 1} chưa có nội dung!`);
      const hasCorrect = questions[i].options.some((o) => o.isCorrect);
      if (!hasCorrect) return setError(`Câu ${i + 1} chưa có đáp án đúng!`);
    }

    try {
      setIsSaving(true);
      setError("");

      // Format lại data đúng chuẩn CreateQuizDto của Backend
      const payload = {
        classId,
        title,
        duration: Number(duration),
        deadline: new Date(deadline).toISOString(), // Parse ra chuẩn ISO 8601
        maxAttempt: Number(maxAttempt),
        showPoint,
        note,
        questions: questions.map((q, index) => ({
          content: q.content,
          orderIndex: index + 1,
          options: q.options.map((o) => ({
            content: o.content,
            isCorrect: o.isCorrect,
          })),
        })),
      };

      await quizService.createQuiz(payload);

      // Thành công -> Quay về trang chi tiết lớp học
      router.push(`/teacher/classes/${classId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi lưu bài kiểm tra!");
      setIsSaving(false);
    }
  };

  // Utility CSS classes (thay thế cho .input-standard)
  const inputClass =
    "w-full bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-2 text-on-surface text-sm transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline-variant";

  return (
    <div className="flex-1 flex flex-col relative h-[calc(100vh-64px)] bg-surface">
      {/* Scrollable Canvas */}
      <main className="flex-1 overflow-y-auto pt-6 pb-28 px-4 md:px-8">
        <div className="max-w-[1280px] mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-2">
              <Link
                href={`/teacher/classes/${classId}`}
                className="flex items-center gap-1 text-primary hover:underline mr-2 font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                Back to Class
              </Link>
              <span className="material-symbols-outlined text-[16px]">
                chevron_right
              </span>
              <span>Create Test</span>
            </div>
            <h2 className="text-[32px] font-bold text-on-surface">
              Tạo bài kiểm tra mới
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
              {error}
            </div>
          )}

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* --- Column 1: Test Setup --- */}
            <section className="xl:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 space-y-6">
              <h3 className="text-[18px] font-semibold text-on-surface border-b border-outline-variant pb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  settings
                </span>
                General Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">
                    Test Name <span className="text-error">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass}
                    placeholder="VD: Kiểm tra 15 phút chương I"
                    type="text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1">
                      Duration (mins) <span className="text-error">*</span>
                    </label>
                    <input
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className={inputClass}
                      type="number"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1">
                      Max Attempts
                    </label>
                    <input
                      value={maxAttempt}
                      onChange={(e) => setMaxAttempt(Number(e.target.value))}
                      className={inputClass}
                      type="number"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">
                    Deadline <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline-variant text-[20px]">
                      calendar_today
                    </span>
                    <input
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className={`${inputClass} pl-10`}
                      type="datetime-local"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-outline-variant mt-4">
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">
                      Show score immediately
                    </h4>
                    <p className="text-[12px] text-on-surface-variant">
                      Students see scores after submission
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPoint}
                      onChange={() => setShowPoint(!showPoint)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-high peer-focus:ring-4 peer-focus:ring-primary-container/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">
                    Notes for students
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={`${inputClass} h-24 resize-none`}
                    placeholder="Nhập ghi chú hoặc quy chế thi..."
                  ></textarea>
                </div>
              </div>
            </section>

            {/* --- Column 2: Questions Builder --- */}
            <section className="xl:col-span-8 flex flex-col gap-6">
              {/* AI Import Zone */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline-variant bg-surface-container/50">
                  <h3 className="text-[18px] font-semibold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">
                      auto_awesome
                    </span>{" "}
                    Nhập liệu bằng AI
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Tải lên file PDF, AI sẽ đọc tài liệu và tự động sinh ra các
                    câu hỏi trắc nghiệm.
                  </p>
                </div>
                <div className="p-6">
                  {/* Dropzone */}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <div
                    onClick={() =>
                      !isGenerating && fileInputRef.current?.click()
                    }
                    className={`border-2 border-dashed border-outline-variant bg-surface-container-lowest transition-colors rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer group ${isGenerating ? "opacity-50 pointer-events-none" : "hover:bg-primary-container/5 hover:border-primary/50"}`}
                  >
                    {isGenerating ? (
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <span className="material-symbols-outlined text-[32px] text-outline group-hover:text-primary">
                          upload_file
                        </span>
                      </div>
                    )}
                    <p className="text-sm font-semibold text-on-surface mb-1">
                      {isGenerating ? (
                        "AI đang phân tích tài liệu..."
                      ) : (
                        <>
                          Click để chọn file{" "}
                          <span className="text-primary">.PDF</span>
                        </>
                      )}
                    </p>
                    <p className="text-[12px] text-on-surface-variant">
                      Tối đa 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Manual Builder List */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[18px] font-semibold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">
                      list_alt
                    </span>{" "}
                    Question List
                  </h3>
                  <span className="text-sm font-semibold bg-surface-container px-3 py-1 rounded-full text-on-surface-variant">
                    Total: {questions.length}
                  </span>
                </div>

                {questions.map((q, qIndex) => (
                  <div
                    key={q.id}
                    className="bg-surface border border-outline-variant rounded-lg p-5 mb-4 relative group transition-all"
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-sm text-on-surface">
                          {qIndex + 1}
                        </span>
                        <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                          Multiple Choice
                        </span>
                      </div>
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                        title="Xóa câu hỏi"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          delete
                        </span>
                      </button>
                    </div>

                    {/* Question Content */}
                    <div className="mb-4">
                      <textarea
                        value={q.content}
                        onChange={(e) =>
                          updateQuestionContent(q.id, e.target.value)
                        }
                        className={`${inputClass} bg-surface-container-lowest h-20 resize-y`}
                        placeholder="Nhập nội dung câu hỏi..."
                      ></textarea>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      {q.options.map((opt, oIndex) => {
                        const letter = String.fromCharCode(65 + oIndex); // A, B, C, D...
                        return (
                          <div key={opt.id} className="flex items-center gap-3">
                            {/* Nút chọn đáp án đúng */}
                            <label className="flex items-center justify-center cursor-pointer relative">
                              <input
                                type="radio"
                                name={`correct_${q.id}`}
                                checked={opt.isCorrect}
                                onChange={() => setCorrectOption(q.id, opt.id)}
                                className="peer sr-only"
                              />
                              <div className="w-6 h-6 rounded-full border border-outline-variant peer-checked:border-primary peer-checked:bg-primary transition-colors flex items-center justify-center">
                                <span className="material-symbols-outlined text-[14px] text-white opacity-0 peer-checked:opacity-100">
                                  check
                                </span>
                              </div>
                            </label>

                            <div className="w-6 text-center font-semibold text-sm text-on-surface-variant">
                              {letter}
                            </div>

                            <input
                              value={opt.content}
                              onChange={(e) =>
                                updateOptionContent(
                                  q.id,
                                  opt.id,
                                  e.target.value,
                                )
                              }
                              className={`${inputClass} ${opt.isCorrect ? "border-primary bg-primary-container/5" : "bg-surface-container-lowest"}`}
                              placeholder="Nội dung đáp án"
                              type="text"
                            />

                            <button
                              onClick={() => removeOption(q.id, opt.id)}
                              className="text-outline-variant hover:text-error transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                close
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Option Action */}
                    <div className="mt-4 pl-[52px]">
                      <button
                        onClick={() => addOption(q.id)}
                        className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          add
                        </span>{" "}
                        Add Option
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add New Question Button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 px-6 py-3 border border-outline-variant rounded-full text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors shadow-sm bg-surface-container-lowest"
                  >
                    <span className="material-symbols-outlined text-primary">
                      add_circle
                    </span>{" "}
                    Add New Question
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <footer className="fixed bottom-0 right-0 w-full md:w-[calc(100%-280px)] bg-surface-container-lowest border-t border-outline-variant shadow-md px-4 md:px-8 py-4 z-50 flex justify-end items-center gap-4">
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-md text-sm font-semibold text-on-surface-variant border border-outline-variant hover:bg-surface-container transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveTest}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-md text-sm font-semibold bg-primary text-white shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          {isSaving ? "Saving..." : "Save Test"}
        </button>
      </footer>
    </div>
  );
}
