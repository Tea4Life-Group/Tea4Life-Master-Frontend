"use client";

import { useNavigate } from "react-router-dom";
import { Leaf, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { getProductCategoriesApi } from "@/services/productApi";
import type { ProductCategoryResponse } from "@/types/product-category/ProductCategoryResponse";
import { handleError, getMediaUrl } from "@/lib/utils";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProductCategoriesApi();
      setCategories(res.data.data || []);
    } catch (error) {
      handleError(error, "Không thể tải danh mục sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/shop?categoryId=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A4331] relative">
      {/* Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "linear-gradient(#1A4331 1px, transparent 1px), linear-gradient(90deg, #1A4331 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12 border-b-2 border-[#1A4331]/10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-[#8A9A7A]" />
            <p className="text-[#8A9A7A] font-bold text-sm uppercase tracking-wider">
              Khám Phá Thực Đơn
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl pixel-text text-[#1A4331]">
            Danh Mục Đồ Uống
          </h1>
          <p className="mt-3 text-[#1A4331]/60 text-sm">
            Tìm kiếm thức uống phù hợp với khẩu vị của bạn
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#8A9A7A]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="group bg-white border-2 border-[#1A4331]/15 p-6 flex flex-col items-start transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(26,67,49,0.1)] hover:border-[#1A4331]/40"
              >
                {/* Icon */}
                <div className="w-12 h-12 bg-[#F8F5F0] border border-[#1A4331]/10 flex items-center justify-center mb-4 group-hover:bg-[#1A4331] transition-colors rounded-lg overflow-hidden shrink-0">
                  {cat.iconUrl ? (
                    <img
                      src={getMediaUrl(cat.iconUrl)}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Leaf className="h-6 w-6 text-[#8A9A7A] group-hover:text-[#F8F5F0] transition-colors" />
                  )}
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold text-[#1A4331] mb-1.5 text-left">
                  {cat.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#1A4331]/50 mb-4 leading-relaxed text-left flex-1">
                  {cat.description || "Thức uống thơm ngon, đậm đà hương vị."}
                </p>

                {/* CTA */}
                <span className="inline-flex items-center text-xs font-bold text-[#8A9A7A] group-hover:text-[#1A4331] transition-colors mt-auto pt-2">
                  Xem thực đơn
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
