import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ShoppingBag, Package, Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get("orderCode");

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "linear-gradient(#1A4331 1px, transparent 1px), linear-gradient(90deg, #1A4331 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating leaf decorations */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-[0.06] text-[#1A4331]"
            style={{
              top: `${[10, 25, 60, 75, 15, 85][i]}%`,
              left: `${[5, 85, 10, 80, 50, 40][i]}%`,
              fontSize: `${[48, 32, 56, 40, 24, 36][i]}px`,
              transform: `rotate(${[15, -20, 30, -10, 45, -30][i]}deg)`,
            }}
          >
            🍃
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Card */}
        <div
          className={`bg-white border-2 border-[#1A4331]/15 shadow-xl p-10 text-center transition-all duration-700 ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Tea4Life branding */}
          <div className="flex items-center justify-center gap-1.5 mb-8">
            <Leaf className="h-4 w-4 text-[#8A9A7A]" />
            <span className="text-[#8A9A7A] text-xs font-bold uppercase tracking-widest">
              Tea4Life
            </span>
          </div>

          {/* Animated checkmark */}
          <div
            className={`flex items-center justify-center mb-6 transition-all duration-700 delay-200 ${
              animate ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          >
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 stroke-[1.5]" />
              </div>
              {/* Sparkle accents */}
              <Sparkles
                className="absolute -top-2 -right-2 h-6 w-6 text-emerald-400 animate-pulse"
                style={{ animationDuration: "2s" }}
              />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl pixel-text text-[#1A4331] mb-3">
            Thanh Toán Thành Công!
          </h1>

          <p className="text-[#1A4331]/60 text-sm leading-relaxed mb-2">
            Cảm ơn bạn đã tin tưởng Tea4Life. 🍵
          </p>
          <p className="text-[#1A4331]/60 text-sm leading-relaxed mb-6">
            Đơn hàng của bạn đã được xác nhận và đang được xử lý.
          </p>

          {/* Order code chip */}
          {orderCode && (
            <div className="inline-flex items-center gap-2 bg-[#1A4331]/5 border border-[#1A4331]/15 px-4 py-2 mb-8">
              <Package className="h-3.5 w-3.5 text-[#8A9A7A]" />
              <span className="text-xs text-[#1A4331]/70 font-medium">
                Mã đơn hàng:{" "}
              </span>
              <span className="text-xs font-bold text-[#1A4331]">
                {orderCode}
              </span>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="flex-1 bg-[#1A4331] text-[#F8F5F0] hover:bg-[#1A4331]/80 rounded-none h-11 font-bold text-sm"
            >
              <Link to="/order">
                <Package className="h-4 w-4 mr-2" />
                Xem đơn hàng
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 border-2 border-[#1A4331]/30 text-[#1A4331] hover:bg-[#1A4331]/5 rounded-none h-11 font-bold text-sm"
            >
              <Link to="/shop">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Tiếp tục mua sắm
              </Link>
            </Button>
          </div>
        </div>

        {/* Sub note */}
        <p className="text-center text-[11px] text-[#1A4331]/40 mt-6">
          Trạng thái đơn hàng sẽ được cập nhật tự động. Bạn có thể kiểm tra
          trong mục "Đơn hàng của tôi".
        </p>
      </div>
    </div>
  );
}
