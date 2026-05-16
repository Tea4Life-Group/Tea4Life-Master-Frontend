import React from "react";
import {
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Pagination,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationSectionProps {
  page: number;
  size: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}

const PaginationSection: React.FC<PaginationSectionProps> = ({
  page,
  size,
  totalElements,
  onPageChange,
  onSizeChange,
}) => {
  const totalPages = Math.ceil(totalElements / size);

  if (totalElements === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-emerald-100">
      <div className="flex items-center gap-2 text-sm text-slate-500 order-2 sm:order-1">
        <span>Hiển thị</span>
        <Select
          value={size.toString()}
          onValueChange={(value) => onSizeChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px] bg-white border-emerald-200 focus:ring-emerald-500/20">
            <SelectValue placeholder={size} />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={pageSize.toString()}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>
          trên tổng số <span className="font-bold">{totalElements}</span> bản
          ghi
        </span>
      </div>

      <div className="order-1 sm:order-2">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, page - 1))}
                className={`cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 ${
                  page === 1 ? "pointer-events-none opacity-50" : ""
                }`}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 5 && page > 3) {
                p = page - 2 + i;
              }
              if (p > totalPages) return null;

              return (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={page === p}
                    onClick={() => onPageChange(p)}
                    className={`cursor-pointer ${
                      page === p
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white pointer-events-none"
                        : "hover:bg-emerald-50 hover:text-emerald-600"
                    }`}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                className={`cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 ${
                  page === totalPages ? "pointer-events-none opacity-50" : ""
                }`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default PaginationSection;
