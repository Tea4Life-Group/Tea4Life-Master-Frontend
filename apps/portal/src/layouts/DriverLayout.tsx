"use client";

import { useState } from "react";
import { Outlet, Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Truck,
  ChevronRight,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const driverLinks = [
  { name: "Tổng quan", href: "/driver/dashboard", icon: LayoutDashboard },
  { name: "Nhiệm vụ", href: "/driver/orders", icon: ClipboardList },
];

export default function DriverLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

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
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 md:z-auto",
          "w-[264px] h-screen flex flex-col",
          "bg-[#0f172a] border-r border-slate-800",
          "transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "md:flex"
        )}
      >
        {/* Brand */}
        <div className="px-5 py-4 flex items-center justify-between shrink-0">
          <Link to="/driver/dashboard" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/10 shrink-0 ring-1 ring-white/10">
              <Truck className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-[15px] leading-none tracking-tight">
                Tea4Life
              </span>
              <span className="text-emerald-400/80 text-[9px] uppercase font-bold tracking-[0.25em] mt-0.5">
                Tài Xế
              </span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-4 h-px bg-linear-to-r from-transparent via-slate-700/50 to-transparent" />

        {/* Navigation */}
        <ScrollArea className="flex-1 min-h-0 px-3 py-3">
          <nav className="space-y-0.5">
            {driverLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");

              return (
                <NavLink
                  key={link.href}
                  to={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "p-1.5 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-emerald-500/20 text-emerald-400 shadow-md shadow-black/10"
                          : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-slate-300"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span>{link.name}</span>
                  </div>
                  {isActive && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5 text-emerald-400/60" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-emerald-400 rounded-r-full" />
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all group"
          >
            <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
              <LogOut className="h-3.5 w-3.5" />
            </div>
            Quay lại Website
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 mr-3"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">
              Trạm điều phối giao hàng
            </span>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
