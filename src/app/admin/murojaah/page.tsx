"use client";

import React, { useState, useEffect } from "react";
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiAlertCircle } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { getErrorMessage } from "@/utils/error";
import { Halaqah, Murojaah, SantriOption } from "@/types/murojaah";
import { MurojaahFormValues, murojaahSchema } from "@/schemas/murojaah";

export default function MurojaahPage() {
  const [murojaah, setMurojaah] = useState<Murojaah[]>([]);
  const [, setHalaqahs] = useState<Halaqah[]>([]);
  const [santriOptions, setSantriOptions] = useState<SantriOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [selectedMurojaah, setSelectedMurojaah] = useState<Murojaah | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MurojaahFormValues>({
    defaultValues: {
      santri_id: 0,
      date: "",
      juz: 1,
      start_page: 1,
      end_page: 1,
    },
  });

  const fetchMurojaah = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/murojaah");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal memuat daftar murojaah.");
      }
      const data = await response.json();
      setMurojaah(data.murojaah || []);
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
      // Silently fail
    }
  };

  const fetchSantriOptions = async () => {
    try {
      const res = await fetch("/api/santri");
      if (res.ok) {
        const data = await res.json();
        setSantriOptions(data.santri || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    void (async () => {
      await Promise.all([fetchMurojaah(), fetchHalaqahs(), fetchSantriOptions()]);
    })();
  }, []);

  const handleOpenCreate = () => {
    setModalType("create");
    setSelectedMurojaah(null);
    reset({
      santri_id: santriOptions[0]?.id ?? 0,
      date: "",
      juz: 1,
      start_page: 1,
      end_page: 1,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Murojaah) => {
    setModalType("edit");
    setSelectedMurojaah(item);
    reset({
      santri_id: item.santri_id,
      date: item.date,
      juz: item.juz,
      start_page: item.start_page,
      end_page: item.end_page,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const onSubmit = async (values: MurojaahFormValues) => {
    setFormError(null);
    setSubmitLoading(true);

    const result = murojaahSchema.safeParse(values);
    if (!result.success) {
      setFormError(result.error.issues.map((issue) => issue.message).join(". "));
      setSubmitLoading(false);
      return;
    }

    try {
      const url = modalType === "create" ? "/api/murojaah" : `/api/murojaah/${selectedMurojaah?.id}`;
      const method = modalType === "create" ? "POST" : "PUT";
      const payload = {
        santri_id: result.data.santri_id,
        date: result.data.date,
        juz: result.data.juz,
        start_page: result.data.start_page,
        end_page: result.data.end_page,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memproses data.");

      setIsModalOpen(false);
      toast.success(
        modalType === "create" ? "Murojaah baru berhasil ditambahkan!" : "Data murojaah berhasil diperbarui!"
      );
      fetchMurojaah();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (item: Murojaah) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus murojaah "${item.name}"?`)) return;

    try {
      const response = await fetch(`/api/murojaah/${item.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menghapus murojaah.");
      toast.success(`Murojaah "${item.name}" berhasil dihapus.`);
      fetchMurojaah();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const filteredMurojaah = murojaah.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.halaqah_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header
        title="Manajemen Murojaah"
        subtitle="Kelola data murojaah, kelas, dan halaqah dalam sistem"
        showNewSession={false}
        showSearch={false}
      />

      <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 overflow-hidden">
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
            Tambah Murojaah
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
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Nama Santri</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Kelas</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Halaqah</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Tanggal</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Juz / Halaman</th>
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
                    <td className="py-4 px-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                    <td className="py-4 px-4 text-right"><div className="h-8 bg-gray-100 rounded-xl w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredMurojaah.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    Tidak ada data murojaah ditemukan.
                  </td>
                </tr>
              ) : (
                filteredMurojaah.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-2 font-medium text-gray-400">#{item.id}</td>
                    <td className="py-4 px-4 font-semibold text-gray-700">{item.name}</td>
                    <td className="py-4 px-4 text-gray-600">{item.class}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-blue-50 text-blue-600 border-blue-100">
                        {item.halaqah_name}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{item.date}</td>
                    <td className="py-4 px-4 text-gray-600">{item.juz} / {item.start_page}-{item.end_page}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                          title="Edit Murojaah"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Hapus Murojaah"
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
        title={modalType === "create" ? "Tambah Murojaah Baru" : "Edit Data Murojaah"}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            {formError && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3 text-red-700 text-xs">
                <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="font-medium">{formError}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Santri
              </label>
              <select
                {...register("santri_id", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-700 bg-white"
              >
                <option value={0}>-- Pilih Santri --</option>
                {santriOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.class}
                  </option>
                ))}
              </select>
              {errors.santri_id && (
                <p className="mt-2 text-xs text-red-600">{errors.santri_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tanggal</label>
              <input
                type="date"
                {...register("date")}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none text-sm"
              />
              {errors.date && (
                <p className="mt-2 text-xs text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Juz</label>
                <input
                  type="number"
                  min={1}
                  {...register("juz", { valueAsNumber: true })}
                  className="w-full px-4 py-3 border rounded-2xl"
                />
                {errors.juz && (
                  <p className="mt-2 text-xs text-red-600">{errors.juz.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hal. Mulai</label>
                <input
                  type="number"
                  min={1}
                  {...register("start_page", { valueAsNumber: true })}
                  className="w-full px-4 py-3 border rounded-2xl"
                />
                {errors.start_page && (
                  <p className="mt-2 text-xs text-red-600">{errors.start_page.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hal. Selesai</label>
                <input
                  type="number"
                  min={1}
                  {...register("end_page", { valueAsNumber: true })}
                  className="w-full px-4 py-3 border rounded-2xl"
                />
                {errors.end_page && (
                  <p className="mt-2 text-xs text-red-600">{errors.end_page.message}</p>
                )}
              </div>
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
