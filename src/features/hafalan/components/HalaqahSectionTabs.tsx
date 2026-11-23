"use client";

import { FiBookOpen, FiCalendar, FiUsers } from "react-icons/fi";

export type HalaqahSection = "santri" | "ziyadah" | "murojaah";

interface HalaqahSectionTabsProps {
  activeTab: HalaqahSection;
  onChange: (tab: HalaqahSection) => void;
}

const sections = [
  {
    id: "santri",
    label: "Data Santri",
    description: "Pilih santri",
    Icon: FiUsers,
  },
  {
    id: "ziyadah",
    label: "Ziyadah",
    description: "Hafalan baru",
    Icon: FiBookOpen,
  },
  {
    id: "murojaah",
    label: "Tsunnaiyyah",
    description: "Murajaah hafalan",
    Icon: FiCalendar,
  },
] as const;

export function HalaqahSectionTabs({
  activeTab,
  onChange,
}: HalaqahSectionTabsProps) {
  return (
    <nav
      aria-label="Menu halaqah"
      className="mb-6 grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-3"
    >
      {sections.map(({ id, label, description, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(id)}
            className={`flex min-w-0 items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isActive ? "bg-white/15" : "bg-blue-50 text-blue-700"
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {label}
              </span>
              <span
                className={`mt-0.5 block truncate text-xs ${
                  isActive ? "text-blue-100" : "text-slate-400"
                }`}
              >
                {description}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
