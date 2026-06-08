"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/src/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();

  // States quản lý form
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Xóa lỗi khi user gõ lại
  };

  // Xử lý Submit gọi API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp!");
    }

    try {
      setIsLoading(true);
      await authService.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: role,
      });

      // Chuyển hướng sang trang đăng nhập sau khi đăng ký thành công
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi đăng ký");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 z-[-1] overflow-hidden bg-background pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-fixed blur-[120px] opacity-60"></div>
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary-fixed/30 blur-[100px] opacity-50"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-tertiary-fixed-dim/20 blur-[80px]"></div>
      </div>

      <div className="w-full max-w-[540px] z-10 flex flex-col items-center">
        {/* Signup Card */}
        <div className="w-full bg-surface-container-lowest/90 backdrop-blur-xl rounded-[24px] border border-outline-variant/50 p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-fixed/20 to-transparent pointer-events-none"></div>

          {/* Branding Header */}
          <div className="mb-6 text-center relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-surface-tint text-on-primary mb-2 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[32px]">
                school
              </span>
            </div>
            <h1 className="font-headline-lg text-[32px] font-bold text-on-surface tracking-tight mt-1">
              EduFlow
            </h1>
            <p className="font-body-md text-on-surface-variant mt-1">
              Create your account to get started.
            </p>
          </div>

          {/* Role Selection Toggle */}
          <div className="flex p-1.5 bg-surface-container-low rounded-xl mb-6 border border-outline-variant/40 relative z-10 shadow-inner">
            <div
              className="absolute top-[6px] bottom-[6px] left-[6px] w-[calc(50%-6px)] bg-surface-container-lowest rounded-lg shadow-md transition-transform duration-300"
              style={{
                transform:
                  role === "STUDENT"
                    ? "translateX(0)"
                    : "translateX(calc(100% + 12px))",
              }}
            ></div>
            <button
              onClick={() => setRole("STUDENT")}
              type="button"
              className={`flex-1 relative z-10 text-center py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                role === "STUDENT"
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">
                  school
                </span>
                Student
              </span>
            </button>
            <button
              onClick={() => setRole("TEACHER")}
              type="button"
              className={`flex-1 relative z-10 text-center py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                role === "TEACHER"
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">
                  person
                </span>
                Teacher
              </span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium border border-error/20">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 relative z-10"
          >
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-1.5 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">
                      person
                    </span>
                  </div>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-3.5 py-3 rounded-xl border border-outline-variant/60 bg-surface/50 text-on-surface placeholder-outline/60 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-surface-container-lowest transition-all outline-none"
                    placeholder="Jane Doe"
                    required
                    type="text"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">
                      mail
                    </span>
                  </div>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-3.5 py-3 rounded-xl border border-outline-variant/60 bg-surface/50 text-on-surface placeholder-outline/60 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-surface-container-lowest transition-all outline-none"
                    placeholder="jane@example.com"
                    required
                    type="email"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">
                      lock
                    </span>
                  </div>
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-3.5 py-3 rounded-xl border border-outline-variant/60 bg-surface/50 text-on-surface placeholder-outline/60 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-surface-container-lowest transition-all outline-none"
                    placeholder="••••••••"
                    required
                    type="password"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-1.5 ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">
                      lock_reset
                    </span>
                  </div>
                  <input
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-3.5 py-3 rounded-xl border border-outline-variant/60 bg-surface/50 text-on-surface placeholder-outline/60 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-surface-container-lowest transition-all outline-none"
                    placeholder="••••••••"
                    required
                    type="password"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={isLoading}
              className="w-full mt-4 bg-gradient-to-r from-primary to-surface-tint hover:from-primary-container hover:to-primary text-on-primary text-[15px] font-semibold rounded-xl py-3.5 px-4 shadow-md transition-all duration-200 disabled:opacity-70"
              type="submit"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center relative z-10 bg-surface-container-lowest/50 backdrop-blur-sm py-2 px-6 rounded-full border border-outline-variant/30">
          <p className="text-sm text-on-surface-variant inline-flex items-center gap-1.5">
            Already have an account?
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline hover:text-primary-container transition-colors inline-flex items-center gap-0.5"
            >
              Login{" "}
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
