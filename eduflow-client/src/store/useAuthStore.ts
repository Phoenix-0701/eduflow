// src/store/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Định nghĩa kiểu dữ liệu dựa theo BE trả về
interface User {
  id: string;
  name: string;
  email: string;
  role: "TEACHER" | "STUDENT";
}

interface AuthState {
  user: User | null;
  token: string | null;

  // Các hàm (actions) để thay đổi state
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      // Hàm gọi khi đăng nhập thành công
      setAuth: (user, token) => set({ user, token }),

      // Hàm gọi khi đăng xuất
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: "auth-storage", // Tên key sẽ lưu dưới LocalStorage của trình duyệt
    },
  ),
);
