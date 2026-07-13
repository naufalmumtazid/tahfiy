"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FiBookOpen, FiLogOut, FiUsers, FiX } from "react-icons/fi";
import { MdDashboard, MdPeople, MdOutlineNotes } from "react-icons/md";
import { getCurrentUser, logoutAction, type AuthUser } from "@/actions/auth";
import logoImg from "@/assets/logo.png";
import { IconType } from "react-icons";

interface SidebarProps {
    setActiveTab?: (tab: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

interface SidebarItemType {
    id: string,
    label: string,
    icon: IconType,
    href: string;
}

const adminMenuItems: SidebarItemType[] = [
    { id: "dashboard", label: "Dashboard", icon: MdDashboard, href: "/admin" },
    { id: "halaqah", label: "Halaqah", icon: MdOutlineNotes, href: "/admin/halaqah" },
    { id: "santri", label: "Santri", icon: MdPeople, href: "/admin/santri" },
    { id: "ustadz", label: "Ustadz", icon: MdPeople, href: "/admin/ustadz" },
    { id: "users", label: "Users", icon: FiUsers, href: "/admin/users" },
];

const ustadzMenuItems: SidebarItemType[] = [
    { id: "dashboard", label: "Dashboard", icon: MdDashboard, href: "/ustadz" },
    { id: "halaqah", label: "Halaqah", icon: MdOutlineNotes, href: "/ustadz/halaqah" },
];

const santriMenuItems: SidebarItemType[]  = [
    { id: "dashboard", label: "Dashboard", icon: MdDashboard, href: "/santri" },
];


export default function Sidebar({ setActiveTab, isOpen, setIsOpen }: SidebarProps) {
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

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : "AD";

    // --- MENENTUKAN MENU YANG AKTIF ---
    let activeMenuItems: SidebarItemType[]  = [];
    if (user?.role === "admin") activeMenuItems = adminMenuItems;
    else if (user?.role === "ustadz") activeMenuItems = ustadzMenuItems;
    else if (user?.role === "santri") activeMenuItems = santriMenuItems;
    // ----------------------------------

    return (
        <>
            {/* Backdrop Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0
                w-72 h-screen flex-shrink-0 bg-white border-r border-blue-100 shadow-lg
                transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                <div className="h-full flex flex-col">
                    {/* Logo & Close Button */}
                    <div className="px-6 py-6 border-b border-blue-50 flex items-center justify-between">
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
                                <p className="text-xs text-gray-500 mt-0.5">Tahfidz Digital System</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {activeMenuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => {
                                        setActiveTab?.(item.id);
                                        setIsOpen(false);
                                    }}
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
                                        {user?.username || "Loading..."}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate capitalize">
                                        {user?.role || "Guest"}
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
        </>
    );
}