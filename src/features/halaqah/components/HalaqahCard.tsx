"use client";

import React from "react";
import Link from "next/link";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { HalaqahItem } from "../types";

interface HalaqahCardProps {
  item: HalaqahItem;
  baseUrl: string;
  canManage?: boolean;
  onEdit?: (item: HalaqahItem) => void;
  onDelete?: (item: HalaqahItem) => void;
}

export function HalaqahCard({
  item,
  baseUrl,
  canManage = false,
  onEdit,
  onDelete,
}: HalaqahCardProps) {
  return (
    // 💡 Menggunakan baseUrl dinamis agar fleksibel untuk semua role
    <Link href={`${baseUrl}/halaqah/${item.id}`}>
      <div className="rounded-2xl border border-blue-50 bg-white p-6 shadow-sm hover:border-blue-100 transition">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
            <p className="mt-1 text-sm text-gray-500">Ustadz: {item.ustadz_name}</p>
            <p className="mt-2 text-xs text-gray-400">ID: #{item.id}</p>
          </div>
          
          {/* 💡 Aksi hanya muncul jika user memiliki role yang diizinkan (canManage) */}
          {canManage && (onEdit || onDelete) && (
            <div className="flex flex-col items-end gap-2" onClick={(e) => e.preventDefault()}>
              {/* e.preventDefault() mencegah Link utama terpicu saat tombol diklik */}
              <div className="flex gap-2">
                {onEdit && (
                  <button onClick={() => onEdit(item)} className="rounded-xl p-2 text-blue-600 hover:bg-blue-50" title="Edit Halaqah">
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(item)} className="rounded-xl p-2 text-red-500 hover:bg-red-50" title="Hapus Halaqah">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}