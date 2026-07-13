"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/error";
import {
  createHalaqah,
  createSantri,
  deleteHalaqah,
  deleteSantri,
  fetchHalaqahs,
  fetchSantriByHalaqah,
  fetchUstadzOptions,
  promoteSantri,
  updateHalaqah,
  updateSantri,
} from "../repository";
import { HalaqahItem, CreateHalaqahPayload, CreateSantriPayload, SantriItem, UstadzOption, UpdateHalaqahPayload, UpdateSantriPayload } from "../types";

export function useHalaqahManagement() {
  const [halaqahs, setHalaqahs] = useState<HalaqahItem[]>([]);
  const [ustadzOptions, setUstadzOptions] = useState<UstadzOption[]>([]);
  const [santriByHalaqah, setSantriByHalaqah] = useState<Record<number, SantriItem[]>>({});
  const [selectedHalaqahId, setSelectedHalaqahId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHalaqahModalOpen, setHalaqahModalOpen] = useState(false);
  const [isSantriModalOpen, setSantriModalOpen] = useState(false);
  const [halaqahModalMode, setHalaqahModalMode] = useState<"create" | "edit">("create");
  const [santriModalMode, setSantriModalMode] = useState<"create" | "edit">("create");
  const [selectedHalaqah, setSelectedHalaqah] = useState<HalaqahItem | null>(null);
  const [selectedSantri, setSelectedSantri] = useState<SantriItem | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [halaqahData, ustadzData] = await Promise.all([fetchHalaqahs(), fetchUstadzOptions()]);
      setHalaqahs(halaqahData);
      setUstadzOptions(ustadzData);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshData]);

  const loadSantriForHalaqah = useCallback(async (halaqahId: number) => {
    try {
      const rows = await fetchSantriByHalaqah(halaqahId);
      setSantriByHalaqah((prev) => ({ ...prev, [halaqahId]: rows }));
    } catch {
      setSantriByHalaqah((prev) => ({ ...prev, [halaqahId]: [] }));
    }
  }, []);

  const openCreateHalaqah = useCallback(() => {
    setHalaqahModalMode("create");
    setSelectedHalaqah(null);
    setFormError(null);
    setHalaqahModalOpen(true);
  }, []);

  const openEditHalaqah = useCallback((item: HalaqahItem) => {
    setHalaqahModalMode("edit");
    setSelectedHalaqah(item);
    setFormError(null);
    setHalaqahModalOpen(true);
  }, []);

  const handleHalaqahSubmit = useCallback(async (payload: CreateHalaqahPayload | UpdateHalaqahPayload) => {
    setSubmitLoading(true);
    setFormError(null);
    try {
      if (halaqahModalMode === "create") {
        await createHalaqah(payload as CreateHalaqahPayload);
        toast.success("Halaqah berhasil ditambahkan.");
      } else if (selectedHalaqah) {
        await updateHalaqah(selectedHalaqah.id, payload as UpdateHalaqahPayload);
        toast.success("Halaqah berhasil diperbarui.");
      }
      setHalaqahModalOpen(false);
      await refreshData();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  }, [halaqahModalMode, refreshData, selectedHalaqah]);

  const handleDeleteHalaqah = useCallback(async (item: HalaqahItem) => {
    if (!confirm(`Hapus halaqah "${item.name}"?`)) return;
    try {
      await deleteHalaqah(item.id);
      toast.success(`Halaqah "${item.name}" berhasil dihapus.`);
      await refreshData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [refreshData]);

  const openSantriSection = useCallback(async (item: HalaqahItem) => {
    setSelectedHalaqahId(item.id);
    setSelectedHalaqah(item);
    await loadSantriForHalaqah(item.id);
  }, [loadSantriForHalaqah]);

  const openCreateSantri = useCallback((halaqahId: number) => {
    setSantriModalMode("create");
    setSelectedSantri(null);
    setFormError(null);
    setSelectedHalaqah(halaqahs.find((item) => item.id === halaqahId) || null);
    setSantriModalOpen(true);
  }, [halaqahs]);

  const openEditSantri = useCallback((row: SantriItem, halaqahId: number) => {
    setSantriModalMode("edit");
    setSelectedSantri(row);
    setSelectedHalaqah(halaqahs.find((item) => item.id === halaqahId) || null);
    setFormError(null);
    setSantriModalOpen(true);
  }, [halaqahs]);

  const handleSantriSubmit = useCallback(async (payload: CreateSantriPayload | UpdateSantriPayload) => {
    setSubmitLoading(true);
    setFormError(null);
    try {
      if (santriModalMode === "create") {
        await createSantri(payload as CreateSantriPayload);
        toast.success("Santri berhasil ditambahkan.");
      } else if (selectedSantri && selectedHalaqah) {
        await updateSantri(selectedSantri.id, payload as UpdateSantriPayload);
        toast.success("Santri berhasil diperbarui.");
      }
      setSantriModalOpen(false);
      if (selectedHalaqah) {
        await loadSantriForHalaqah(selectedHalaqah.id);
      }
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  }, [loadSantriForHalaqah, santriModalMode, selectedHalaqah, selectedSantri]);

  const handleDeleteSantri = useCallback(async (row: SantriItem) => {
    if (!confirm(`Hapus santri "${row.name}"?`)) return;
    try {
      await deleteSantri(row.id);
      toast.success(`Santri "${row.name}" berhasil dihapus.`);
      if (selectedHalaqah) {
        await loadSantriForHalaqah(selectedHalaqah.id);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [loadSantriForHalaqah, selectedHalaqah]);

  const handlePromoteHalaqah = useCallback(async (halaqahId: number) => {
    if (!confirm("Promosikan semua angkatan yang aktif pada halaqah ini?")) return;
    try {
      const result = await promoteSantri({ halaqah_id: halaqahId, class_prefix: "" });
      toast.success(`Promosi selesai: ${result.updated.length} santri diproses.`);
      if (selectedHalaqahId === halaqahId) {
        await loadSantriForHalaqah(halaqahId);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [loadSantriForHalaqah, selectedHalaqahId]);

  const filteredHalaqahs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return halaqahs.filter((item) => item.name.toLowerCase().includes(query) || item.ustadz_name.toLowerCase().includes(query));
  }, [halaqahs, searchQuery]);

  return {
    halaqahs: filteredHalaqahs,
    ustadzOptions,
    santriByHalaqah,
    selectedHalaqahId,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    isHalaqahModalOpen,
    setHalaqahModalOpen,
    isSantriModalOpen,
    setSantriModalOpen,
    halaqahModalMode,
    santriModalMode,
    selectedHalaqah,
    selectedSantri,
    submitLoading,
    formError,
    setFormError,
    openCreateHalaqah,
    openEditHalaqah,
    handleHalaqahSubmit,
    handleDeleteHalaqah,
    openSantriSection,
    openCreateSantri,
    openEditSantri,
    handleSantriSubmit,
    handleDeleteSantri,
    handlePromoteHalaqah,
    refreshData,
  };
}
