import axiosInstance from "../lib/axios";

export const authService = {
  register: async (data: any) => {
    // Gọi đến API POST /auth/register của NestJS
    const response = await axiosInstance.post("/auth/register", data);
    return response;
  },

  login: async (data: any) => {
    // Gọi đến API POST /auth/login của NestJS
    const response = await axiosInstance.post("/auth/login", data);
    return response;
  },
};
