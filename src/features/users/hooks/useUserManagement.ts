"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/error";
import { createUser, deleteUser, fetchUsers, updateUser } from "../repository";
import { User, UserFormValues } from "../types";

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [roleInput, setRoleInput] = useState<UserFormValues["role"]>("santri");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await fetchUsers();
      setUsers(userData);
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
    setSelectedUser(null);
    setUsernameInput("");
    setNameInput("");
    setPasswordInput("");
    setRoleInput("santri");
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((user: User) => {
    setModalType("edit");
    setSelectedUser(user);
    setUsernameInput(user.username);
    setNameInput(user.name);
    setPasswordInput("");
    setRoleInput(user.role);
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitLoading(true);

    const payload: UserFormValues = {
      username: usernameInput,
      name: nameInput,
      role: roleInput,
      ...(passwordInput ? { password: passwordInput } : {}),
    };

    try {
      if (modalType === "create") {
        if (!passwordInput) {
          setFormError("Password wajib diisi untuk pengguna baru.");
          setSubmitLoading(false);
          return;
        }
        await createUser(payload);
        toast.success("Pengguna baru berhasil ditambahkan!");
      } else if (selectedUser) {
        await updateUser(selectedUser.id, payload);
        toast.success("Pengguna berhasil diperbarui!");
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err) {
      setFormError(getErrorMessage(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  }, [modalType, nameInput, passwordInput, refreshData, roleInput, selectedUser, usernameInput]);

  const handleDelete = useCallback(async (user: User) => {
    if (user.username === "admin") {
      toast.error("Pengguna administrator utama tidak dapat dihapus!");
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus pengguna "${user.username}"?`)) return;
    try {
      await deleteUser(user.id);
      toast.success(`Pengguna "${user.username}" berhasil dihapus.`);
      await refreshData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [refreshData]);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, users]
  );

  return {
    users: filteredUsers,
    searchQuery,
    setSearchQuery,
    loading,
    apiError,
    isModalOpen,
    setIsModalOpen,
    modalType,
    selectedUser,
    usernameInput,
    setUsernameInput,
    nameInput,
    setNameInput,
    passwordInput,
    setPasswordInput,
    roleInput,
    setRoleInput,
    submitLoading,
    formError,
    handleOpenCreate,
    handleOpenEdit,
    handleSubmit,
    handleDelete,
  };
}
