"use client";

import React, { useEffect, useState } from "react";
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { getErrorMessage } from "@/utils/error";

interface Ustadz {
  id: number;
  user_id: number;
  name: string;
  specialization: string;
  phone: string;
}

interface AvailableUser {
  id: number;
  username: string;
  name: string;
}

export default function UstadzPage() {
  const [ustadz, setUstadz] = useState<Ustadz[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [selectedUstadz, setSelectedUstadz] = useState<Ustadz | null>(null);

  const [userIdInput, setUserIdInput] = useState<string>("");
  const [specializationInput, setSpecializationInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal memuat daftar pengguna.");
      }
      const data = await response.json();
      const users = (data.users || []) as Array<AvailableUser & { role?: string }>;
      setAvailableUsers(users.filter((user) => user.role === "ustadz"));
    } catch (err: unknown) {
      console.error(getErrorMessage(err));
    }
  };

  const fetchUstadz = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ustadz");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal memuat daftar ustadz.");
      }
      const data = await response.json();
      setUstadz(data.ustadz || []);
      setApiError(null);
    } catch (err: unknown) {
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await Promise.all([fetchUstadz(), fetchAvailableUsers()]);
    })();
  }, []);

  const handleOpenCreate = () => {
    setModalType("create");
    setSelectedUstadz(null);
    setUserIdInput(availableUsers[0]?.id?.toString() || "");
    setSpecializationInput("");
    setPhoneInput("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ustadz: Ustadz) => {
    setModalType("edit");
    setSelectedUstadz(ustadz);
    setUserIdInput(ustadz.user_id.toString());
    setSpecializationInput(ustadz.specialization);
    setPhoneInput(ustadz.phone);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitLoading(true);

    try {
      const url = modalType === "create" ? "/api/ustadz" : `/api/ustadz/${selectedUstadz?.id}`;
      const method = modalType === "create" ? "POST" : "PUT";
      const payload = {
        user_id: parseInt(userIdInput, 10),
        specialization: specializationInput,
        phone: phoneInput,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memproses data ustadz.");

      setIsModalOpen(false);
      toast.success(modalType === "create" ? "Ustadz berhasil ditambahkan!" : "Data ustadz berhasil diperbarui!");
      fetchUstadz();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (ustadz: Ustadz) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ustadz "${ustadz.name}"?`)) return;

    try {
      const response = await fetch(`/api/ustadz/${ustadz.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menghapus ustadz.");
      toast.success(`Ustadz "${ustadz.name}" berhasil dihapus.`);
      fetchUstadz();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const filteredUstadz = ustadz.filter((ustadz) =>
    ustadz.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableCreateUsers = availableUsers.filter(
    (user) => !ustadz.some((item) => item.user_id === user.id)
  );

  return (
    <>
      <Header
        title="Manajemen Ustadz"
        subtitle="Kelola daftar ustadz dalam sistem"
        showNewSession={false}
        showSearch={false}
      />

      <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari ustadz berdasarkan nama..."
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
            Tambah Ustadz
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
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Nama Ustadz</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Spesialisasi</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Telepon</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider text-right">Aksi</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-blue-50/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-2"><div className="h-4 bg-gray-100 rounded w-6" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-100 rounded w-48" /></td>
                    <td className="py-4 px-4 text-right"><div className="h-8 bg-gray-100 rounded-xl w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUstadz.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-gray-400">
                    Tidak ada data ustadz ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUstadz.map((ustadz) => (
                  <tr key={ustadz.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-2 font-medium text-gray-400">#{ustadz.id}</td>
                    <td className="py-4 px-4 font-semibold text-gray-700">{ustadz.name}</td>
                    <td className="py-4 px-4 text-gray-600">{ustadz.specialization || "-"}</td>
                    <td className="py-4 px-4 text-gray-600">{ustadz.phone || "-"}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(ustadz)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                          title="Edit Ustadz"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ustadz)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Hapus Ustadz"
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
        title={modalType === "create" ? "Tambah Ustadz Baru" : "Edit Ustadz"}
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
                Pilih User Ustadz <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-800 bg-white"
              >
                <option value="">Pilih user dengan role ustadz...</option>
                {(modalType === "edit" ? availableUsers : availableCreateUsers).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.username})
                  </option>
                ))}
              </select>
              {(modalType === "create" && availableCreateUsers.length === 0) && (
                <p className="mt-2 text-xs text-gray-500">
                  Belum ada user ustadz yang belum terdaftar. Tambahkan user terlebih dahulu di menu Pengguna.
                </p>
              )}
              {(modalType === "edit" && availableUsers.length === 0) && (
                <p className="mt-2 text-xs text-gray-500">
                  Tidak ada user ustadz yang tersedia untuk dipilih.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Spesialisasi
              </label>
              <input
                type="text"
                value={specializationInput}
                onChange={(e) => setSpecializationInput(e.target.value)}
                placeholder="Masukkan spesialisasi"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-800 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Telepon
              </label>
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Masukkan nomor telepon"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-800 placeholder-gray-400"
              />
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
              disabled={submitLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
            >
              {submitLoading ? "Memproses..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}