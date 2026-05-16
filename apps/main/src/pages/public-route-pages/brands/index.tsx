"use client";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import {
  Store,
  ArrowRight,
  Award,
  ShieldCheck,
  CheckCircle2,
  Leaf,
} from "lucide-react";
import { brands } from "../shop/constants.ts";

export default function BrandsListPage() {
  const navigate = useNavigate();

  const handleViewProducts = (brandValue: string) => {
    navigate(`/shop?brand=${brandValue}`);
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

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-12 border-b-2 border-[#1A4331]/10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-[#8A9A7A]" />
            <p className="text-[#8A9A7A] font-bold text-sm uppercase tracking-wider">
              Đối Tác Tin Cậy
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl pixel-text text-[#1A4331]">
            Thương Hiệu Đồng Hành
          </h1>
          <p className="mt-3 text-[#1A4331]/60 text-sm max-w-2xl">
            Tea4Life tự hào là đối tác phân phối chính thức của những thương
            hiệu đồ uống danh tiếng nhất Việt Nam.
          </p>
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {brands
            .filter((b) => b.value !== "all")
            .map((brand) => (
              <div
                key={brand.value}
                className="group bg-white border-2 border-[#1A4331]/15 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[3px_3px_0px_rgba(26,67,49,0.1)]"
              >
                {/* Top Visual */}
                <div className="bg-[#1A4331] p-8 flex justify-center items-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Store className="w-full h-full -rotate-12" />
                  </div>
                  <div className="relative bg-white p-5 border-2 border-[#1A4331]/20">
                    <Store className="h-14 w-14 text-[#8A9A7A]" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                  <h2 className="text-xl font-bold text-[#1A4331] mb-3">
                    {brand.label}
                  </h2>
                  <div className="flex justify-center gap-3 mb-5">
                    <span className="flex items-center text-xs text-[#1A4331] bg-[#F8F5F0] px-3 py-1 border border-[#1A4331]/10 font-bold">
                      <Award className="w-3 h-3 mr-1 text-[#D2A676]" /> Chất
                      lượng
                    </span>
                    <span className="flex items-center text-xs text-[#1A4331] bg-[#F8F5F0] px-3 py-1 border border-[#1A4331]/10 font-bold">
                      <ShieldCheck className="w-3 h-3 mr-1 text-[#8A9A7A]" />{" "}
                      Chính hãng
                    </span>
                  </div>

                  <Button
                    onClick={() => handleViewProducts(brand.value)}
                    className="w-full bg-[#1A4331] text-[#F8F5F0] hover:bg-[#8A9A7A] rounded-none h-10 font-bold text-sm gap-2"
                  >
                    Xem sản phẩm <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
        </div>

        {/* Trust Banner */}
        <div className="bg-[#1A4331] border-2 border-[#1A4331] p-8 md:p-12 text-[#F8F5F0] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(#F8F5F0 1px, transparent 1px), linear-gradient(90deg, #F8F5F0 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h2 className="text-2xl md:text-3xl font-bold pixel-text mb-4">
                Cam Kết Từ Tea4Life
              </h2>
              <p className="text-[#F8F5F0]/70 text-sm">
                Tất cả các sản phẩm từ các thương hiệu đối tác đều được kiểm
                định chất lượng nghiêm ngặt.
              </p>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <CheckCircle2 className="w-8 h-8 text-[#8A9A7A] mx-auto mb-2" />
                <p className="text-sm font-bold">100% Chính hãng</p>
              </div>
              <div className="text-center">
                <Award className="w-8 h-8 text-[#D2A676] mx-auto mb-2" />
                <p className="text-sm font-bold">Top Thương hiệu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
