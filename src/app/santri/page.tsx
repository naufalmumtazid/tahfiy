"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import SantriUserLists from "@/components/SantriUserLists";
import { getCurrentUser, type AuthUser } from "@/actions/auth";
import type { Murojaah } from "@/features/murojaah/types";
import type { Ziyadah } from "@/features/ziyadah/types";

export default function SantriDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [murojaah, setMurojaah] = useState<Murojaah[]>([]);
  const [ziyadah, setZiyadah] = useState<Ziyadah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const currentUser = await getCurrentUser();

        if (!mounted) return;

        if (!currentUser || currentUser.role !== "santri") {
          router.replace("/login?error=unauthorized");
          return;
        }

        setUser(currentUser);

        const [murojaahResponse, ziyadahResponse] = await Promise.all([
          fetch("/api/murojaah", { credentials: "include" }),
          fetch("/api/ziyadah", { credentials: "include" }),
        ]);

        if (!murojaahResponse.ok || !ziyadahResponse.ok) {
          throw new Error("Failed to load activity data");
        }

        const murojaahData = await murojaahResponse.json();
        const ziyadahData = await ziyadahResponse.json();

        if (!mounted) return;

        setMurojaah((murojaahData.murojaah ?? []) as Murojaah[]);
        setZiyadah((ziyadahData.ziyadah ?? []) as Ziyadah[]);
      } catch {
        if (!mounted) return;
        router.replace("/login?error=unauthorized");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, [router]);

  const totalMurojaah = murojaah.length;
  const totalZiyadah = ziyadah.length;
  const lastActivity = useMemo(() => {
    const activities = [
      ...murojaah.map((activity) => ({
        ...activity,
        activityType: "Tsunnaiyyah" as const,
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

  return (
    <>
      <Header
        title={`Selamat datang, ${user?.username ?? "Santri"}`}
        subtitle="Lihat progres hafalan dan ziyadah Anda secara personal."
      />

      {loading ? (
        <div className="rounded-2xl border border-blue-100 bg-white p-6 text-sm text-gray-500">
          Memuat progres Anda...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Kelas
              </p>
              <p className="mt-3 text-2xl font-bold text-gray-800">
                {murojaah[0]?.class ?? ziyadah[0]?.class ?? "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Halaqah
              </p>
              <p className="mt-3 text-2xl font-bold text-gray-800">
                {murojaah[0]?.halaqah_name ?? ziyadah[0]?.halaqah_name ?? "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Murojaah
              </p>
              <p className="mt-3 text-2xl font-bold text-gray-800">
                {totalMurojaah}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Ziyadah
              </p>
              <p className="mt-3 text-2xl font-bold text-gray-800">
                {totalZiyadah}
              </p>
            </div>
          </div>

          {lastActivity && (
            <div className="mb-6 gap-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 text-sm text-blue-700 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              Aktivitas terakhir:{" "}
              <span className="font-semibold">
                {new Date(`${lastActivity.date}T00:00:00`).toLocaleDateString(
                  "id-ID",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}
                {" — "}
                {lastActivity.activityType}
              </span>
            </div>
          )}

          <SantriUserLists murojaah={murojaah} ziyadah={ziyadah} />
        </>
      )}
    </>
  );
}
