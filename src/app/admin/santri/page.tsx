"use client";

import React, { Suspense } from "react";
import Select from "react-select";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { useSantriManagement } from "@/features/santri/hooks/useSantriManagement";

function SantriPageContent() {
  const searchParams = useSearchParams();
  const halaqahIdParam = searchParams.get("halaqahId");

  const {
    santri,
    halaqahs,
    searchQuery,
    setSearchQuery,
    loading,
    apiError,
    isModalOpen,
    setIsModalOpen,
    modalType,
    nameInput,
    setNameInput,
    classInput,
    setClassInput,
    halaqahInput,
    setHalaqahInput,
    submitLoading,
    formError,
    handleOpenCreate,
    handleOpenEdit,
    handleSubmit,
    handleDelete,
  } = useSantriManagement();

  const filteredHalaqah = halaqahIdParam
    ? halaqahs.find((h) => h.id === Number(halaqahIdParam))
    : null;

  const subtitle = filteredHalaqah
    ? `Kelola data santri untuk halaqah "${filteredHalaqah.name}"`
    : "Kelola data santri, kelas, dan halaqah dalam sistem";

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/halaqah"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
        >
          <FiArrowLeft className="w-4 h-4" />
          Kembali ke Halaqah
        </Link>
      </div>

      <Header
        title="Manajemen Santri"
        subtitle={subtitle}
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
            Tambah Santri
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
              ) : santri.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    Tidak ada data santri ditemukan.
                  </td>
                </tr>
              ) : (
                santri.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-2 font-medium text-gray-400">#{item.id}</td>
                    <td className="py-4 px-4 font-semibold text-gray-700">{item.name}</td>
                    <td className="py-4 px-4 text-gray-600">{item.class}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-blue-50 text-blue-600 border-blue-100">
                        {item.halaqah_name}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                          title="Edit Santri"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
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
                Nama Lengkap <span className="text-red-500">*</span>
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
                value={classInput}
                onChange={(e) => setClassInput(e.target.value)}
                placeholder="Contoh: 7A, 8B, 9C"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-800 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Halaqah <span className="text-red-500">*</span>
              </label>
              <Select
                options={halaqahs.map((h) => ({ value: h.id, label: h.name }))}
                value={halaqahs.find((h) => h.id === halaqahInput) ? { value: halaqahInput as number, label: halaqahs.find((h) => h.id === halaqahInput)?.name || "" } : null}
                onChange={(option) => setHalaqahInput(option?.value ?? "")}
                placeholder="Pilih Halaqah..."
                classNamePrefix="react-select"
                className="text-sm"
                isClearable
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

export default function SantriPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <SantriPageContent />
    </Suspense>
  );
}
