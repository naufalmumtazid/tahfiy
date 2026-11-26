"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { Murojaah } from "@/features/murojaah/types";
import type { Ziyadah } from "@/features/ziyadah/types";
import {
  formatMonth,
  getMonthWeeks,
  shiftMonth,
} from "@/features/hafalan/monthly";

interface SantriMonthlyProgressProps {
  monthStart: string;
  currentMonthStart: string;
  murojaah: Murojaah[];
  ziyadah: Ziyadah[];
  passedWeeks: Record<string, boolean>;
  examLoading: boolean;
  examError: string | null;
  onChangeMonth: (monthStart: string) => void;
}

export function SantriMonthlyProgress({
  monthStart,
  currentMonthStart,
  murojaah,
  ziyadah,
  passedWeeks,
  examLoading,
  examError,
  onChangeMonth,
}: SantriMonthlyProgressProps) {
  const [animateBars, setAnimateBars] = useState(false);
  const weeks = useMemo(() => getMonthWeeks(monthStart), [monthStart]);
  const monthlyProgress = useMemo(
    () =>
      weeks.map((week) => {
        const inWeek = (date: string) =>
          date >= week.startDate && date <= week.endDate;

        return {
          ...week,
          murojaahPages: murojaah
            .filter((item) => inWeek(item.date))
            .reduce((total, item) => total + (item.jumlah_halaman ?? 0), 0),
          ziyadahPages: ziyadah
            .filter((item) => inWeek(item.date))
            .reduce((total, item) => total + (item.jumlah_halaman ?? 0), 0),
        };
      }),
    [murojaah, weeks, ziyadah],
  );
  const maxPages = Math.max(
    1,
    ...monthlyProgress.flatMap((week) => [
      week.murojaahPages,
      week.ziyadahPages,
    ]),
  );
  const monthTotals = monthlyProgress.reduce(
    (totals, week) => ({
      murojaah: totals.murojaah + week.murojaahPages,
      ziyadah: totals.ziyadah + week.ziyadahPages,
    }),
    { murojaah: 0, ziyadah: 0 },
  );
  const passedCount = weeks.filter((week) => passedWeeks[week.weekStart]).length;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setAnimateBars(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const barHeight = (pages: number) =>
    pages === 0 ? 0 : Math.max((pages / maxPages) * 82, 4);

  return (
    <section className="mb-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Progres hafalan pekanan
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Jumlah halaman Ziyadah dan Murojaah per pekan.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeMonth(shiftMonth(monthStart, -1))}
              className="rounded-xl border border-blue-100 bg-white p-2 text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
              aria-label="Lihat bulan sebelumnya"
              title="Bulan sebelumnya"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-32 text-center text-sm font-semibold capitalize text-gray-800">
              {formatMonth(monthStart)}
            </span>
            <button
              type="button"
              onClick={() => onChangeMonth(shiftMonth(monthStart, 1))}
              disabled={monthStart >= currentMonthStart}
              className="rounded-xl border border-blue-100 bg-white p-2 text-gray-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Lihat bulan berikutnya"
              title="Bulan berikutnya"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
            {monthStart !== currentMonthStart && (
              <button
                type="button"
                onClick={() => onChangeMonth(currentMonthStart)}
                className="whitespace-nowrap rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Bulan ini
              </button>
            )}
          </div>
          <Link
            href="/santri/hafalan"
            className="whitespace-nowrap rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            Lihat tabel hafalan
          </Link>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-gray-600">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-blue-600" />
            Ziyadah
            <strong className="text-gray-700">
              {monthTotals.ziyadah} halaman
            </strong>
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-cyan-500" />
            Murojaah
            <strong className="text-gray-700">
              {monthTotals.murojaah} halaman
            </strong>
          </span>
        </div>
        <p className="text-xs text-gray-500" aria-live="polite">
          Ujian lulus:{" "}
          <span className="font-semibold text-gray-700">
            {examLoading
              ? "Memuat..."
              : examError
                ? "Status tidak tersedia"
                : `${passedCount} dari ${weeks.length} pekan`}
          </span>
        </p>
      </div>

      {examError && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Status ujian tidak dapat dimuat: {examError}
        </p>
      )}

      <div
        key={monthStart}
        role="group"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        aria-label={`Diagram progres hafalan bulan ${formatMonth(monthStart)}`}
      >
        {monthlyProgress.map((week) => {
          const ziyadahHeight = animateBars
            ? barHeight(week.ziyadahPages)
            : 0;
          const murojaahHeight = animateBars
            ? barHeight(week.murojaahPages)
            : 0;
          const examPassed = passedWeeks[week.weekStart];

          return (
            <div
              key={week.weekStart}
              className="rounded-2xl border border-blue-50 bg-blue-50/30 p-3"
            >
              <div className="relative h-40 border-b border-blue-100">
                <div className="absolute inset-x-1 bottom-0 flex h-full items-end justify-center gap-3">
                  <div className="relative flex h-full w-8 items-end">
                    <span
                      className="absolute left-1/2 -translate-x-1/2 text-[11px] font-semibold text-blue-700"
                      style={{ bottom: `calc(${ziyadahHeight}% + 4px)` }}
                    >
                      {week.ziyadahPages}
                    </span>
                    <div
                      role="img"
                      aria-label={`${week.ziyadahPages} halaman Ziyadah`}
                      className="w-full rounded-t-md bg-blue-600 transition-[height] duration-700 ease-out motion-reduce:transition-none"
                      style={{ height: `${ziyadahHeight}%` }}
                    />
                  </div>
                  <div className="relative flex h-full w-8 items-end">
                    <span
                      className="absolute left-1/2 -translate-x-1/2 text-[11px] font-semibold text-cyan-700"
                      style={{ bottom: `calc(${murojaahHeight}% + 4px)` }}
                    >
                      {week.murojaahPages}
                    </span>
                    <div
                      role="img"
                      aria-label={`${week.murojaahPages} halaman Murojaah`}
                      className="w-full rounded-t-md bg-cyan-500 transition-[height] duration-700 ease-out motion-reduce:transition-none"
                      style={{ height: `${murojaahHeight}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-2 text-center text-xs font-semibold text-gray-700">
                Pekan {week.index}
              </p>
              <p className="mt-0.5 text-center text-[10px] text-gray-500">
                {new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "short",
                  timeZone: "UTC",
                }).format(new Date(`${week.startDate}T00:00:00.000Z`))}
                {" – "}
                {new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "short",
                  timeZone: "UTC",
                }).format(new Date(`${week.endDate}T00:00:00.000Z`))}
              </p>
              <p
                className={`mt-2 flex min-h-7 items-center justify-center gap-1 rounded-lg px-1.5 py-1 text-center text-[10px] font-semibold ${
                  examLoading
                    ? "bg-gray-100 text-gray-500"
                    : examPassed
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                }`}
                aria-label={
                  examLoading
                    ? `Status ujian pekan ${week.index} sedang dimuat`
                    : examPassed
                      ? `Ujian pekan ${week.index} lulus`
                      : `Ujian pekan ${week.index} belum ditandai`
                }
              >
                {examPassed && <FiCheck className="h-3 w-3 shrink-0" />}
                {examLoading
                  ? "Memuat ujian"
                  : examPassed
                    ? "Lulus"
                    : examError
                      ? "Status tidak tersedia"
                      : "Belum ditandai"}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
