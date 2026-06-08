import React from "react";
import Sidebar from "@/src/components/layout/Sidebar";
import Topbar from "@/src/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen antialiased selection:bg-primary-container selection:text-on-primary-container flex">
      {/* Sidebar cố định bên trái */}
      <Sidebar />

      {/* Vùng nội dung chính (Đẩy sang phải 280px để không bị Sidebar che khuất) */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[280px]">
        {/* Topbar dính trên cùng */}
        <Topbar />

        {/* Nội dung trang con sẽ được Render tại đây */}
        <div className="flex-1 w-full">{children}</div>
      </div>
    </div>
  );
}
