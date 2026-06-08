"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Danh sách menu
  const menuItems = [
    { name: "Dashboard", icon: "dashboard", path: "/teacher" },
    { name: "Classes", icon: "school", path: "/teacher/classes" },
    { name: "Settings", icon: "settings", path: "/teacher/settings" },
  ];

  return (
    <aside className="bg-surface-container-lowest dark:bg-inverse-surface fixed left-0 top-0 h-full w-[280px] border-r border-outline-variant shadow-sm dark:shadow-none hidden md:flex flex-col py-6 z-50">
      {/* Brand */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-[18px]">
          E
        </div>
        <div>
          <h1 className="text-[24px] font-bold text-primary dark:text-primary-fixed leading-tight">
            EduFlow
          </h1>
          <p className="text-[12px] font-medium text-on-surface-variant">
            Academic Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 font-semibold text-[14px] rounded-r-lg active:scale-[0.98] transition-all duration-200 border-l-4 ${
                isActive
                  ? "text-primary dark:text-primary-fixed border-primary bg-primary-container/5"
                  : "text-on-surface-variant dark:text-surface-variant border-transparent hover:bg-surface-container-high dark:hover:bg-surface-variant"
              }`}
            >
              <span
                className={`material-symbols-outlined ${isActive ? "fill" : ""}`}
              >
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 mt-auto pt-6 border-t border-outline-variant">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant font-semibold text-[14px] hover:bg-surface-container-high dark:hover:bg-surface-variant transition-colors duration-200 rounded-lg active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
