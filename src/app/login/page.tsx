"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { loginAction } from "@/actions/auth";
import { FiUser, FiLock, FiAlertCircle } from "react-icons/fi";
import logoImg from "@/assets/logo.png";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [error, setError] = useState<string | null>(
    errorParam === "unauthorized"
      ? "Akses ditolak. Anda harus login sebagai admin."
      : null
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await loginAction(formData);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else if (result.success && result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-6 py-10 bg-white/80 backdrop-blur-lg rounded-3xl border border-blue-100/50 shadow-xl">
      <div className="flex flex-col items-center mb-8">
        <Image
          src={logoImg}
          alt="Tahfiy Logo"
          width={48}
          height={48}
          className="w-12 h-12 object-contain rounded-2xl shadow-lg shadow-blue-500/10 mb-4"
        />
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Selamat Datang</h2>
        <p className="text-sm text-gray-500 mt-1 text-center">
          Masuk untuk mengelola hafalan Quran santri
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3 text-red-700 text-xs animate-shake">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Gagal Masuk</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Username
          </label>
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="username"
              required
              placeholder="Masukkan username"
              className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Password
            </label>
          </div>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              name="password"
              required
              placeholder="Masukkan password"
              className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Masuk Ke Sistem"
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-white to-sky-100">
      {/* Brand/Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

        <div className="flex items-center gap-3 relative z-10">
          <Image
            src={logoImg}
            alt="Tahfiy Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain rounded-xl bg-white/10 backdrop-blur-md p-1 shadow-md"
          />
          <div>
            <h1 className="font-bold text-xl tracking-tight">Tahfiy</h1>
            <p className="text-xs text-blue-200">Tahfidz Digital System</p>
          </div>
        </div>

        <div className="my-auto relative z-10 max-w-lg">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200 uppercase tracking-wider">
            Quranic Quote
          </span>
          <blockquote className="mt-6 text-3xl font-light leading-relaxed">
            &ldquo;Dan sesungguhnya telah Kami mudahkan Al-Quran untuk pelajaran, maka adakah orang yang mengambil pelajaran?&rdquo;
          </blockquote>
          <cite className="block mt-4 text-sm font-medium text-blue-200 not-italic">
            — Q.S. Al-Qamar: 17
          </cite>
        </div>

        <div className="text-xs text-blue-200/60 relative z-10">
          &copy; {new Date().getFullYear()} Tahfiy Digital. All rights reserved.
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <Suspense
          fallback={
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
