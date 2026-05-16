"use client";

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t-[3px] border-[#1A4331]/10 bg-[#F8F5F0] text-[#1A4331] pt-16 pb-8 mt-auto z-10 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand & Story */}
          <div className="md:col-span-1 space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo/logo.png"
                alt="Tea4Life Logo"
                className="h-12 w-12 object-contain rounded-xl shadow-sm border border-[#1A4331]/10"
              />
              <span className="text-3xl font-black text-[#1A4331] tracking-tight uppercase">
                Tea4Life
              </span>
            </Link>
            <p className="text-sm text-[#1A4331]/80 leading-relaxed font-medium">
              Tea4Life ra đời từ niềm đam mê với trà và mong muốn mang đến
              những ly trà chất lượng nhất cho cộng đồng. Chúng tôi cam kết sử dụng nguyên liệu tươi ngon, có nguồn gốc rõ
              ràng để mỗi ly trà đem tới trải nghiệm trọn vẹn nhất.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1 flex flex-col space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Liên kết</h3>
            <Link to="/shop" className="text-sm text-[#1A4331]/80 hover:text-[#D2A676] hover:translate-x-1 transition-all">Thực Đơn</Link>
            <Link to="/stores" className="text-sm text-[#1A4331]/80 hover:text-[#D2A676] hover:translate-x-1 transition-all">Hệ Thống Cửa Hàng</Link>
            <Link to="/news" className="text-sm text-[#1A4331]/80 hover:text-[#D2A676] hover:translate-x-1 transition-all">Tin Tức</Link>
          </div>

          {/* Contact */}
          <div className="md:col-span-1 flex flex-col space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Liên hệ</h3>
            <p className="text-sm text-[#1A4331]/80">Email: HuynhDucPhu2502@gmail.com</p>
            <p className="text-sm text-[#1A4331]/80">Giờ mở cửa: 08:00 - 22:00</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-[#1A4331]/10 text-center flex flex-col items-center">
          <p className="text-xs text-[#1A4331]/60 font-bold tracking-widest uppercase">
            &copy; {new Date().getFullYear()} TEA4LIFE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
