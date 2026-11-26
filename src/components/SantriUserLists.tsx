"use client";

import React from "react";
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
      <div>
        <h2 className="text-lg font-semibold mb-3">Murojaah</h2>
        <DataTable
          columns={murojaahColumns}
          data={murojaah}
          placeholderSearch="Cari murojaah..."
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Ziyadah</h2>
        <DataTable
          columns={ziyadahColumns}
          data={ziyadah}
          placeholderSearch="Cari ziyadah..."
        />
      </div>
    </div>
  );
}
