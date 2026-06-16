"use client";

import { FiPlusCircle, FiSearch } from "react-icons/fi";

interface HeaderProps {
    title?: string;
    subtitle?: string;
    showNewSession?: boolean;
    showSearch?: boolean;
}

export default function Header({
    title = "Welcome back",
    subtitle = "Selamat datang di Tahfiy!",
    showNewSession = false,
    showSearch = false
}: HeaderProps) {
    return (
        <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    <p className="text-gray-500 mt-1">{subtitle}</p>
                </div>
                <div className="flex gap-3">
                    {showNewSession && (
                        <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md">
                            <FiPlusCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">New Session</span>
                        </button>
                    )}
                    {showSearch && (
                        <div className="relative">
                            <FiSearch className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 text-sm w-64 bg-white"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}