"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { SantriMonthlyProgress } from "@/features/hafalan/components/SantriMonthlyProgress";
import { useSantriHafalanData } from "@/features/hafalan/hooks/useSantriHafalanData";
import {
  fetchSantriWeeklyExam,
} from "@/features/hafalan/repository";
import {
  formatMonth,
  getCurrentMonthStart,
  getMonthWeeks,
} from "@/features/hafalan/monthly";
import { getErrorMessage } from "@/utils/error";

export default function SantriDashboard() {
  const { user, murojaah, ziyadah, loading, error } = useSantriHafalanData();
  const [monthStart, setMonthStart] = useState(getCurrentMonthStart);
  const [examState, setExamState] = useState(() => ({
    monthStart: getCurrentMonthStart(),
    passedWeeks: {} as Record<string, boolean>,
    loading: true,
    error: null as string | null,
  }));
  const currentExamState =
    examState.monthStart === monthStart
      ? examState
      : {
          monthStart,
          passedWeeks: {},
          loading: Boolean(user),
          error: null,
        };
  const currentMonthStart = getCurrentMonthStart();

  useEffect(() => {
    if (!user || user.role !== "santri") return;

    let active = true;
    const weeks = getMonthWeeks(monthStart);

    void Promise.all(
      weeks.map(async (week) => [
        week.weekStart,
        await fetchSantriWeeklyExam(week.weekStart),
      ] as const),
    )
      .then((results) => {
        if (active) {
          setExamState({
            monthStart,
            passedWeeks: Object.fromEntries(results),
            loading: false,
            error: null,
          });
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setExamState({
            monthStart,
            passedWeeks: {},
            loading: false,
            error: getErrorMessage(cause),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [monthStart, user]);

  const selectedWeeks = useMemo(() => getMonthWeeks(monthStart), [monthStart]);
  const monthlyMurojaah = useMemo(
    () =>
      murojaah.filter((activity) =>
        selectedWeeks.some(
          (week) =>
            activity.date >= week.startDate && activity.date <= week.endDate,
        ),
      ),
    [murojaah, selectedWeeks],
  );
  const monthlyZiyadah = useMemo(
    () =>
      ziyadah.filter((activity) =>
        selectedWeeks.some(
          (week) =>
            activity.date >= week.startDate && activity.date <= week.endDate,
        ),
      ),
    [selectedWeeks, ziyadah],
  );
  const lastActivity = useMemo(() => {
    const activities = [
      ...murojaah.map((activity) => ({
        ...activity,
        activityType: "Murojaah" as const,
      })),
      ...ziyadah.map((activity) => ({
        ...activity,
        activityType: "Ziyadah" as const,
      })),
    ];

    return activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0];
  }, [murojaah, ziyadah]);
  const santriIdentity = murojaah[0] ?? ziyadah[0];

  return (
    <>
      <Header
        title={`Selamat datang, ${user?.name ?? user?.username ?? "Santri"}`}
        subtitle="Lihat progres hafalan dan ziyadah Anda secara personal."
      />

      {loading ? (
        <div className="rounded-2xl border border-blue-100 bg-white p-6 text-sm text-gray-500">
          Memuat progres Anda...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700"
        >
          Gagal memuat progres hafalan: {error}
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Kelas
              </p>
              <p className="mt-3 text-2xl font-bold text-gray-800">
                {santriIdentity?.class ?? "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Halaqah
              </p>
              <p className="mt-3 text-2xl font-bold text-gray-800">
                {santriIdentity?.halaqah_name ?? "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Murojaah
              </p>
              <p className="mt-3 text-2xl font-bold text-gray-800">
                {monthlyMurojaah.length}
              </p>
              <p className="mt-1 text-xs capitalize text-gray-400">
                Catatan pekan {formatMonth(monthStart)}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Ziyadah
              </p>
              <p className="mt-3 text-2xl font-bold text-gray-800">
                {monthlyZiyadah.length}
              </p>
              <p className="mt-1 text-xs capitalize text-gray-400">
                Catatan pekan {formatMonth(monthStart)}
              </p>
            </div>
          </div>

          {lastActivity && (
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 text-sm text-blue-700 shadow-sm sm:block">
              Aktivitas terakhir:{" "}
              <span className="font-semibold">
                {lastActivity.activityType}
                {" — "}
                {new Date(`${lastActivity.date}T00:00:00`).toLocaleDateString(
                  "id-ID",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}
              </span>
            </div>
          )}

          <SantriMonthlyProgress
            key={monthStart}
            monthStart={monthStart}
            currentMonthStart={currentMonthStart}
            murojaah={murojaah}
            ziyadah={ziyadah}
            passedWeeks={currentExamState.passedWeeks}
            examLoading={currentExamState.loading}
            examError={currentExamState.error}
            onChangeMonth={setMonthStart}
          />
        </>
      )}
    </>
  );
}
