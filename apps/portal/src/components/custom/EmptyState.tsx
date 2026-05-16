import React from "react";
import { type LucideIcon, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = PackageOpen,
  title = "Không có dữ liệu",
  description = "Hiện tại chưa có thông tin nào được cập nhật trong danh sách này.",
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-dashed border-emerald-100 shadow-sm animate-in fade-in zoom-in duration-300",
        className,
      )}
    >
      <div className="relative mb-6">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-emerald-100 blur-2xl rounded-full opacity-40 scale-150" />

        <div className="relative flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-500 shadow-inner">
          <Icon className="w-10 h-10" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>

      <p className="text-slate-500 max-w-xs mx-auto mb-8 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 rounded-2xl shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
