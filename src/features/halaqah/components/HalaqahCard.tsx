"use client";

import React from "react";
import Link from "next/link";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { HalaqahItem } from "../types";

interface HalaqahCardProps {
  item: HalaqahItem;
  onEdit: (item: HalaqahItem) => void;
  onDelete: (item: HalaqahItem) => void;
}

export function HalaqahCard({
  item,
  onEdit,
  onDelete,
}: HalaqahCardProps) {
  return (
    <Link href={`/admin/halaqah/${item.id}`}>
    <div className="rounded-2xl border border-blue-50 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
          <p className="mt-1 text-sm text-gray-500">Ustadz: {item.ustadz_name}</p>
          <p className="mt-2 text-xs text-gray-400">ID: #{item.id}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button onClick={() => onEdit(item)} className="rounded-xl p-2 text-blue-600 hover:bg-blue-50" title="Edit Halaqah">
              <FiEdit2 className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(item)} className="rounded-xl p-2 text-red-500 hover:bg-red-50" title="Hapus Halaqah">
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </Link>
  );
}
