import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { usePagination, DOTS } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";

interface PaginationComponentProps {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
  className?: string;
  showItemsPerPageSelect?: boolean;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
  onSizeChange,
  className,
  showItemsPerPageSelect = true,
}) => {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    pageSize,
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Nếu không có range (trường hợp lỗi) thì không render
  if (!paginationRange || paginationRange.length === 0) {
    return null;
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-center justify-between gap-4 px-4 py-4 bg-white rounded-3xl border border-emerald-50 shadow-sm",
        className,
      )}
    >
      {/* 1. Left: Info */}
      <div className="text-sm text-slate-500">
        Hiển thị{" "}
        <span className="font-bold text-emerald-600 mx-1">
          {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
        </span>{" "}
        đến{" "}
        <span className="font-bold text-emerald-600 mx-1">
          {Math.min(currentPage * pageSize, totalCount)}
        </span>{" "}
        trong tổng số{" "}
        <span className="font-bold text-emerald-600 mx-1">{totalCount}</span>{" "}
        kết quả
      </div>

      {/* 2. Right: Select & Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-6">
        {showItemsPerPageSelect && onSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 italic">
              Hiển thị mỗi trang:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(val) => onSizeChange(Number(val))}
            >
              <SelectTrigger className="w-[80px] h-10 border-emerald-100 rounded-xl bg-slate-50 focus:ring-emerald-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-emerald-50 shadow-xl">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-emerald-50">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="h-10 px-4 rounded-xl text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 disabled:opacity-30 gap-1 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-bold text-xs uppercase tracking-wider">
              Trước
            </span>
          </Button>

          {paginationRange.map((pageNumber, index) => {
            if (pageNumber === DOTS) {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-2 text-emerald-300 font-bold"
                >
                  ...
                </span>
              );
            }

            const page = pageNumber as number;
            const isActive = page === currentPage;

            return (
              <Button
                key={page}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onPageChange(page)}
                className={cn(
                  "h-10 w-10 p-0 rounded-xl transition-all duration-200 font-bold text-sm",
                  isActive
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-600"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-600",
                )}
              >
                {page}
              </Button>
            );
          })}

          <Button
            variant="ghost"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="h-10 px-4 rounded-xl text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 disabled:opacity-30 gap-1 transition-all"
          >
            <span className="hidden sm:inline font-bold text-xs uppercase tracking-wider">
              Sau
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PaginationComponent);
