"use client";

import { useState, useRef, useEffect } from "react";
import { classService } from "@/src/services/class.service";
import Link from "next/link";

export default function ClassCard({
  cls,
  onRefresh,
}: {
  cls: any;
  onRefresh: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Tạo Ref để tham chiếu tới cụm Dropdown

  // XỬ LÝ CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Nếu dropdown đang mở, VÀ click chuột xảy ra ở bên ngoài dropdownRef -> Đóng menu
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this class?")) {
      await classService.deleteClass(cls.id);
      onRefresh();
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 card-hover flex flex-col relative group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-low text-on-surface-variant font-medium text-xs mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>{" "}
            Active
          </div>
          <Link href={`/teacher/classes/${cls.id}`} className="hover:underline">
            <h3 className="text-lg font-bold text-on-surface mb-1">
              {cls.name}
            </h3>
          </Link>{" "}
        </div>

        {/* Dropdown Menu bọc trong dropdownRef */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-on-surface-variant hover:bg-surface-container p-1.5 rounded-md transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              more_vert
            </span>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-10 py-1">
              <button className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-surface-container-low text-on-surface transition-colors">
                Edit Name
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-error-container text-error transition-colors"
              >
                Delete Class
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-4 border-t border-outline-variant pt-4">
        <div>
          <p className="text-[10px] font-semibold text-outline mb-1 uppercase tracking-wider">
            Students
          </p>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">
              group
            </span>
            <span className="font-semibold text-sm">
              {cls._count?.members || 0}
            </span>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-outline mb-1 uppercase tracking-wider">
            Quizzes
          </p>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary-container text-[18px]">
              quiz
            </span>
            <span className="font-semibold text-sm">
              {cls._count?.quizzes || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
