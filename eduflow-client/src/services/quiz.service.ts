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
};
