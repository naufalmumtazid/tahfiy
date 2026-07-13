"use client";

import React, { useState } from "react";
import Select from "react-select";
import Modal from "@/components/Modal";
import { HalaqahItem, CreateSantriPayload, SantriItem, UpdateSantriPayload } from "../types";

interface SantriFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData: SantriItem | null;
  halaqahOptions: HalaqahItem[];
  selectedHalaqahId: number | null;
  loading: boolean;
  error: string | null;
  onSubmit: (payload: CreateSantriPayload | UpdateSantriPayload) => Promise<void>;
}

export function SantriFormModal({
  isOpen,
  onClose,
  mode,
  initialData,
  halaqahOptions,
  selectedHalaqahId,
  loading,
  error,
  onSubmit,
}: SantriFormModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [className, setClassName] = useState(initialData?.class || "");
  const [halaqahId, setHalaqahId] = useState<number | "">(selectedHalaqahId || initialData?.halaqah_id || "");

  const formKey = `${mode}-${initialData?.id ?? "new"}-${isOpen ? "open" : "closed"}`;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({ name, class: className, halaqah_id: halaqahId });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === "create" ? "Tambah Santri" : "Edit Santri"}>
      <form key={formKey} onSubmit={handleSubmit}>
        <div className="p-6 space-y-4">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm"
              placeholder="Masukkan nama santri"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Kelas
            </label>
            <input
              value={className}
              onChange={(event) => setClassName(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm"
              placeholder="Contoh: 7A"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Halaqah <span className="text-red-500">*</span>
            </label>
            <Select
              options={halaqahOptions.map((item) => ({ value: item.id, label: item.name }))}
              value={halaqahOptions.find((item) => item.id === halaqahId) ? { value: halaqahId as number, label: halaqahOptions.find((item) => item.id === halaqahId)?.name || "" } : null}
              onChange={(option) => setHalaqahId(option ? option.value : "")}
              placeholder="Pilih halaqah"
              isClearable
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 rounded-b-3xl border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100">
            Batal
          </button>
          <button type="submit" disabled={loading} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-400">
            {loading ? "Memproses..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
