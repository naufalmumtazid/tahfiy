"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiAlertCircle,
  FiUsers,
  FiUser,
  FiBookOpen,
  FiCalendar,
} from "react-icons/fi";
import Header from "@/components/Header";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { getErrorMessage } from "@/utils/error";
import { getSuratName, suratOptions } from "@/utils/surat";

// Halaqah Imports
import { SantriFormModal } from "@/features/halaqah/components/SantriFormModal";
import {
  fetchHalaqahs,
  fetchSantriByHalaqah,
  createSantri,
  updateSantri,
  deleteSantri,
} from "@/features/halaqah/repository";
import {
  HalaqahItem,
  SantriItem,
  CreateSantriPayload,
  UpdateSantriPayload,
} from "@/features/halaqah/types";

// Ziyadah Imports
import { ZiyadahFormValues, ziyadahSchema } from "@/features/ziyadah/schemas";
import {
  createZiyadah,
  deleteZiyadah,
  fetchZiyadah,
  updateZiyadah,
} from "@/features/ziyadah/repository";
import { Ziyadah as ZiyadahType } from "@/features/ziyadah/types";

// Murojaah Imports
import {
  MurojaahFormValues,
  murojaahSchema,
} from "@/features/murojaah/schemas";
import {
  createMurojaah,
  deleteMurojaah,
  fetchMurojaah,
  updateMurojaah,
} from "@/features/murojaah/repository";
import { Murojaah as MurojaahType } from "@/features/murojaah/types";

