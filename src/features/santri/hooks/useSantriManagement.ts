"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/error";
import { createSantri, deleteSantri, fetchHalaqahs, fetchSantri, updateSantri } from "../repository";
import { Halaqah, Santri, CreateSantriPayload, UpdateSantriPayload } from "../types";

export function useSantriManagement() {
  const searchParams = useSearchParams();
  const halaqahIdParam = searchParams.get("halaqahId");

  const [santri, setSantri] = useState<Santri[]>([]);
  const [halaqahs, setHalaqahs] = useState<Halaqah[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [classInput, setClassInput] = useState("");
  const [halaqahInput, setHalaqahInput] = useState<number | "">("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [santriData, halaqahData] = await Promise.all([fetchSantri(), fetchHalaqahs()]);
      setSantri(santriData);
      setHalaqahs(halaqahData);
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
    setSelectedSantri(null);
    setNameInput("");
    setClassInput("");
    setHalaqahInput(halaqahIdParam ? Number(halaqahIdParam) : (halaqahs[0]?.id ?? ""));
    setFormError(null);
    setIsModalOpen(true);
  }, [halaqahs, halaqahIdParam]);

  const handleOpenEdit = useCallback((santriItem: Santri) => {
    setModalType("edit");
    setSelectedSantri(santriItem);
    setNameInput(santriItem.name);
    setClassInput(santriItem.class);
    setHalaqahInput(santriItem.halaqah_id);
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitLoading(true);

    const payload: CreateSantriPayload = {
      name: nameInput,
      class: classInput,
      halaqah_id: Number(halaqahInput),
    };

    try {
      if (modalType === "create") {
        await createSantri(payload);
        toast.success("Santri baru berhasil ditambahkan!");
      } else if (selectedSantri) {
        await updateSantri(selectedSantri.id, payload as UpdateSantriPayload);
        toast.success("Data santri berhasil diperbarui!");
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  }, [classInput, halaqahInput, modalType, nameInput, refreshData, selectedSantri]);

  const handleDelete = useCallback(async (santriItem: Santri) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus santri "${santriItem.name}"?`)) return;
    try {
      await deleteSantri(santriItem.id);
      toast.success(`Santri "${santriItem.name}" berhasil dihapus.`);
      await refreshData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [refreshData]);

  const filteredSantri = santri.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.halaqah_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (halaqahIdParam) {
      return matchesSearch && item.halaqah_id === Number(halaqahIdParam);
    }
    return matchesSearch;
  });

  return {
    santri: filteredSantri,
    halaqahs,
    searchQuery,
    setSearchQuery,
    loading,
    apiError,
    isModalOpen,
    setIsModalOpen,
    modalType,
    selectedSantri,
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
  };
}
