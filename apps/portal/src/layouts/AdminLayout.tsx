"use client";

import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/pages/admin-route-pages/components/AdminSidebar";
import AdminTopbar from "@/pages/admin-route-pages/components/AdminTopbar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f0f2f5]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
