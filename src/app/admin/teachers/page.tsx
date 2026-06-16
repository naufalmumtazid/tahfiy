"use client";

import React, { useEffect, useState } from "react";
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import Header from "@/components/Header";
import Modal from "@/components/Modal";

interface Teacher {
  id: number;
  name: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/teachers");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal memuat daftar teacher.");
      }
      const data = await response.json();
      setTeachers(data.teachers || []);
      setApiError(null);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const triggerSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleOpenCreate = () => {
    setModalType("create");
    setSelectedTeacher(null);
    setNameInput("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setModalType("edit");
    setSelectedTeacher(teacher);
    setNameInput(teacher.name);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitLoading(true);

    try {
      const url = modalType === "create" ? "/api/teachers" : `/api/teachers/${selectedTeacher?.id}`;
      const method = modalType === "create" ? "POST" : "PUT";
      const payload = { name: nameInput };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memproses data teacher.");

      setIsModalOpen(false);
      triggerSuccess(modalType === "create" ? "Teacher berhasil ditambahkan!" : "Data teacher berhasil diperbarui!");
      fetchTeachers();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (teacher: Teacher) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus teacher "${teacher.name}"?`)) return;

    try {
      const response = await fetch(`/api/teachers/${teacher.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menghapus teacher.");
      triggerSuccess(`Teacher "${teacher.name}" berhasil dihapus.`);
      fetchTeachers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header
        title="Manajemen Teachers"
        subtitle="Kelola daftar teachers dalam sistem"
        showNewSession={false}
        showSearch={false}
      />

      {successMessage && (
        <div className="fixed top-6 right-6 bg-white border border-blue-100 text-blue-800 px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-100">
          <FiCheckCircle className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari teacher berdasarkan nama..."
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
            Tambah Teacher
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
                <th className="py-4 px-4 text-xs uppercase tracking-wider">Nama Teacher</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-2"><div className="h-4 bg-gray-100 rounded w-6" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-100 rounded w-48" /></td>
                    <td className="py-4 px-4 text-right"><div className="h-8 bg-gray-100 rounded-xl w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-gray-400">
                    Tidak ada data teachers ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-2 font-medium text-gray-400">#{teacher.id}</td>
                    <td className="py-4 px-4 font-semibold text-gray-700">{teacher.name}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(teacher)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                          title="Edit Teacher"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Hapus Teacher"
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
        title={modalType === "create" ? "Tambah Teacher Baru" : "Edit Teacher"}
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
                Nama Teacher
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Masukkan nama teacher"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-800 placeholder-gray-400"
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
            >
              {submitLoading ? "Memproses..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
