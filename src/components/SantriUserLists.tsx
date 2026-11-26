"use client";

import React, { useState } from "react";
import DataTable from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Murojaah } from "@/features/murojaah/types";
import { Ziyadah } from "@/features/ziyadah/types";
import { formatHafalanDate } from "@/features/hafalan/weekly";
import { getSuratName } from "@/utils/surat";

type Props = {
  murojaah: Murojaah[];
  ziyadah: Ziyadah[];
};

export default function SantriUserLists({ murojaah, ziyadah }: Props) {
  const [activeTab, setActiveTab] = useState<"murojaah" | "ziyadah">(
    "murojaah",
  );
  const murojaahColumns: ColumnDef<Murojaah>[] = [
    {
      header: "No",
      cell: ({ row, table }) =>
        table
          .getPrePaginationRowModel()
          .rows.findIndex((tableRow) => tableRow.id === row.id) + 1,
    },
    {
      accessorKey: "date",
      header: "Tanggal",
      cell: ({ row }) => formatHafalanDate(row.original.date),
    },
    {
      header: "Surat / Ayat",
      cell: ({ row }) => (
        <span>
          {getSuratName(row.original.surat)} ayat {row.original.ayat_mulai} –{" "}
          {getSuratName(row.original.surat_selesai ?? row.original.surat)} ayat{" "}
          {row.original.ayat_selesai}
        </span>
      ),
    },
    {
      header: "Halaman",
      cell: ({ row }) =>
        row.original.jumlah_halaman == null
          ? "Belum dicatat"
          : `${row.original.jumlah_halaman} halaman`,
    },
  ];

  const ziyadahColumns: ColumnDef<Ziyadah>[] = [
    {
      header: "No",
      cell: ({ row, table }) =>
        table
          .getPrePaginationRowModel()
          .rows.findIndex((tableRow) => tableRow.id === row.id) + 1,
    },
    {
      accessorKey: "date",
      header: "Tanggal",
      cell: ({ row }) => formatHafalanDate(row.original.date),
    },
    {
      header: "Surat / Ayat",
      cell: ({ row }) => (
        <span>
          {getSuratName(row.original.surat)} ayat {row.original.ayat_mulai} –{" "}
          {getSuratName(row.original.surat_selesai ?? row.original.surat)} ayat{" "}
          {row.original.ayat_selesai}
        </span>
      ),
    },
    {
      header: "Halaman",
      cell: ({ row }) =>
        row.original.jumlah_halaman == null
          ? "Belum dicatat"
          : `${row.original.jumlah_halaman} halaman`,
    },
  ];

  return (
    <div className="space-y-6">
      <div
        role="group"
        aria-label="Jenis tabel hafalan"
        className="flex gap-2 rounded-2xl border border-blue-100 bg-white p-2 shadow-sm"
      >
        <button
          type="button"
          aria-pressed={activeTab === "murojaah"}
          onClick={() => setActiveTab("murojaah")}
          className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === "murojaah"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          }`}
        >
          Murojaah
          <span className="ml-2 rounded-full bg-white/80 px-2 py-0.5 text-xs">
            {murojaah.length}
          </span>
        </button>
        <button
          type="button"
          aria-pressed={activeTab === "ziyadah"}
          onClick={() => setActiveTab("ziyadah")}
          className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === "ziyadah"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          }`}
        >
          Ziyadah
          <span className="ml-2 rounded-full bg-white/80 px-2 py-0.5 text-xs">
            {ziyadah.length}
          </span>
        </button>
      </div>

      {activeTab === "murojaah" ? (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Murojaah</h2>
          <p className="mb-2 text-xs text-gray-500 sm:hidden">
            Geser tabel ke samping untuk melihat semua kolom.
          </p>
          <DataTable
            columns={murojaahColumns}
            data={murojaah}
            placeholderSearch="Cari murojaah..."
            tableClassName="min-w-[700px]"
          />
        </div>
      ) : (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Ziyadah</h2>
          <p className="mb-2 text-xs text-gray-500 sm:hidden">
            Geser tabel ke samping untuk melihat semua kolom.
          </p>
          <DataTable
            columns={ziyadahColumns}
            data={ziyadah}
            placeholderSearch="Cari ziyadah..."
            tableClassName="min-w-[700px]"
          />
        </div>
      )}
    </div>
  );
}
