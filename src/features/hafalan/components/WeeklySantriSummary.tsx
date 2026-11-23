"use client";

import { FiBookOpen, FiCheck, FiRefreshCw, FiUser } from "react-icons/fi";
import type { SantriItem } from "@/features/halaqah/types";
import { WeeklyPagination } from "@/features/hafalan/components/WeeklyPagination";

interface WeeklySantriSummaryProps {
  santri: SantriItem;
  weekStart: string;
  currentWeekStart: string;
  ziyadahPages: number;
  ziyadahUncounted: number;
  murojaahPages: number;
  murojaahUncounted: number;
  examPassed: boolean;
  examLoading: boolean;
  examError: string | null;
  onToggleExam: () => void;
  onChangeWeek: (weekStart: string) => void;
  onChangeSantri: () => void;
}

function PageSummary({
  label,
  pages,
  uncounted,
  icon: Icon,
}: {
  label: string;
  pages: number;
  uncounted: number;
  icon: typeof FiBookOpen;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="min-w-0">
        <span className="block text-xs font-medium text-slate-500">
          {label}
        </span>
        <p className="mt-1 flex items-baseline gap-1.5 text-slate-800">
          <span className="text-2xl font-bold tracking-tight">{pages}</span>
          <span className="text-sm font-medium text-slate-500">halaman</span>
        </p>
        {uncounted > 0 && (
          <span className="mt-1 block text-[11px] leading-4 text-amber-700">
            {uncounted} record lama belum ada jumlah halaman
          </span>
        )}
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon className="h-5 w-5" />
      </span>
    </div>
  );
}

export function WeeklySantriSummary({
  santri,
  weekStart,
  currentWeekStart,
  ziyadahPages,
  ziyadahUncounted,
  murojaahPages,
  murojaahUncounted,
  examPassed,
  examLoading,
  examError,
  onToggleExam,
  onChangeWeek,
}: WeeklySantriSummaryProps) {
  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow-sm">
            <FiUser className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="wrap-break-word font-semibold text-slate-900">
              {santri.name}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              Santri · Kelas {santri.class}
            </p>
          </div>
        </div>

        <div className="lg:min-w-72">
          <WeeklyPagination
            weekStart={weekStart}
            currentWeekStart={currentWeekStart}
            onChange={onChangeWeek}
          />
        </div>
      </div>

      <div className="grid gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2 xl:grid-cols-3">
        <PageSummary
          label="Total ziyadah"
          pages={ziyadahPages}
          uncounted={ziyadahUncounted}
          icon={FiBookOpen}
        />
        <PageSummary
          label="Total tsunnaiyyah"
          pages={murojaahPages}
          uncounted={murojaahUncounted}
          icon={FiRefreshCw}
        />
        <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="min-w-0">
            <span className="block text-xs font-medium text-slate-500">
              Ujian pekan terpilih
            </span>
            <span
              className={`mt-1 inline-flex items-center gap-1.5 text-sm font-semibold ${
                examPassed ? "text-emerald-700" : "text-slate-700"
              }`}
            >
              {examPassed && <FiCheck className="h-4 w-4" />}
              {examLoading
                ? "Memuat status..."
                : examPassed
                  ? "Lulus"
                  : "Belum lulus"}
            </span>
            {examError && (
              <span className="mt-1 block text-xs text-red-600">
                {examError}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleExam}
            disabled={examLoading}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              examPassed
                ? "border border-red-100 bg-white text-red-600 hover:bg-red-50"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {examLoading
              ? "Memproses..."
              : examPassed
                ? "Batalkan"
                : "Tandai lulus"}
          </button>
        </div>
      </div>
    </section>
  );
}
