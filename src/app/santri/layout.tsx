"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { FiMenu } from "react-icons/fi";

export default function SantriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 font-sans antialiased">
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* Pass state control ke Sidebar */}
        <Sidebar 
          setActiveTab={setActiveTab} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
        />

        {/* Wrapper Konten Utama */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Navbar khusus Mobile & Tablet (Akan tersembunyi di Desktop `lg:hidden`) */}
          <header className="lg:hidden bg-white border-b border-blue-100 px-4 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-100 transition active:scale-95"
                aria-label="Open Menu"
              >
                <FiMenu className="w-6 h-6" />
              </button>
              <span className="font-bold text-gray-800 text-lg tracking-tight capitalize">{activeTab}</span>
            </div>
          </header>

          {/* Area Konten Utama */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              {children}
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}