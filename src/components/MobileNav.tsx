"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { FiHome, FiBookOpen, FiUsers, FiBarChart2 } from "react-icons/fi";

interface MobileNavProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Home", icon: FiHome, href: "/admin" },
  { id: "quran", label: "Quran", icon: FiBookOpen, href: "/admin/quran" },
  { id: "students", label: "Students", icon: FiUsers, href: "/admin/students" },
  { id: "progress", label: "Progress", icon: FiBarChart2, href: "/admin/progress" },
];

export default function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 shadow-lg rounded-t-2xl z-50">
        <div className="flex justify-around items-center py-2 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.id === "dashboard" && pathname === "/admin");
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveTab?.(item.id)}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition ${
                  isActive ? "text-blue-600 font-medium" : "text-gray-500"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Bottom spacer for mobile */}
      <div className="lg:hidden h-16"></div>
    </>
  );
}