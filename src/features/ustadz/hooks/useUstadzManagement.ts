"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/error";
import { createUstadz, deleteUstadz, fetchAvailableUsers, fetchUstadz, updateUstadz } from "../repository";
import { AvailableUser, CreateUstadzPayload, Ustadz, UpdateUstadzPayload } from "../types";

export function useUstadzManagement() {
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

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [ustadzData, availableUsersData] = await Promise.all([fetchUstadz(), fetchAvailableUsers()]);
      setUstadz(ustadzData);
      setAvailableUsers(availableUsersData);
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

  const availableCreateUsers = useMemo(
    () => availableUsers.filter((user) => !ustadz.some((item) => item.user_id === user.id)),
    [availableUsers, ustadz]
  );

  const handleOpenCreate = useCallback(() => {
    setModalType("create");
    setSelectedUstadz(null);
    setUserIdInput(availableCreateUsers[0]?.id?.toString() || "");
    setSpecializationInput("");
    setPhoneInput("");
    setFormError(null);
    setIsModalOpen(true);
  }, [availableCreateUsers]);

  const handleOpenEdit = useCallback((item: Ustadz) => {
    setModalType("edit");
    setSelectedUstadz(item);
    setUserIdInput(item.user_id.toString());
    setSpecializationInput(item.specialization || "");
    setPhoneInput(item.phone || "");
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitLoading(true);

    try {
      if (modalType === "create") {
        const payload: CreateUstadzPayload = {
          user_id: parseInt(userIdInput, 10),
          specialization: specializationInput,
          phone: phoneInput,
          active: true,
        };
        await createUstadz(payload);
        toast.success("Ustadz berhasil ditambahkan!");
      } else if (selectedUstadz) {
        const payload: UpdateUstadzPayload = {
          name: selectedUstadz.name,
          specialization: specializationInput,
          phone: phoneInput,
          active: true,
        };
        await updateUstadz(selectedUstadz.id, payload);
        toast.success("Data ustadz berhasil diperbarui!");
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  }, [modalType, phoneInput, refreshData, selectedUstadz, specializationInput, userIdInput]);

  const handleDelete = useCallback(async (ustadzItem: Ustadz) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ustadz "${ustadzItem.name}"?\nMenghapus data ustadz ini juga akan menghapus akun user loginnya.`)) return;
    try {
      await deleteUstadz(ustadzItem.id);
      toast.success(`Ustadz "${ustadzItem.name}" berhasil dihapus.`);
      await refreshData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [refreshData]);

  const filteredUstadz = useMemo(
    () => ustadz.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery, ustadz]
  );

  return {
    ustadz: filteredUstadz,
    availableUsers: availableCreateUsers,
    searchQuery,
    setSearchQuery,
    loading,
    apiError,
    isModalOpen,
    setIsModalOpen,
    modalType,
    selectedUstadz,
    userIdInput,
    setUserIdInput,
    specializationInput,
    setSpecializationInput,
    phoneInput,
    setPhoneInput,
    submitLoading,
    formError,
    handleOpenCreate,
    handleOpenEdit,
    handleSubmit,
    handleDelete,
  };
}
