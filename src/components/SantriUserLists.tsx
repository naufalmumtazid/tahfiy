"use client";

import React from "react";
import DataTable from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Murojaah } from "@/features/murojaah/types";
import { Ziyadah } from "@/features/ziyadah/types";

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
      cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
    },
    { accessorKey: "surat", header: "Surat" },
    { accessorKey: "ayat_mulai", header: "Ayat Mulai" },
    { accessorKey: "ayat_selesai", header: "Ayat Selesai" },
    { accessorKey: "halaqah_name", header: "Halaqah" },
    { accessorKey: "class", header: "Kelas" },
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
      cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
    },
    { accessorKey: "surat", header: "Surat" },
    { accessorKey: "ayat_mulai", header: "Ayat Mulai" },
    { accessorKey: "ayat_selesai", header: "Ayat Selesai" },
    { accessorKey: "halaqah_name", header: "Halaqah" },
    { accessorKey: "class", header: "Kelas" },
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
