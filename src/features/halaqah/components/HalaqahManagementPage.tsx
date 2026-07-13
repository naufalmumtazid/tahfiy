"use client";

import React from "react";
import { FiAlertCircle, FiSearch, FiUserPlus } from "react-icons/fi";
import Header from "@/components/Header";
import { useHalaqahManagement } from "../hooks/useHalaqahManagement";
import { HalaqahFormModal } from "./HalaqahFormModal";
import { HalaqahCard } from "./HalaqahCard";

export function HalaqahManagementPage() {
  const {
    halaqahs,
    ustadzOptions,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    isHalaqahModalOpen,
    setHalaqahModalOpen,
    halaqahModalMode,
    selectedHalaqah,
    submitLoading,
    formError,
    openCreateHalaqah,
    openEditHalaqah,
    handleHalaqahSubmit,
    handleDeleteHalaqah,
  } = useHalaqahManagement();

  return (
    <>
      <Header title="Manajemen Halaqah" subtitle="Kelola data halaqah dan ustadz pembina" showNewSession={false} showSearch={false} />

      <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <FiSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari berdasarkan nama halaqah atau ustadz..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-12 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button onClick={openCreateHalaqah} className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 cursor-pointer">
            <FiUserPlus className="h-4 w-4" />
            Tambah Halaqah
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700">
            <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Gagal memuat data</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-2xl border border-blue-50 bg-gray-50" />)
            : halaqahs.length === 0
              ? <div className="col-span-full py-10 text-center text-gray-400">Tidak ada data halaqah ditemukan.</div>
              : halaqahs.map((item) => (
                  <HalaqahCard
                    key={item.id}
                    item={item}
                    onEdit={openEditHalaqah}
                    onDelete={handleDeleteHalaqah}
                  />
                ))}
        </div>
      </div>

      <HalaqahFormModal
        isOpen={isHalaqahModalOpen}
        onClose={() => setHalaqahModalOpen(false)}
        mode={halaqahModalMode}
        initialData={selectedHalaqah}
        ustadzOptions={ustadzOptions}
        loading={submitLoading}
        error={formError}
        onSubmit={handleHalaqahSubmit}
      />
    </>
  );
}
