"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { SantriMonthlyProgress } from "@/features/hafalan/components/SantriMonthlyProgress";
import {
  useSantriDashboardData,
  useSantriWeeklyExamData,
} from "@/features/hafalan/hooks/useSantriDashboardData";
import {
  formatMonth,
  getCurrentMonthStart,
} from "@/features/hafalan/monthly";

export default function SantriDashboard() {
  const [monthStart, setMonthStart] = useState(getCurrentMonthStart);
  const { data, loading, error } = useSantriDashboardData(monthStart);
  const examState = useSantriWeeklyExamData(monthStart);
  const currentMonthStart = getCurrentMonthStart();
  const user = data?.user;
  const murojaah = data?.murojaah ?? [];
  const ziyadah = data?.ziyadah ?? [];
  const santriIdentity = data?.identity;

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
                {murojaah.length}
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
                {ziyadah.length}
              </p>
              <p className="mt-1 text-xs capitalize text-gray-400">
                Catatan pekan {formatMonth(monthStart)}
              </p>
            </div>
          </div>

          {data?.latestActivity && (
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 text-sm text-blue-700 shadow-sm sm:block">
              Aktivitas terakhir:{" "}
              <span className="font-semibold">
                {data.latestActivity.activityType}
                {" — "}
                {new Date(
                  `${data.latestActivity.date}T00:00:00`,
                ).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          <SantriMonthlyProgress
            key={monthStart}
            monthStart={monthStart}
            currentMonthStart={currentMonthStart}
            murojaah={murojaah}
            ziyadah={ziyadah}
            passedWeeks={examState.passedWeeks}
            examLoading={examState.loading}
            examError={examState.error}
            onChangeMonth={setMonthStart}
          />
        </>
      )}
    </>
  );
}
