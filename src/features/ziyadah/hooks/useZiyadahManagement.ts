"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/error";
import { createZiyadah, deleteZiyadah, fetchHalaqahs, fetchSantriOptions, fetchZiyadah, updateZiyadah } from "../repository";
import { Halaqah } from "@/features/halaqah/types";
import { SantriOption, Ziyadah } from "../types";

export function useZiyadahManagement() {
  const [ziyadah, setZiyadah] = useState<Ziyadah[]>([]);
  const [halaqahs, setHalaqahs] = useState<Halaqah[]>([]);
  const [santriOptions, setSantriOptions] = useState<SantriOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [selectedZiyadah, setSelectedZiyadah] = useState<Ziyadah | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [ziyadahData, halaqahData, santriData] = await Promise.all([
        fetchZiyadah(),
        fetchHalaqahs(),
        fetchSantriOptions(),
      ]);
      setZiyadah(ziyadahData);
      setHalaqahs(halaqahData);
      setSantriOptions(santriData);
      setApiError(null);
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = globalThis.setTimeout(() => {
      void refreshData();
    }, 0);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [refreshData]);

  const handleOpenCreate = useCallback(() => {
    setModalType("create");
    setSelectedZiyadah(null);
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((item: Ziyadah) => {
    setModalType("edit");
    setSelectedZiyadah(item);
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const onSubmit = useCallback(async (values: {
    santri_id: number;
    date: string;
    surat: number;
    ayat_mulai: number;
    ayat_selesai: number;
  }) => {
    setFormError(null);
    setSubmitLoading(true);

    try {
      if (modalType === "create") {
        await createZiyadah(values);
        toast.success("Ziyadah baru berhasil ditambahkan!");
      } else if (selectedZiyadah) {
        await updateZiyadah(selectedZiyadah.id, values);
        toast.success("Data ziyadah berhasil diperbarui!");
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  }, [modalType, refreshData, selectedZiyadah]);

  const handleDelete = useCallback(async (item: Ziyadah) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ziyadah "${item.name}"?`)) return;
    try {
      await deleteZiyadah(item.id);
      toast.success(`Ziyadah "${item.name}" berhasil dihapus.`);
      await refreshData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [refreshData]);

  const filteredZiyadah = useMemo(
    () =>
      ziyadah.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.halaqah_name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, ziyadah]
  );

  return {
    ziyadah: filteredZiyadah,
    halaqahs,
    santriOptions,
    searchQuery,
    setSearchQuery,
    loading,
    apiError,
    isModalOpen,
    setIsModalOpen,
    modalType,
    selectedZiyadah,
    submitLoading,
    formError,
    handleOpenCreate,
    handleOpenEdit,
    onSubmit,
    handleDelete,
  };
}
