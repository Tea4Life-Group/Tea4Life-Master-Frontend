"use client";

import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Search, X } from "lucide-react";
import type { ProductCategoryResponse } from "@/types/product-category/ProductCategoryResponse";
import { priceRanges } from "../constants.ts";

interface FilterSidebarProps {
  nameInput: string;
  setNameInput: (value: string) => void;
  categoryId: string;
  priceRange: string;
  categories: ProductCategoryResponse[];
  hasActiveFilters: boolean;
  onSearch: () => void;
  onUpdateParams: (updates: Record<string, string>) => void;
  onClearFilters: () => void;
}

export default function FilterSidebar({
  nameInput,
  setNameInput,
  categoryId,
  priceRange,
  categories,
  hasActiveFilters,
  onSearch,
  onUpdateParams,
  onClearFilters,
}: FilterSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Name Search */}
      <div className="space-y-2">
        <Label className="text-[#1A4331] font-bold uppercase text-xs tracking-wider">
          Tên sản phẩm
        </Label>
        <div className="flex gap-2">
          <input
            placeholder="Tìm theo tên..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="w-full h-9 bg-[#F8F5F0] border-2 border-[#1A4331]/20 px-3 text-sm text-[#1A4331] focus:outline-none focus:border-[#1A4331] placeholder-[#8A9A7A] transition-colors"
          />
          <Button
            size="icon"
            onClick={onSearch}
            className="bg-[#1A4331] text-[#F8F5F0] hover:bg-[#8A9A7A] rounded-none shrink-0 w-9 h-9"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="text-[#1A4331] font-bold uppercase text-xs tracking-wider">
          Danh mục
        </Label>
        <Select
          value={categoryId}
          onValueChange={(value) => onUpdateParams({ categoryId: value })}
        >
          <SelectTrigger className="border-2 border-[#1A4331]/20 bg-[#F8F5F0] text-[#1A4331] text-sm focus:ring-0 focus:ring-offset-0 rounded-none h-9">
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent className="border border-[#1A4331]/20 bg-[#F8F5F0] rounded-none shadow-lg">
            <SelectItem
              value="all"
              className="text-sm text-[#1A4331] focus:bg-[#8A9A7A] focus:text-[#F8F5F0] rounded-none cursor-pointer"
            >
              Tất cả
            </SelectItem>
            {categories.map((c) => (
              <SelectItem
                key={c.id}
                value={c.id}
                className="text-sm text-[#1A4331] focus:bg-[#8A9A7A] focus:text-[#F8F5F0] rounded-none cursor-pointer"
              >
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label className="text-[#1A4331] font-bold uppercase text-xs tracking-wider">
          Mức giá
        </Label>
        <Select
          value={priceRange}
          onValueChange={(value) => onUpdateParams({ priceRange: value })}
        >
          <SelectTrigger className="border-2 border-[#1A4331]/20 bg-[#F8F5F0] text-[#1A4331] text-sm focus:ring-0 focus:ring-offset-0 rounded-none h-9">
            <SelectValue placeholder="Chọn mức giá" />
          </SelectTrigger>
          <SelectContent className="border border-[#1A4331]/20 bg-[#F8F5F0] rounded-none shadow-lg">
            {priceRanges.map((p) => (
              <SelectItem
                key={p.value}
                value={p.value}
                className="text-sm text-[#1A4331] focus:bg-[#8A9A7A] focus:text-[#F8F5F0] rounded-none cursor-pointer"
              >
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          onClick={onClearFilters}
          className="w-full bg-[#D2A676] text-[#1A4331] hover:bg-red-400 hover:text-white rounded-none h-9 font-bold text-xs"
        >
          <X className="h-4 w-4 mr-2" />
          Xóa Bộ Lọc
        </Button>
      )}
    </div>
  );
}
