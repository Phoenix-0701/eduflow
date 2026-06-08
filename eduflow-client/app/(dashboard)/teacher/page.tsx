"use client";

import React from "react";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function TeacherDashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <main className="p-4 md:p-8 max-w-[1280px] mx-auto w-full">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-[24px] md:text-[32px] font-bold text-on-surface tracking-tight">
            Overview
          </h2>
          <p className="text-[16px] text-on-surface-variant mt-1">
            Welcome back, {user?.name || "Professor"}. Here's what's happening
            today.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">assignment</span>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#10B981]/10 text-[#10B981]">
              <span className="material-symbols-outlined text-[14px] mr-1">
                trending_up
              </span>{" "}
              12%
            </span>
          </div>
          <h3 className="font-semibold text-[14px] text-on-surface-variant mb-1 relative z-10">
            Active Tests
          </h3>
          <p className="font-bold text-[48px] text-on-surface relative z-10 leading-none">
            12
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
              <span className="material-symbols-outlined">class</span>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#10B981]/10 text-[#10B981]">
              <span className="material-symbols-outlined text-[14px] mr-1">
                trending_up
              </span>{" "}
              4%
            </span>
          </div>
          <h3 className="font-semibold text-[14px] text-on-surface-variant mb-1 relative z-10">
            Total Classes
          </h3>
          <p className="font-bold text-[48px] text-on-surface relative z-10 leading-none">
            8
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6]">
              <span className="material-symbols-outlined">groups</span>
            </div>
          </div>
          <h3 className="font-semibold text-[14px] text-on-surface-variant mb-1 relative z-10">
            Total Students
          </h3>
          <p className="font-bold text-[48px] text-on-surface relative z-10 leading-none">
            245
          </p>
        </div>
      </div>

      {/* Recent Tests Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-bright">
          <div>
            <h3 className="font-semibold text-[18px] text-on-surface">
              Recent Tests
            </h3>
            <p className="text-[14px] text-on-surface-variant mt-1">
              Manage and track your latest assignments.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center bg-surface-container px-3 py-2 rounded-lg border border-outline-variant focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all flex-1 sm:w-64">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant mr-2">
                search
              </span>
              <input
                className="bg-transparent border-none text-[14px] focus:ring-0 placeholder:text-on-surface-variant w-full text-on-surface outline-none p-0"
                placeholder="Search tests..."
                type="text"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors font-semibold text-sm">
              <span className="material-symbols-outlined text-[18px]">
                filter_list
              </span>
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="font-semibold text-[12px] text-on-surface-variant px-6 py-4 uppercase tracking-wider">
                  Test Name
                </th>
                <th className="font-semibold text-[12px] text-on-surface-variant px-6 py-4 uppercase tracking-wider">
                  Status
                </th>
                <th className="font-semibold text-[12px] text-on-surface-variant px-6 py-4 uppercase tracking-wider hidden sm:table-cell">
                  Duration
                </th>
                <th className="font-semibold text-[12px] text-on-surface-variant px-6 py-4 uppercase tracking-wider hidden md:table-cell">
                  Deadline
                </th>
                <th className="font-semibold text-[12px] text-on-surface-variant px-6 py-4 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="font-semibold text-[12px] text-on-surface-variant px-6 py-4 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
              {/* Row 1 */}
              <tr className="hover:bg-surface-container/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center text-primary hidden sm:flex">
                      <span className="material-symbols-outlined text-[18px]">
                        calculate
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-on-surface">
                        Math Quiz 101
                      </div>
                      <div className="text-xs text-on-surface-variant mt-0.5">
                        Algebra Basics
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#10B981]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-1.5"></span>
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell text-sm text-on-surface-variant">
                  45 mins
                </td>
                <td className="px-6 py-4 hidden md:table-cell text-sm text-on-surface-variant">
                  Oct 25, 2023
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-surface-variant rounded-full overflow-hidden max-w-[120px]">
                      <div className="h-full bg-primary rounded-full w-[85%]"></div>
                    </div>
                    <span className="text-xs font-semibold text-on-surface-variant w-12">
                      85/100
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-primary-container/10">
                    <span className="material-symbols-outlined text-[20px]">
                      more_vert
                    </span>
                  </button>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-surface-container/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] hidden sm:flex">
                      <span className="material-symbols-outlined text-[18px]">
                        science
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-on-surface">
                        Physics Midterm
                      </div>
                      <div className="text-xs text-on-surface-variant mt-0.5">
                        Mechanics
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mr-1.5"></span>
                    Draft
                  </span>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell text-sm text-on-surface-variant">
                  90 mins
                </td>
                <td className="px-6 py-4 hidden md:table-cell text-sm text-on-surface-variant">
                  Nov 02, 2023
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-surface-variant rounded-full overflow-hidden max-w-[120px]">
                      <div className="h-full bg-surface-variant rounded-full w-[0%]"></div>
                    </div>
                    <span className="text-xs font-semibold text-on-surface-variant w-12">
                      0/80
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-primary-container/10">
                    <span className="material-symbols-outlined text-[20px]">
                      more_vert
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
