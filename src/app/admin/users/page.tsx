"use client";

import React, { useState, useEffect } from "react";
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import Header from "@/components/Header";

interface User {
  id: number;
  username: string;
  role: "admin" | "ustadz" | "student";
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form State
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [roleInput, setRoleInput] = useState<"admin" | "ustadz" | "student">("student");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal memuat daftar pengguna.");
      }
      const data = await response.json();
      setUsers(data.users || []);
      setApiError(null);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Show Success Toast
  const triggerSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Open Modal for Create
  const handleOpenCreate = () => {
    setModalType("create");
    setSelectedUser(null);
    setUsernameInput("");
    setPasswordInput("");
    setRoleInput("student");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (user: User) => {
    setModalType("edit");
    setSelectedUser(user);
    setUsernameInput(user.username);
    setPasswordInput(""); // Leave password empty by default
    setRoleInput(user.role);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitLoading(true);

    if (modalType === "create" && !passwordInput) {
      setFormError("Password wajib diisi untuk pengguna baru.");
      setSubmitLoading(false);
      return;
    }

    try {
      const url = modalType === "create" ? "/api/users" : `/api/users/${selectedUser?.id}`;
      const method = modalType === "create" ? "POST" : "PUT";
      const payload = {
        username: usernameInput,
        role: roleInput,
        ...(passwordInput ? { password: passwordInput } : {}),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memproses data.");
      }

      setIsModalOpen(false);
      triggerSuccess(
        modalType === "create"
          ? "Pengguna baru berhasil ditambahkan!"
          : "Pengguna berhasil diperbarui!"
      );
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (user: User) => {
    if (user.username === "admin") {
      alert("Pengguna administrator utama tidak dapat dihapus!");
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus pengguna "${user.username}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghapus pengguna.");
      }

      triggerSuccess(`Pengguna "${user.username}" berhasil dihapus.`);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleStyles = {
    admin: "bg-blue-50 text-blue-600 border-blue-100",
    ustadz: "bg-emerald-50 text-emerald-600 border-emerald-100",
    student: "bg-slate-50 text-slate-600 border-slate-100",
  };

  const roleLabels = {
    admin: "Admin",
    ustadz: "Ustadz",
    student: "Santri",
  };

  return (
    <>
      {/* Header */}
      <Header
        title="User Management"
        subtitle="Manage accounts, credentials, and user roles in the system"
        showNewSession={false}
        showSearch={false}
      />

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-6 right-6 bg-white border border-emerald-100 text-emerald-800 px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-[100] animate-bounce-short">
          <FiCheckCircle className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 overflow-hidden">
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari pengguna berdasarkan username..."
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
            Tambah Pengguna
          </button>
        </div>

        {/* API Error Box */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
            <FiAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Gagal memuat data</p>
              <p className="mt-0.5">{apiError}</p>
            </div>
          </div>
        )}

        {/* Table wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-50 text-left text-gray-400 font-medium">
                <th className="py-4 px-2 text-xs uppercase tracking-wider">ID</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Username</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Hak Akses / Role</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50/50">
              {loading ? (
                // Skeletons
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-2"><div className="h-4 bg-gray-100 rounded w-6"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                    <td className="py-4 px-4"><div className="h-6 bg-gray-100 rounded-full w-20"></div></td>
                    <td className="py-4 px-4 text-right"><div className="h-8 bg-gray-100 rounded-xl w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400">
                    Tidak ada data pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-2 font-medium text-gray-400">#{user.id}</td>
                    <td className="py-4 px-4 font-semibold text-gray-700">{user.username}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${roleStyles[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                          title="Edit Pengguna"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={user.username === "admin"}
                          className={`p-2 rounded-xl transition cursor-pointer ${
                            user.username === "admin"
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-red-500 hover:bg-red-50"
                          }`}
                          title="Hapus Pengguna"
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

      {/* Modal - Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-blue-100 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-800">
                {modalType === "create" ? "Tambah Pengguna Baru" : "Edit Pengguna"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {formError && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3 text-red-700 text-xs">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="font-medium">{formError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-800 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Role / Hak Akses
                  </label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-700 bg-white"
                  >
                    <option value="student">Santri</option>
                    <option value="ustadz">Ustadz</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Password {modalType === "edit" && <span className="text-gray-400 normal-case">(Opsional)</span>}
                  </label>
                  <input
                    type="password"
                    required={modalType === "create"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder={
                      modalType === "create"
                        ? "Masukkan password baru"
                        : "Biarkan kosong jika tidak diubah"
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Modal Footer */}
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
                  {submitLoading ? "Memproses..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
