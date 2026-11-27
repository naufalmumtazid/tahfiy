"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
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
    pages === 0 ? 0 : Math.max((pages / maxPages) * 88, 4);

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
            <span className="h-3 w-3 rounded-sm bg-emerald-600" />
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
        className="overflow-x-auto"
        aria-label={`Diagram progres hafalan bulan ${formatMonth(monthStart)}`}
      >
        <div className="min-w-[560px] pb-1">
          <div className="relative h-48">
            <div
              className="pointer-events-none absolute inset-y-0 left-10 right-0 flex flex-col justify-between"
              aria-hidden="true"
            >
              {Array.from({ length: 5 }, (_, index) => (
                <div
                  key={index}
                  className="relative border-t border-dashed border-blue-100"
                >
                  {(index === 0 ||
                    index === 4 ||
                    (index === 2 && maxPages > 1)) && (
                    <span className="absolute -left-9 -top-2 w-7 text-right text-[10px] text-gray-400">
                      {index === 0
                        ? maxPages
                        : index === 4
                          ? 0
                          : Math.round(maxPages / 2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div
              className="absolute inset-y-0 left-10 right-0 grid"
              style={{
                gridTemplateColumns: `repeat(${monthlyProgress.length}, minmax(0, 1fr))`,
              }}
            >
              {monthlyProgress.map((week) => {
                const ziyadahHeight = animateBars
                  ? barHeight(week.ziyadahPages)
                  : 0;
                const murojaahHeight = animateBars
                  ? barHeight(week.murojaahPages)
                  : 0;
                const examPassed = passedWeeks[week.weekStart];
                const examStatus = examLoading
                  ? "Status ujian pekanan sedang dimuat"
                  : examError
                    ? "Status ujian pekanan tidak tersedia"
                    : examPassed
                      ? "Lulus Ujian Pekanan"
                      : "Belum ditandai Ujian Pekanan";

                return (
                  <div
                    key={week.weekStart}
                    role="group"
                    aria-label={`Pekan ${week.index}`}
                    className="relative flex h-full items-end justify-center gap-2 px-1"
                  >
                    <button
                      type="button"
                      title={`Ziyadah - ${week.ziyadahPages} halaman - ${examStatus}`}
                      aria-label={`Pekan ${week.index}, Ziyadah, ${week.ziyadahPages} halaman, ${examStatus}`}
                      className="relative flex w-8 shrink-0 cursor-help items-end justify-center rounded-t-md outline-none transition-[height] duration-700 ease-out hover:brightness-110 focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none"
                      style={{
                        height: `${Math.max(ziyadahHeight, 7)}%`,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-blue-700"
                      >
                        {week.ziyadahPages}
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 rounded-t-md bg-blue-600"
                        style={{
                          height:
                            animateBars && week.ziyadahPages > 0
                              ? "100%"
                              : "0%",
                        }}
                      />
                    </button>
                    <button
                      type="button"
                      title={`Murojaah - ${week.murojaahPages} halaman - ${examStatus}`}
                      aria-label={`Pekan ${week.index}, Murojaah, ${week.murojaahPages} halaman, ${examStatus}`}
                      className="relative flex w-8 shrink-0 cursor-help items-end justify-center rounded-t-md outline-none transition-[height] duration-700 ease-out hover:brightness-110 focus-visible:ring-2 focus-visible:ring-emerald-600 motion-reduce:transition-none"
                      style={{
                        height: `${Math.max(murojaahHeight, 7)}%`,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-emerald-700"
                      >
                        {week.murojaahPages}
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 rounded-t-md bg-emerald-600"
                        style={{
                          height:
                            animateBars && week.murojaahPages > 0
                              ? "100%"
                              : "0%",
                        }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            className="grid pl-10"
            style={{
              gridTemplateColumns: `repeat(${monthlyProgress.length}, minmax(0, 1fr))`,
            }}
          >
            {monthlyProgress.map((week) => (
              <div key={week.weekStart} className="px-1 pt-2 text-center">
                <p className="text-xs font-semibold text-gray-700">
                  Pekan {week.index}
                </p>
                <p className="mt-0.5 text-[10px] text-gray-500">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
