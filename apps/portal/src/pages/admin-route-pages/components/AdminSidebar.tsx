"use client";

import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  ChevronRight,
  LayoutGrid,
  Activity,
  ShieldCheck,
  Lock,
  Settings,
  LogOut,
  Ticket,
  Store,
  X,
  Newspaper,
  LibraryBig,
  Truck,
  Bot,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarGroup {
  label: string;
  links: SidebarLink[];
}

const adminGroups: SidebarGroup[] = [
  {
    label: "Tổng quan",
    links: [
      { name: "Dashboard", href: "/app/admin/dashboard", icon: LayoutDashboard },
      { name: "Báo cáo", href: "/app/admin/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Bán hàng",
    links: [
      { name: "Đơn hàng", href: "/app/admin/orders", icon: ShoppingCart },
      { name: "Phiếu giảm giá", href: "/app/admin/vouchers", icon: Ticket },
    ],
  },
  {
    label: "Sản phẩm",
    links: [
      { name: "Sản phẩm", href: "/app/admin/products", icon: Package },
      { name: "Danh mục", href: "/app/admin/categories", icon: LayoutGrid },
      { name: "Tùy chọn SP", href: "/app/admin/product-options", icon: Settings },
    ],
  },
  {
    label: "Nội dung",
    links: [
      { name: "Tin tức", href: "/app/admin/news", icon: Newspaper },
      { name: "Chủ đề", href: "/app/admin/news-categories", icon: LibraryBig },
    ],
  },
  {
    label: "Hệ thống",
    links: [
      { name: "AI Chat", href: "/app/admin/ai-chat", icon: Bot },
      { name: "Cửa hàng", href: "/app/admin/stores", icon: Store },
      { name: "Tài xế", href: "/app/admin/drivers", icon: Truck },
      { name: "Người dùng", href: "/app/admin/users", icon: Users },
      { name: "Phân quyền", href: "/app/admin/permissions", icon: ShieldCheck },
      { name: "Chức vụ", href: "/app/admin/roles", icon: Lock },
      { name: "Nhật ký", href: "/app/admin/audit-logs", icon: Activity },
    ],
  },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { pathname } = useLocation();

  return (
    <aside
      className={cn(
        "fixed md:sticky top-0 left-0 z-50 md:z-auto",
        "w-[264px] h-screen flex flex-col",
        "bg-[#064e3b] border-r border-emerald-800/40",
        "transition-transform duration-300 ease-in-out",
        // Mobile: slide in/out
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        // Desktop: always visible
        "md:flex"
      )}
    >
      {/* Brand */}
      <div className="px-5 py-4 flex items-center justify-between shrink-0">
        <Link to="/app/admin/dashboard" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/10 shrink-0 ring-1 ring-white/10">
            <img
              src="/logo/logo.png"
              alt="Logo"
              className="h-6 w-6 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-[15px] leading-none tracking-tight">
              Tea4Life
            </span>
            <span className="text-emerald-200/70 text-[9px] uppercase font-bold tracking-[0.25em] mt-0.5">
              Admin Panel
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-emerald-200/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Separator */}
      <div className="mx-4 h-px bg-linear-to-r from-transparent via-emerald-700/50 to-transparent" />

      {/* Navigation */}
      <ScrollArea className="flex-1 min-h-0 px-3 py-3">
        <nav className="space-y-5">
          {adminGroups.map((group) => (
            <div key={group.label} className="space-y-0.5">
              <h3 className="px-3 mb-1.5 text-[10px] font-semibold text-white/50 uppercase tracking-[0.2em]">
                {group.label}
              </h3>
              {group.links.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");

                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/80 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "p-1.5 rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-white text-emerald-700 shadow-md shadow-black/10"
                            : "bg-white/10 text-emerald-200/50 group-hover:bg-white/15 group-hover:text-emerald-100"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span>{link.name}</span>
                    </div>

                    {isActive && (
                      <ChevronRight className="h-3.5 w-3.5 text-white/60" />
                    )}

                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-white rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-emerald-300/15 shrink-0">
        <Link
          to="/app"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-emerald-100/50 hover:bg-white/8 hover:text-white transition-all group"
        >
          <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/15 transition-colors">
            <LogOut className="h-3.5 w-3.5" />
          </div>
          Quay lại Hub
        </Link>
      </div>
    </aside>
  );
}