export default function HalaqahDetailPage() {
  const params = useParams();
  const idStr = params.id as string;
  const halaqahId = parseInt(idStr, 10);

  const [activeTab, setActiveTab] = useState<"santri" | "ziyadah" | "murojaah">(
    "santri",
  );

  // Core Data States
  const [halaqah, setHalaqah] = useState<HalaqahItem | null>(null);
  const [halaqahs, setHalaqahs] = useState<HalaqahItem[]>([]);
  const [santri, setSantri] = useState<SantriItem[]>([]);
  const [ziyadahList, setZiyadahList] = useState<ZiyadahType[]>([]);
  const [murojaahList, setMurojaahList] = useState<MurojaahType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecordSantri, setSelectedRecordSantri] =
    useState<SantriItem | null>(null);

  // Santri Modal States
  const [isSantriModalOpen, setIsSantriModalOpen] = useState(false);
  const [santriModalMode, setSantriModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [selectedSantri, setSelectedSantri] = useState<SantriItem | null>(null);
  const [santriSubmitLoading, setSantriSubmitLoading] = useState(false);
  const [santriFormError, setSantriFormError] = useState<string | null>(null);

  // Ziyadah Modal States
  const [isZiyadahModalOpen, setIsZiyadahModalOpen] = useState(false);
  const [ziyadahModalMode, setZiyadahModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [selectedZiyadah, setSelectedZiyadah] = useState<ZiyadahType | null>(
    null,
  );
  const [ziyadahSubmitLoading, setZiyadahSubmitLoading] = useState(false);
  const [ziyadahFormError, setZiyadahFormError] = useState<string | null>(null);

  // Murojaah Modal States
  const [isMurojaahModalOpen, setIsMurojaahModalOpen] = useState(false);
  const [murojaahModalMode, setMurojaahModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [selectedMurojaah, setSelectedMurojaah] = useState<MurojaahType | null>(
    null,
  );
  const [murojaahSubmitLoading, setMurojaahSubmitLoading] = useState(false);
  const [murojaahFormError, setMurojaahFormError] = useState<string | null>(
    null,
  );

  // React Hook Forms for Ziyadah & Murojaah
  const {
    register: registerZiyadah,
    control: controlZiyadah,
    handleSubmit: handleSubmitZiyadah,
    reset: resetZiyadah,
    formState: { errors: errorsZiyadah },
  } = useForm<ZiyadahFormValues>({
    defaultValues: {
      santri_id: 0,
      date: new Date().toISOString().split("T")[0],
      surat: 1,
      ayat_mulai: 1,
      ayat_selesai: 1,
    },
  });

  const {
    register: registerMurojaah,
    control: controlMurojaah,
    handleSubmit: handleSubmitMurojaah,
    reset: resetMurojaah,
    formState: { errors: errorsMurojaah },
  } = useForm<MurojaahFormValues>({
    defaultValues: {
      santri_id: 0,
      date: new Date().toISOString().split("T")[0],
      surat: 1,
      ayat_mulai: 1,
      ayat_selesai: 1,
    },
  });

  // Reusable fetcher for manual refreshes (e.g., after submit/delete)
  const loadData = useCallback(async () => {
    try {
      const [allHalaqahs, santriList, allZiyadah, allMurojaah] =
        await Promise.all([
          fetchHalaqahs(),
          fetchSantriByHalaqah(halaqahId),
          fetchZiyadah(),
          fetchMurojaah(),
        ]);

      setHalaqahs(allHalaqahs);
      const found = allHalaqahs.find((h) => h.id === halaqahId);
      if (found) {
        setHalaqah(found);
      } else {
        setError("Halaqah tidak ditemukan.");
      }

      setSantri(santriList);

      // Filter ziyadah & murojaah records to only contain students belonging to this halaqah
      const santriIds = new Set(santriList.map((s) => s.id));
      setZiyadahList(allZiyadah.filter((z) => santriIds.has(z.santri_id)));
      setMurojaahList(allMurojaah.filter((m) => santriIds.has(m.santri_id)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [halaqahId]);

  // Handle initial data loading inside effect without triggering synchronous state updates
  useEffect(() => {
    if (!halaqahId) return;

    let isMounted = true;

    const initLoad = async () => {
      setLoading(true);
      setError(null);
      await loadData();
    };

    // Execute via microtask boundary to prevent cascading render warnings
    queueMicrotask(() => {
      if (isMounted) {
        void initLoad();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [halaqahId, loadData]);

  // --- Santri CRUD Handlers ---
  const openCreateSantri = () => {
    setSantriModalMode("create");
    setSelectedSantri(null);
    setSantriFormError(null);
    setIsSantriModalOpen(true);
  };

  const openEditSantri = (row: SantriItem) => {
    setSantriModalMode("edit");
    setSelectedSantri(row);
    setSantriFormError(null);
    setIsSantriModalOpen(true);
  };

  const handleSantriSubmit = async (
    payload: CreateSantriPayload | UpdateSantriPayload,
  ) => {
    setSantriSubmitLoading(true);
    setSantriFormError(null);
    try {
      if (santriModalMode === "create") {
        await createSantri(payload as CreateSantriPayload);
        toast.success("Santri baru berhasil ditambahkan!");
      } else if (selectedSantri) {
        await updateSantri(selectedSantri.id, payload as UpdateSantriPayload);
        toast.success("Data santri berhasil diperbarui!");
      }
      setIsSantriModalOpen(false);
      // Refresh list
      const updatedList = await fetchSantriByHalaqah(halaqahId);
      setSantri(updatedList);
    } catch (err) {
      setSantriFormError(getErrorMessage(err));
    } finally {
      setSantriSubmitLoading(false);
    }
  };

  const handleDeleteSantri = async (row: SantriItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus santri "${row.name}"?`))
      return;
    try {
      await deleteSantri(row.id);
      toast.success(`Santri "${row.name}" berhasil dihapus.`);
      const updatedList = await fetchSantriByHalaqah(halaqahId);
      setSantri(updatedList);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // --- Ziyadah CRUD Handlers ---
  const openCreateZiyadah = () => {
    setZiyadahModalMode("create");
    setSelectedZiyadah(null);
    resetZiyadah({
      santri_id: selectedRecordSantri?.id ?? 0,
      date: new Date().toISOString().split("T")[0],
      surat: 1,
      ayat_mulai: 1,
      ayat_selesai: 1,
    });
    setZiyadahFormError(null);
    setIsZiyadahModalOpen(true);
  };

  const openEditZiyadah = (item: ZiyadahType) => {
    setZiyadahModalMode("edit");
    setSelectedZiyadah(item);
    resetZiyadah({
      santri_id: item.santri_id,
      date: item.date,
      surat: item.surat,
      ayat_mulai: item.ayat_mulai,
      ayat_selesai: item.ayat_selesai,
    });
    setZiyadahFormError(null);
    setIsZiyadahModalOpen(true);
  };

  const handleZiyadahSubmit = async (values: ZiyadahFormValues) => {
    setZiyadahFormError(null);
    setZiyadahSubmitLoading(true);

    const result = ziyadahSchema.safeParse(values);
    if (!result.success) {
      setZiyadahFormError(result.error.issues.map((i) => i.message).join(". "));
      setZiyadahSubmitLoading(false);
      return;
    }

    try {
      const payload = {
        santri_id: result.data.santri_id,
        date: result.data.date,
        surat: result.data.surat,
        ayat_mulai: result.data.ayat_mulai,
        ayat_selesai: result.data.ayat_selesai,
      };

      if (ziyadahModalMode === "create") {
        await createZiyadah(payload);
        toast.success("Ziyadah baru berhasil ditambahkan!");
      } else if (selectedZiyadah) {
        await updateZiyadah(selectedZiyadah.id, payload);
        toast.success("Data ziyadah berhasil diperbarui!");
      }

      setIsZiyadahModalOpen(false);
      // Refresh ziyadah list
      const allZiyadah = await fetchZiyadah();
      const santriIds = new Set(santri.map((s) => s.id));
      setZiyadahList(allZiyadah.filter((z) => santriIds.has(z.santri_id)));
    } catch (err) {
      setZiyadahFormError(getErrorMessage(err));
    } finally {
      setZiyadahSubmitLoading(false);
    }
  };

  const handleDeleteZiyadah = async (item: ZiyadahType) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ziyadah "${item.name}"?`))
      return;
    try {
      await deleteZiyadah(item.id);
      toast.success(`Ziyadah "${item.name}" berhasil dihapus.`);
      const allZiyadah = await fetchZiyadah();
      const santriIds = new Set(santri.map((s) => s.id));
      setZiyadahList(allZiyadah.filter((z) => santriIds.has(z.santri_id)));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // --- Murojaah CRUD Handlers ---
  const openCreateMurojaah = () => {
    setMurojaahModalMode("create");
    setSelectedMurojaah(null);
    resetMurojaah({
      santri_id: selectedRecordSantri?.id ?? 0,
      date: new Date().toISOString().split("T")[0],
      surat: 1,
      ayat_mulai: 1,
      ayat_selesai: 1,
    });
    setMurojaahFormError(null);
    setIsMurojaahModalOpen(true);
  };

  const openEditMurojaah = (item: MurojaahType) => {
    setMurojaahModalMode("edit");
    setSelectedMurojaah(item);
    resetMurojaah({
      santri_id: item.santri_id,
      date: item.date,
      surat: item.surat,
      ayat_mulai: item.ayat_mulai,
      ayat_selesai: item.ayat_selesai,
    });
    setMurojaahFormError(null);
    setIsMurojaahModalOpen(true);
  };

  const handleMurojaahSubmit = async (values: MurojaahFormValues) => {
    setMurojaahFormError(null);
    setMurojaahSubmitLoading(true);

    const result = murojaahSchema.safeParse(values);
    if (!result.success) {
      setMurojaahFormError(
        result.error.issues.map((i) => i.message).join(". "),
      );
      setMurojaahSubmitLoading(false);
      return;
    }

    try {
      const payload = {
        santri_id: result.data.santri_id,
        date: result.data.date,
        surat: result.data.surat,
        ayat_mulai: result.data.ayat_mulai,
        ayat_selesai: result.data.ayat_selesai,
      };

      if (murojaahModalMode === "create") {
        await createMurojaah(payload);
        toast.success("Murojaah baru berhasil ditambahkan!");
      } else if (selectedMurojaah) {
        await updateMurojaah(selectedMurojaah.id, payload);
        toast.success("Data murojaah berhasil diperbarui!");
      }

      setIsMurojaahModalOpen(false);
      // Refresh list
      const allMurojaah = await fetchMurojaah();
      const santriIds = new Set(santri.map((s) => s.id));
      setMurojaahList(allMurojaah.filter((m) => santriIds.has(m.santri_id)));
    } catch (err) {
      setMurojaahFormError(getErrorMessage(err));
    } finally {
      setMurojaahSubmitLoading(false);
    }
  };

  const handleDeleteMurojaah = async (item: MurojaahType) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus murojaah "${item.name}"?`))
      return;
    try {
      await deleteMurojaah(item.id);
      toast.success(`Murojaah "${item.name}" berhasil dihapus.`);
      const allMurojaah = await fetchMurojaah();
      const santriIds = new Set(santri.map((s) => s.id));
      setMurojaahList(allMurojaah.filter((m) => santriIds.has(m.santri_id)));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const visibleZiyadah = selectedRecordSantri
    ? ziyadahList.filter((item) => item.santri_id === selectedRecordSantri.id)
    : [];

  const visibleMurojaah = selectedRecordSantri
    ? murojaahList.filter((item) => item.santri_id === selectedRecordSantri.id)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !halaqah) {
    return (
      <div className="p-6 bg-red-50 border border-red-100 rounded-3xl max-w-lg mx-auto mt-10 text-center">
        <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-800">Gagal Memuat Halaqah</h3>
        <p className="text-sm text-red-600 mt-2">
          {error || "Halaqah tidak ditemukan."}
        </p>
        <Link
          href="/admin/halaqah"
          className="inline-block mt-6 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition"
        >
          Kembali ke Daftar Halaqah
        </Link>
      </div>
    );
  }

  const santriOptionsSelect = santri.map((s) => ({
    value: s.id,
    label: `${s.name} — ${s.class}`,
  }));

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/halaqah"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
        >
          <FiArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Halaqah
        </Link>
      </div>

      <Header
        title={`Halaqah: ${halaqah.name}`}
        subtitle={`Pembina: ${halaqah.ustadz_name} | ID: #${halaqah.id}`}
        showNewSession={false}
        showSearch={false}
      />

      {/* 3 Big Premium Card Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => setActiveTab("santri")}
          className={`p-6 rounded-3xl border text-left transition-all cursor-pointer ${
            activeTab === "santri"
              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-white border-blue-100 text-gray-800 hover:border-blue-200 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-2xl ${activeTab === "santri" ? "bg-white/15" : "bg-blue-50 text-blue-600"}`}
            >
              <FiUsers className="w-6 h-6" />
            </div>
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${activeTab === "santri" ? "text-blue-100" : "text-gray-400"}`}
              >
                Informasi
              </p>
              <h4 className="text-lg font-bold mt-0.5">Data Santri</h4>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("ziyadah")}
          className={`p-6 rounded-3xl border text-left transition-all cursor-pointer ${
            activeTab === "ziyadah"
              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-white border-blue-100 text-gray-800 hover:border-blue-200 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-2xl ${activeTab === "ziyadah" ? "bg-white/15" : "bg-blue-50 text-blue-600"}`}
            >
              <FiBookOpen className="w-6 h-6" />
            </div>
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${activeTab === "ziyadah" ? "text-blue-100" : "text-gray-400"}`}
              >
                Setoran Baru
              </p>
              <h4 className="text-lg font-bold mt-0.5">Menu Ziyadah</h4>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("murojaah")}
          className={`p-6 rounded-3xl border text-left transition-all cursor-pointer ${
            activeTab === "murojaah"
              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-white border-blue-100 text-gray-800 hover:border-blue-200 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-2xl ${activeTab === "murojaah" ? "bg-white/15" : "bg-blue-50 text-blue-600"}`}
            >
              <FiCalendar className="w-6 h-6" />
            </div>
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${activeTab === "murojaah" ? "text-blue-100" : "text-gray-400"}`}
              >
                Tsunnaiyyah Hafalan
              </p>
              <h4 className="text-lg font-bold mt-0.5">Menu Tsunnaiyyah</h4>
            </div>
          </div>
        </button>
      </div>

      {selectedRecordSantri &&
        (activeTab === "ziyadah" || activeTab === "murojaah") && (
          <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-blue-600">
                <FiUser className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="wrap-break-word font-semibold text-gray-800">
                  {selectedRecordSantri.name}
                </p>
                <p className="text-sm text-gray-500">
                  Kelas: {selectedRecordSantri.class}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("santri")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-100 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-white/50 hover:border-blue-200 sm:w-auto"
            >
              <FiArrowLeft className="h-4 w-4" /> Ganti santri
            </button>
          </section>
        )}

      {/* Dynamic Tables rendering depending on active tab */}
      {activeTab === "santri" && (
        <DataTable
          columns={[
            {
              header: "No",
              cell: ({ row, table }) =>
                table
                  .getPrePaginationRowModel()
                  .rows.findIndex((tableRow) => tableRow.id === row.id) + 1,
            },
            { header: "Nama", accessorKey: "name" },
            { header: "Kelas", accessorKey: "class" },
            {
              header: "Status",
              cell: ({ row }) => (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    row.original.active
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {row.original.active ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              header: "Aksi",
              cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecordSantri(row.original);
                      setActiveTab("ziyadah");
                    }}
                    className="rounded-xl p-2 text-cyan-700 hover:bg-cyan-50 transition cursor-pointer"
                    title={`Lihat Ziyadah ${row.original.name}`}
                    aria-label={`Lihat Ziyadah ${row.original.name}`}
                  >
                    <FiBookOpen className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecordSantri(row.original);
                      setActiveTab("murojaah");
                    }}
                    className="rounded-xl p-2 text-cyan-600 hover:bg-cyan-50 transition cursor-pointer"
                    title={`Lihat Tsunaiyyah ${row.original.name}`}
                    aria-label={`Lihat Tsunaiyyah ${row.original.name}`}
                  >
                    <FiCalendar className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditSantri(row.original)}
                    className="rounded-xl p-2 text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                    title="Edit Santri"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSantri(row.original)}
                    className="rounded-xl p-2 text-red-500 hover:bg-red-50 transition cursor-pointer"
                    title="Hapus Santri"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
          data={santri}
          placeholderSearch="Cari santri..."
          renderTopActions={() => (
            <button
              onClick={openCreateSantri}
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 cursor-pointer hover:bg-blue-700 transition active:scale-95 shrink-0 w-full sm:w-auto"
            >
              <FiUserPlus className="h-4 w-4" />
              Tambah Santri
            </button>
          )}
        />
      )}

      {activeTab === "ziyadah" && (
        <DataTable
          columns={[
            {
              header: "No",
              cell: ({ row, table }) =>
                table
                  .getPrePaginationRowModel()
                  .rows.findIndex((tableRow) => tableRow.id === row.id) + 1,
            },
            { header: "Nama Santri", accessorKey: "name" },
            { header: "Kelas", accessorKey: "class" },
            { header: "Tanggal", accessorKey: "date" },
            {
              header: "Surat / Ayat",
              cell: ({ row }) => (
                <span>
                  Surat {row.original.surat}: {getSuratName(row.original.surat)}{" "}
                  (Ayat {row.original.ayat_mulai}-{row.original.ayat_selesai})
                </span>
              ),
            },
            {
              header: "Aksi",
              cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openEditZiyadah(row.original)}
                    className="rounded-xl p-2 text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                    title="Edit Ziyadah"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteZiyadah(row.original)}
                    className="rounded-xl p-2 text-red-500 hover:bg-red-50 transition cursor-pointer"
                    title="Hapus Ziyadah"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
          data={visibleZiyadah}
          placeholderSearch="Cari ziyadah..."
          renderTopActions={() => (
            <button
              onClick={openCreateZiyadah}
              disabled={!selectedRecordSantri || ziyadahSubmitLoading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 cursor-pointer hover:bg-blue-700 transition active:scale-95 shrink-0 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiUserPlus className="h-4 w-4" />
              Tambah Ziyadah
            </button>
          )}
        />
      )}

      {activeTab === "murojaah" && (
        <DataTable
          columns={[
            { header: "ID", accessorKey: "id" },
            { header: "Nama Santri", accessorKey: "name" },
            { header: "Kelas", accessorKey: "class" },
            { header: "Tanggal", accessorKey: "date" },
            {
              header: "Surat / Ayat",
              cell: ({ row }) => (
                <span>
                  Surat {row.original.surat}: {getSuratName(row.original.surat)}{" "}
                  (Ayat {row.original.ayat_mulai}-{row.original.ayat_selesai})
                </span>
              ),
            },
            {
              header: "Aksi",
              cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openEditMurojaah(row.original)}
                    className="rounded-xl p-2 text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                    title="Edit Tsunnaiyyah"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMurojaah(row.original)}
                    className="rounded-xl p-2 text-red-500 hover:bg-red-50 transition cursor-pointer"
                    title="Hapus Tsunnaiyyah"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
          data={visibleMurojaah}
          placeholderSearch="Cari tsunnaiyyah..."
          renderTopActions={() => (
            <button
              onClick={openCreateMurojaah}
              disabled={!selectedRecordSantri || murojaahSubmitLoading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 cursor-pointer hover:bg-blue-700 transition active:scale-95 shrink-0 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiUserPlus className="h-4 w-4" />
              Tambah Tsunnaiyyah
            </button>
          )}
        />
      )}

      {/* Santri Form Modal */}
      <SantriFormModal
        isOpen={isSantriModalOpen}
        onClose={() => setIsSantriModalOpen(false)}
        mode={santriModalMode}
        initialData={selectedSantri}
        halaqahOptions={halaqahs}
        selectedHalaqahId={halaqahId}
        loading={santriSubmitLoading}
        error={santriFormError}
        onSubmit={handleSantriSubmit}
      />

      {/* Ziyadah Form Modal */}
      <Modal
        isOpen={isZiyadahModalOpen}
        onClose={() => setIsZiyadahModalOpen(false)}
        title={
          ziyadahModalMode === "create"
            ? "Tambah Ziyadah Baru"
            : "Edit Data Ziyadah"
        }
      >
        <form onSubmit={handleSubmitZiyadah(handleZiyadahSubmit)}>
          <div className="p-6 space-y-4">
            {ziyadahFormError && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3 text-red-700 text-xs">
                <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="font-medium">{ziyadahFormError}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Santri <span className="text-red-500">*</span>
              </label>
              <Controller
                name="santri_id"
                control={controlZiyadah}
                render={({ field }) => (
                  <Select
                    options={santriOptionsSelect}
                    value={
                      santriOptionsSelect.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value ?? 0)}
                    placeholder="Pilih Santri..."
                    classNamePrefix="react-select"
                    className="text-sm"
                    isClearable={false}
                    isDisabled={
                      ziyadahModalMode === "create" && !!selectedRecordSantri
                    }
                  />
                )}
              />
              {errorsZiyadah.santri_id && (
                <p className="mt-2 text-xs text-red-600">
                  {errorsZiyadah.santri_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...registerZiyadah("date")}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none text-sm text-gray-800"
              />
              {errorsZiyadah.date && (
                <p className="mt-2 text-xs text-red-600">
                  {errorsZiyadah.date.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Surat <span className="text-red-500">*</span>
                </label>
                <select
                  {...registerZiyadah("surat", { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-800"
                >
                  {suratOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errorsZiyadah.surat && (
                  <p className="mt-2 text-xs text-red-600">
                    {errorsZiyadah.surat.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Hal. Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  {...registerZiyadah("ayat_mulai", { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-800"
                />
                {errorsZiyadah.ayat_mulai && (
                  <p className="mt-2 text-xs text-red-600">
                    {errorsZiyadah.ayat_mulai.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Hal. Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  {...registerZiyadah("ayat_selesai", { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-800"
                />
                {errorsZiyadah.ayat_selesai && (
                  <p className="mt-2 text-xs text-red-600">
                    {errorsZiyadah.ayat_selesai.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-3xl flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsZiyadahModalOpen(false)}
              className="px-4 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={ziyadahSubmitLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10 flex items-center gap-2 cursor-pointer"
            >
              {ziyadahSubmitLoading ? "Memproses..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Murojaah Form Modal */}
      <Modal
        isOpen={isMurojaahModalOpen}
        onClose={() => setIsMurojaahModalOpen(false)}
        title={
          murojaahModalMode === "create"
            ? "Tambah Tsunnaiyyah Baru"
            : "Edit Data Tsunnaiyyah"
        }
      >
        <form onSubmit={handleSubmitMurojaah(handleMurojaahSubmit)}>
          <div className="p-6 space-y-4">
            {murojaahFormError && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3 text-red-700 text-xs">
                <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="font-medium">{murojaahFormError}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Santri <span className="text-red-500">*</span>
              </label>
              <Controller
                name="santri_id"
                control={controlMurojaah}
                render={({ field }) => (
                  <Select
                    options={santriOptionsSelect}
                    value={
                      santriOptionsSelect.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value ?? 0)}
                    placeholder="Pilih Santri..."
                    classNamePrefix="react-select"
                    className="text-sm"
                    isClearable={false}
                    isDisabled={
                      murojaahModalMode === "create" && !!selectedRecordSantri
                    }
                  />
                )}
              />
              {errorsMurojaah.santri_id && (
                <p className="mt-2 text-xs text-red-600">
                  {errorsMurojaah.santri_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...registerMurojaah("date")}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none text-sm text-gray-800"
              />
              {errorsMurojaah.date && (
                <p className="mt-2 text-xs text-red-600">
                  {errorsMurojaah.date.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Surat <span className="text-red-500">*</span>
                </label>
                <select
                  {...registerMurojaah("surat", { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-800"
                >
                  {suratOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errorsMurojaah.surat && (
                  <p className="mt-2 text-xs text-red-600">
                    {errorsMurojaah.surat.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Ayat Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  {...registerMurojaah("ayat_mulai", { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-800"
                />
                {errorsMurojaah.ayat_mulai && (
                  <p className="mt-2 text-xs text-red-600">
                    {errorsMurojaah.ayat_mulai.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Ayat Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  {...registerMurojaah("ayat_selesai", { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-800"
                />
                {errorsMurojaah.ayat_selesai && (
                  <p className="mt-2 text-xs text-red-600">
                    {errorsMurojaah.ayat_selesai.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-3xl flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsMurojaahModalOpen(false)}
              className="px-4 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={murojaahSubmitLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10 flex items-center gap-2 cursor-pointer"
            >
              {murojaahSubmitLoading ? "Memproses..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
