"use client";

import { useAuthStore } from "@/src/store/useAuthStore";
import { usePathname } from "next/navigation";

export default function Topbar() {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  // Tạo breadcrumb động dựa trên URL hiện tại
  const pageName = pathname.includes("classes")
    ? "Classes"
    : pathname.includes("settings")
      ? "Settings"
      : "Dashboard";

  // Lấy chữ cái đầu của tên (Ví dụ: "John Doe" -> "JD")
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <header className="bg-surface/80 dark:bg-background/80 backdrop-blur-md sticky top-0 right-0 w-full z-40 border-b border-outline-variant dark:border-outline flex justify-between items-center h-16 px-4 md:px-8">
      {/* Left side: Menu Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button className="md:hidden text-on-surface-variant hover:text-primary transition-colors focus:ring-2 focus:ring-primary/20 rounded-lg p-1">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="flex items-center text-sm font-semibold text-on-surface-variant space-x-2">
          <span className="text-primary font-bold">EduFlow</span>
          <span>/</span>
          <span className="text-on-surface">{pageName}</span>
        </div>
      </div>

      {/* Right side: Search, Notifications, Avatar */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-1.5 border border-outline-variant focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant mr-2">
            search
          </span>
          <input
            className="bg-transparent border-none text-[14px] focus:ring-0 placeholder:text-on-surface-variant w-48 text-on-surface outline-none"
            placeholder="Search everywhere..."
            type="text"
          />
        </div>

        <button className="text-on-surface-variant hover:text-primary transition-colors focus:ring-2 focus:ring-primary/20 rounded-full p-2 relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface"></span>
        </button>

        <button className="text-on-surface-variant hover:text-primary transition-colors focus:ring-2 focus:ring-primary/20 rounded-full p-2 hidden sm:block">
          <span className="material-symbols-outlined">help</span>
        </button>

        <div
          className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-semibold text-[14px] cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all ml-2"
          title={user?.name || "User Avatar"}
        >
          {getInitials(user?.name || "")}
        </div>
      </div>
    </header>
  );
}
