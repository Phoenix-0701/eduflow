"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/src/services/auth.service";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // States quản lý Form và UI
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý Input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Tự động xóa lỗi khi người dùng gõ lại
  };

  // Xử lý Submit API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      // Gọi tới auth.service.ts
      const response: any = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      const { user, accessToken } = response.data;

      // Lưu trạng thái vào Zustand (tự động persist vào localStorage)
      setAuth(user, accessToken);

      // Điều hướng theo Role
      if (user.role === "TEACHER") {
        router.push("/teacher");
      } else {
        router.push("/student");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Sai email hoặc mật khẩu. Vui lòng thử lại!",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-surface-container-lowest text-on-background font-body-md antialiased">
      {/* Left Side: Marketing & Imagery */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden items-center p-12">
        <div className="absolute inset-0 bg-primary opacity-90 z-10"></div>
        {/* Đảm bảo link ảnh đúng hoặc thay bằng ảnh local từ thư mục public */}
        <img
          alt="Educational Background"
          className="absolute inset-0 w-full h-full object-cover z-0 mix-blend-overlay"
          src="https://lh3.googleusercontent.com/aida/AP1WRLvwxXiapxbv0H1ttSCCKeHPk6h7HgB7EUIg83zs9ZQRikAPNPGfbJS1R1Z21U_cxzjh4Zfv3ibTVjaaXD9LR4Bvr15DovkenhJLsdkr2t0jCMSSjA9LpFZoVD8j8M3bz-ZWXjeE8Ks3ctNbhhopKxdeul3JogLCk8rG8GT7CVNenvC72Wa64-GfhIM1819TGtHOsK7Rgr1cs7571Y5Y36cesDzlY1eUeYMipNKJ7DxQRinEY-RdMgKVctBX"
        />
        <div className="relative z-20 max-w-lg">
          <Link
            href="/"
            className="flex items-center gap-3 mb-12 text-white hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined fill text-[36px]">
              school
            </span>
            <span className="font-headline-md text-headline-md font-bold">
              EduFlow
            </span>
          </Link>
          <h1 className="font-display-lg text-display-lg text-white mb-6">
            Empowering your academic journey.
          </h1>
          <p className="font-body-lg text-body-lg text-white/80">
            Join thousands of students, educators, and institutions transforming
            the future of collaborative learning and academic success.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative">
        <div className="w-full max-w-md">
          {/* Mobile Brand Header (Visible only on small screens) */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8 text-primary">
            <span className="material-symbols-outlined fill text-[32px]">
              school
            </span>
            <span className="font-headline-md text-headline-md font-bold">
              EduFlow
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="font-headline-lg text-[32px] font-bold text-on-surface mb-2">
              Welcome back
            </h2>
            <p className="font-body-md text-on-surface-variant">
              Please enter your details to sign in to your workspace.
            </p>
          </div>

          {/* Hiển thị lỗi từ API */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium border border-error/20">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                className="block font-semibold text-sm text-on-surface mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">
                    mail
                  </span>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 placeholder:text-on-surface-variant/50"
                  placeholder="name@institution.edu"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                className="block font-semibold text-sm text-on-surface mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">
                    lock
                  </span>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-11 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 placeholder:text-on-surface-variant/50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded bg-surface-container-lowest transition-colors cursor-pointer"
                />
                <label
                  className="ml-2 block text-sm text-on-surface-variant cursor-pointer"
                  htmlFor="remember-me"
                >
                  Remember me
                </label>
              </div>
              <Link
                href="#"
                className="text-sm font-semibold text-primary hover:underline transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-[#4338ca] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-70"
              >
                {isLoading ? "Authenticating..." : "Log In"}
              </button>
            </div>

            {/* Social Login Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-container-lowest text-on-surface-variant">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 px-4 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-colors duration-200"
              >
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  ></path>
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z"
                    fill="#34A853"
                  ></path>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 px-4 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-colors duration-200"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 text-[#1877F2]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
                Facebook
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div class="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline transition-colors duration-200"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Corporate Footer */}
          <div className="mt-12 text-center absolute bottom-6 left-0 right-0 lg:relative lg:bottom-0">
            <p className="text-xs text-on-surface-variant/70">
              © 2026 EduFlow Learning Systems. Safe & Secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
