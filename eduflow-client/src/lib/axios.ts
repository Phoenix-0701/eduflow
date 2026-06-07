// src/lib/axios.ts
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// 1. Khởi tạo instance của Axios
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. REQUEST INTERCEPTOR: Can thiệp trước khi gửi API đi
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token trực tiếp từ trạng thái hiện tại của Zustand (không cần hook)
    const token = useAuthStore.getState().token;

    // Nếu có token, nhét vào header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. RESPONSE INTERCEPTOR: Can thiệp ngay khi Backend trả dữ liệu về
axiosInstance.interceptors.response.use(
  (response) => {
    // Vì Backend NestJS của bạn đã dùng TransformInterceptor bọc dữ liệu trong trường `data`,
    // Ta có thể bóc luôn trường `data` ở đây để khi gọi API code ngắn gọn hơn.
    return response.data;
  },
  (error) => {
    // Xử lý lỗi 401 (Hết hạn Token hoặc chưa đăng nhập)
    if (error.response?.status === 401) {
      // Ép đăng xuất (xóa dữ liệu trong Zustand + LocalStorage)
      useAuthStore.getState().logout();

      // Chuyển hướng người dùng về trang đăng nhập (Chỉ chạy ở môi trường Browser)
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // Ném lỗi ra cho các Component xử lý tiếp (ví dụ: hiển thị Toast báo lỗi)
    return Promise.reject(error);
  },
);

export default axiosInstance;
