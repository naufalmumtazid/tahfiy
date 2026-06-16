"use client";

import React, { useEffect, useState } from "react";
import { FiBookOpen, FiEdit2, FiTrash2, FiSearch, FiAlertCircle, FiCheckCircle, FiUserPlus } from "react-icons/fi";
import Header from "@/components/Header";
import Modal from "@/components/Modal";

interface Halaqah {
  id: number;
  name: string;
  ustadz_id: number;
  ustadz_name: string;
}

interface Ustadz {
  id: number;
  name: string;
}

export default function HalaqahPage() {
  const [halaqahs, setHalaqahs] = useState<Halaqah[]>([]);
  const [ustadzList, setUstadzList] = useState<Ustadz[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [selectedHalaqah, setSelectedHalaqah] = useState<Halaqah | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [ustadzInput, setUstadzInput] = useState<number | "">("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchHalaqahs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/halaqah");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal memuat daftar halaqah.");
      }
      const data = await response.json();
      setHalaqahs(data.halaqahs || []);
      setApiError(null);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUstadz = async () => {
    try {
      const response = await fetch("/api/ustadz");
      if (response.ok) {
        const data = await response.json();
        setUstadzList(data.ustadz || []);
      }
    } catch {
      // ignore here; used only for select options
    }
  };

  useEffect(() => {
    fetchHalaqahs();
    fetchUstadz();
  }, []);

  const triggerSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleOpenCreate = () => {
    setModalType("create");
    setSelectedHalaqah(null);
    setNameInput("");
    setUstadzInput(ustadzList[0]?.id ?? "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (halaqah: Halaqah) => {
    setModalType("edit");
    setSelectedHalaqah(halaqah);
    setNameInput(halaqah.name);
    setUstadzInput(halaqah.ustadz_id);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitLoading(true);

    try {
      const url = modalType === "create" ? "/api/halaqah" : `/api/halaqah/${selectedHalaqah?.id}`;
      const method = modalType === "create" ? "POST" : "PUT";
      const payload = { name: nameInput, ustadz_id: ustadzInput };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memproses data halaqah.");

      setIsModalOpen(false);
      triggerSuccess(modalType === "create" ? "Halaqah berhasil ditambahkan!" : "Data halaqah berhasil diperbarui!");
      fetchHalaqahs();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (halaqah: Halaqah) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus halaqah "${halaqah.name}"?`)) return;

    try {
      const response = await fetch(`/api/halaqah/${halaqah.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menghapus halaqah.");
      triggerSuccess(`Halaqah "${halaqah.name}" berhasil dihapus.`);
      fetchHalaqahs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredHalaqahs = halaqahs.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.ustadz_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header
        title="Manajemen Halaqah"
        subtitle="Kelola daftar halaqah dan ustadz pengajar dalam sistem"
        showNewSession={false}
        showSearch={false}
      />

      {successMessage && (
        <div className="fixed top-6 right-6 bg-white border border-blue-100 text-blue-800 px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-100">
          <FiCheckCircle className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama halaqah atau ustadz..."
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
            Tambah Halaqah
          </button>
        </div>

        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
            <FiAlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Gagal memuat data</p>
              <p className="mt-0.5">{apiError}</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-50 text-left text-gray-400 font-medium">
                <th className="py-4 px-2 text-xs uppercase tracking-wider">ID</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Nama Halaqah</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Ustadz</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-2"><div className="h-4 bg-gray-100 rounded w-6" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-100 rounded w-40" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-100 rounded w-32" /></td>
                    <td className="py-4 px-4 text-right"><div className="h-8 bg-gray-100 rounded-xl w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredHalaqahs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400">
                    Tidak ada data halaqah ditemukan.
                  </td>
                </tr>
              ) : (
                filteredHalaqahs.map((halaqah) => (
                  <tr key={halaqah.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-2 font-medium text-gray-400">#{halaqah.id}</td>
                    <td className="py-4 px-4 font-semibold text-gray-700">{halaqah.name}</td>
                    <td className="py-4 px-4 text-gray-600">{halaqah.ustadz_name}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(halaqah)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                          title="Edit Halaqah"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(halaqah)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Hapus Halaqah"
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === "create" ? "Tambah Halaqah Baru" : "Edit Halaqah"}
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
                Nama Halaqah
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Masukkan nama halaqah"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-800 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Ustadz
              </label>
              {ustadzList.length > 0 ? (
                <select
                  required
                  value={ustadzInput}
                  onChange={(e) => setUstadzInput(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-700 bg-white"
                >
                  <option value="">-- Pilih Ustadz --</option>
                  {ustadzList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                  Tidak ada data ustadz. Tambahkan ustadz terlebih dahulu supaya halaqah bisa dibuat.
                </div>
              )}
            </div>
          </div>

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
              disabled={submitLoading || ustadzList.length === 0}
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
