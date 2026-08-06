"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/error";
import {
  createMurojaah,
  deleteMurojaah,
  fetchHalaqahs,
  fetchMurojaah,
  fetchSantriOptions,
  updateMurojaah,
} from "../repository";
import { Murojaah, SantriOption } from "../types";
import { Halaqah } from "@/features/halaqah/types";

export function useMurojaahManagement() {
  const [murojaah, setMurojaah] = useState<Murojaah[]>([]);
  const [halaqahs, setHalaqahs] = useState<Halaqah[]>([]);
  const [santriOptions, setSantriOptions] = useState<SantriOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [selectedMurojaah, setSelectedMurojaah] = useState<Murojaah | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [murojaahData, halaqahData, santriData] = await Promise.all([
        fetchMurojaah(),
        fetchHalaqahs(),
        fetchSantriOptions(),
      ]);
      setMurojaah(murojaahData);
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
    setSelectedMurojaah(null);
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((item: Murojaah) => {
    setModalType("edit");
    setSelectedMurojaah(item);
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
        await createMurojaah(values);
        toast.success("Murojaah baru berhasil ditambahkan!");
      } else if (selectedMurojaah) {
        await updateMurojaah(selectedMurojaah.id, values);
        toast.success("Data murojaah berhasil diperbarui!");
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  }, [modalType, refreshData, selectedMurojaah]);

  const handleDelete = useCallback(async (item: Murojaah) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus murojaah "${item.name}"?`)) return;
    try {
      await deleteMurojaah(item.id);
      toast.success(`Murojaah "${item.name}" berhasil dihapus.`);
      await refreshData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [refreshData]);

  const filteredMurojaah = useMemo(
    () =>
      murojaah.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.halaqah_name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [murojaah, searchQuery]
  );

  return {
    murojaah: filteredMurojaah,
    halaqahs,
    santriOptions,
    searchQuery,
    setSearchQuery,
    loading,
    apiError,
    isModalOpen,
    setIsModalOpen,
    modalType,
    selectedMurojaah,
    submitLoading,
    formError,
    handleOpenCreate,
    handleOpenEdit,
    onSubmit,
    handleDelete,
  };
}
