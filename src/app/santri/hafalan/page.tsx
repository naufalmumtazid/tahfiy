"use client";

import Header from "@/components/Header";
import SantriUserLists from "@/components/SantriUserLists";
import { useSantriHafalanData } from "@/features/hafalan/hooks/useSantriHafalanData";

export default function SantriHafalanPage() {
  const { murojaah, ziyadah, loading, error } = useSantriHafalanData();

  return (
    <>
      <Header
        title="Riwayat Hafalan"
        subtitle="Lihat catatan Murojaah dan Ziyadah Anda."
      />

      {loading ? (
        <div className="rounded-2xl border border-blue-100 bg-white p-6 text-sm text-gray-500">
          Memuat riwayat hafalan...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700"
        >
          Gagal memuat riwayat hafalan: {error}
        </div>
      ) : (
        <SantriUserLists murojaah={murojaah} ziyadah={ziyadah} />
      )}
    </>
  );
}
