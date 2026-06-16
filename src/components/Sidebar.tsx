"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FiBookOpen, FiLogOut, FiUsers } from "react-icons/fi";
import { MdDashboard, MdPeople, MdAnalytics, MdSchool } from "react-icons/md";
import { getCurrentUser, logoutAction, type AuthUser } from "@/actions/auth";
import logoImg from "@/assets/logo.png";

interface SidebarProps {
    activeTab?: string;
    setActiveTab?: (tab: string) => void;
}

const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: MdDashboard, href: "/admin" },
    { id: "ziyadah", label: "Ziyadah", icon: FiBookOpen, href: "/admin/quran/ziyadah" },
    { id: "murojaah", label: "Murojaah", icon: FiBookOpen, href: "/admin/quran/murojaah" },
    { id: "halaqah", label: "Halaqah", icon: MdAnalytics, href: "/admin/halaqah" },
    { id: "students", label: "Santri", icon: MdPeople, href: "/admin/students" },
    { id: "teachers", label: "Ustadz", icon: MdSchool, href: "/admin/teachers" },
    { id: "users", label: "Users", icon: FiUsers, href: "/admin/users" },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        getCurrentUser().then((res) => {
            if (res) {
                setUser(res);
            }
        });
    }, []);

    const handleLogout = async () => {
        if (confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
            await logoutAction();
        }
    };

    // Generate initials for profile card
    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : "AD";

    return (
        <aside className="hidden lg:block w-72 flex-shrink-0 bg-white border-r border-blue-100 shadow-lg">
            <div className="h-full flex flex-col">
                {/* Logo */}
                <div className="px-6 py-8 border-b border-blue-50">
                    <div className="flex items-center gap-3">
                        <Image
                            src={logoImg}
                            alt="Tahfiy Logo"
                            width={40}
                            height={40}
                            className="w-10 h-10 object-contain rounded-xl shadow-md"
                        />
                        <div>
                            <h1 className="font-bold text-gray-800 text-xl tracking-tight">Tahfiy</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Quran Memory System</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.id === "dashboard" && pathname === "/admin");

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => setActiveTab?.(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${isActive
                                    ? "bg-blue-50 text-blue-700 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-blue-50">
                    <div className="bg-blue-50 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                                <span className="text-white text-sm font-bold">{initials}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                    {user?.username || "Admin"}
                                </p>
                                <p className="text-xs text-gray-500 truncate capitalize">
                                    {user?.role || "Administrator"}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-gray-400 hover:text-red-600 transition p-1.5 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Logout"
                            >
                                <FiLogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}