"use client";

import React, { useState, useEffect } from "react";
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { getErrorMessage } from "@/utils/error";

interface Halaqah {
  id: number;
  name: string;
}

interface Santri {
  id: number;
  name: string;
  class: string;
  halaqah_id: number;
  halaqah_name: string;
}

export default function SantriPage() {
  const [santri, setSantri] = useState<Santri[]>([]);
  const [halaqahs, setHalaqahs] = useState<Halaqah[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);

  // Form State
  const [nameInput, setNameInput] = useState("");
  const [classInput, setClassInput] = useState("");
  const [halaqahInput, setHalaqahInput] = useState<number | "">("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchSantri = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/santri");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal memuat daftar santri.");
      }
      const data = await response.json();
      setSantri(data.santri || []);
      setApiError(null);
    } catch (err: unknown) {
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchHalaqahs = async () => {
    try {
      const response = await fetch("/api/halaqah");
      if (response.ok) {
        const data = await response.json();
        setHalaqahs(data.halaqahs || []);
      }
    } catch {
      // Silently fail – halaqah list is a convenience feature
    }
  };

  useEffect(() => {
    void (async () => {
      await Promise.all([fetchSantri(), fetchHalaqahs()]);
    })();
  }, []);

  const handleOpenCreate = () => {
    setModalType("create");
    setSelectedSantri(null);
    setNameInput("");
    setClassInput("");
    setHalaqahInput(halaqahs[0]?.id ?? "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (santri: Santri) => {
    setModalType("edit");
    setSelectedSantri(santri);
    setNameInput(santri.name);
    setClassInput(santri.class);
    setHalaqahInput(santri.halaqah_id);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitLoading(true);

    try {
      const url = modalType === "create" ? "/api/santri" : `/api/santri/${selectedSantri?.id}`;
      const method = modalType === "create" ? "POST" : "PUT";
      const payload = { name: nameInput, class: classInput, halaqah_id: halaqahInput };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memproses data.");

      setIsModalOpen(false);
      toast.success(
        modalType === "create" ? "Santri baru berhasil ditambahkan!" : "Data santri berhasil diperbarui!"
      );
      fetchSantri();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (santri: Santri) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus santri "${santri.name}"?`)) return;

    try {
      const response = await fetch(`/api/santri/${santri.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menghapus santri.");
      toast.success(`Santri "${santri.name}" berhasil dihapus.`);
      fetchSantri();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const filteredSantri = santri.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.halaqah_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header
        title="Manajemen Santri"
        subtitle="Kelola data santri, kelas, dan halaqah dalam sistem"
        showNewSession={false}
        showSearch={false}
      />

      <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 overflow-hidden">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, kelas, atau halaqah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm bg-gray-50/50"
            />
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiUserPlus className="w-4 h-4" />
            Tambah Santri
          </button>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
            <FiAlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Gagal memuat data</p>
              <p className="mt-0.5">{apiError}</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-50 text-left text-gray-400 font-medium">
                <th className="py-4 px-2 text-xs uppercase tracking-wider">ID</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Nama Santri</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Kelas</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Halaqah</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-2"><div className="h-4 bg-gray-100 rounded w-6" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-100 rounded w-40" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-100 rounded w-12" /></td>
                    <td className="py-4 px-4"><div className="h-6 bg-gray-100 rounded-full w-28" /></td>
                    <td className="py-4 px-4 text-right"><div className="h-8 bg-gray-100 rounded-xl w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredSantri.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    Tidak ada data santri ditemukan.
                  </td>
                </tr>
              ) : (
                filteredSantri.map((santri) => (
                  <tr key={santri.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-2 font-medium text-gray-400">#{santri.id}</td>
                    <td className="py-4 px-4 font-semibold text-gray-700">{santri.name}</td>
                    <td className="py-4 px-4 text-gray-600">{santri.class}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-blue-50 text-blue-600 border-blue-100">
                        {santri.halaqah_name}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(santri)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                          title="Edit Santri"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(santri)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Hapus Santri"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === "create" ? "Tambah Santri Baru" : "Edit Data Santri"}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {formError && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3 text-red-700 text-xs">
                <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="font-medium">{formError}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Masukkan nama lengkap santri"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-800 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Kelas
              </label>
              <input
                type="text"
                required
                value={classInput}
                onChange={(e) => setClassInput(e.target.value)}
                placeholder="Contoh: 7A, 8B, 9C"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-800 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Halaqah
              </label>
              {halaqahs.length > 0 ? (
                <select
                  required
                  value={halaqahInput}
                  onChange={(e) => setHalaqahInput(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-700 bg-white"
                >
                  <option value="">-- Pilih Halaqah --</option>
                  {halaqahs.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  required
                  value={halaqahInput}
                  onChange={(e) => setHalaqahInput(Number(e.target.value))}
                  placeholder="ID Halaqah"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-800 placeholder-gray-400"
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-3xl flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10 flex items-center gap-2 cursor-pointer"
            >
              {submitLoading ? "Memproses..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
