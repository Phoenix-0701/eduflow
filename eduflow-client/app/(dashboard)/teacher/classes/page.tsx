"use client";

import { useEffect, useState } from "react";
import { classService } from "@/src/services/class.service";
import ClassCard from "@/src/components/shared/ClassCard";
import ClassCardSkeleton from "@/src/components/shared/ClassCardSkeleton";

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await classService.getClasses();
      setClasses(data.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách lớp", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreate = async () => {
    const name = prompt("Nhập tên lớp học mới:");
    if (name && name.trim() !== "") {
      await classService.createClass(name);
      fetchClasses(); // Tự động load lại danh sách sau khi tạo
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        {/* Thanh Search giả lập UI */}
        <div className="relative w-full sm:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search class names..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
          />
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create Class
        </button>
      </div>

      {/* Grid Danh sách lớp */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          // Hiển thị 6 cái Skeleton Card nhấp nháy trong lúc đợi API
          [1, 2, 3, 4, 5, 6].map((item) => <ClassCardSkeleton key={item} />)
        ) : classes.length > 0 ? (
          // Render dữ liệu thật
          classes.map((cls: any) => (
            <ClassCard key={cls.id} cls={cls} onRefresh={fetchClasses} />
          ))
        ) : (
          // Trạng thái trống (Empty State)
          <div className="col-span-full py-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">
              school
            </span>
            <p className="font-semibold text-lg">No classes found</p>
            <p className="text-sm">Click "Create Class" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
