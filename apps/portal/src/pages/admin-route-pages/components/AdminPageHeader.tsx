import React from "react";
import { Search, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminPageHeaderProps {
  /** Page icon (from lucide-react) */
  icon: LucideIcon;
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Optional: search placeholder text */
  searchPlaceholder?: string;
  /** Optional: search value (controlled) */
  searchValue?: string;
  /** Optional: search onChange handler */
  onSearchChange?: (value: string) => void;
  /** Optional: render action buttons on the right side */
  actions?: React.ReactNode;
}

export default function AdminPageHeader({
  icon: Icon,
  title,
  description,
  searchPlaceholder = "Tìm kiếm...",
  searchValue,
  onSearchChange,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm">
      {/* Top row: icon + title + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 ring-1 ring-emerald-100">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight tracking-tight">
              {title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Bottom row: search bar */}
      {onSearchChange !== undefined && (
        <div className="px-5 pb-4 pt-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              className="pl-10 h-9 text-sm bg-slate-50/80 border-slate-200 rounded-lg 
                         focus-visible:ring-emerald-500/20 focus-visible:border-emerald-400
                         transition-colors"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
