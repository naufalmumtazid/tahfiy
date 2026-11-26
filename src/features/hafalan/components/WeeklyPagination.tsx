"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { formatWeekRange, shiftWeek } from "@/features/hafalan/weekly";

interface WeeklyPaginationProps {
  weekStart: string;
  currentWeekStart: string;
  onChange: (weekStart: string) => void;
}

export function WeeklyPagination({
  weekStart,
  currentWeekStart,
  onChange,
}: WeeklyPaginationProps) {
  const isCurrentWeek = weekStart === currentWeekStart;

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Rentang pekan
      </span>
      <div className="flex items-center justify-center flex-col md:flex-row gap-2">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onChange(shiftWeek(weekStart, -1))}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            aria-label="Lihat pekan sebelumnya"
            title="Pekan sebelumnya"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-48 text-center text-sm font-semibold text-slate-800">
            {formatWeekRange(weekStart)}
          </span>
          <button
            type="button"
            onClick={() => onChange(shiftWeek(weekStart, 1))}
            disabled={isCurrentWeek}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Lihat pekan berikutnya"
            title="Pekan berikutnya"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
        {!isCurrentWeek && (
          <button
            type="button"
            onClick={() => onChange(currentWeekStart)}
            className="ml-1 w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Pekan ini
          </button>
        )}
      </div>
    </div>
  );
}
