// src/services/quiz.service.ts
import axiosInstance from "@/src/lib/axios";

export const quizService = {
  getQuizzesByClass: async (classId: string) => {
    const res = await axiosInstance.get(`/quizzes/class/${classId}`);
    return res.data;
  },

  // Gọi API tạo Quiz (Manual)
  createQuiz: async (data: any) => {
    const res = await axiosInstance.post("/quizzes", data);
    return res.data;
  },

  // Gọi API Gemini sinh câu hỏi
  generateQuestionsByAI: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    // axiosInstance sẽ tự động gắn token, ta chỉ cần override Content-Type
    const res = await axiosInstance.post("/quizzes/ai/generate", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data; // Trả về mảng JSON câu hỏi từ Gemini
  },

  getStudentDashboard: async () => {
    const res = await axiosInstance.get("/quizzes/student/dashboard");
    return res.data;
  },

  // [STUDENT] Lấy chi tiết bài kiểm tra trước khi làm
  getQuizById: async (quizId: string) => {
    const res = await axiosInstance.get(`/quizzes/${quizId}`);
    return res.data;
  },

  // [STUDENT] Lưu bản nháp (Auto-save)
  saveDraft: async (quizId: string, answers: Record<string, string>) => {
    const res = await axiosInstance.post(`/quizzes/${quizId}/drafts`, {
      answers,
    });
    return res.data;
  },

  // [STUDENT] Lấy bản nháp khi tải lại trang
  getDraft: async (quizId: string) => {
    const res = await axiosInstance.get(`/quizzes/${quizId}/drafts`);
    return res.data;
  },

  // [STUDENT] Nộp bài chính thức
  submitQuiz: async (quizId: string, answers: Record<string, string>) => {
    const res = await axiosInstance.post(`/quizzes/${quizId}/submit`, {
      answers,
    });
    return res.data;
  },
};
