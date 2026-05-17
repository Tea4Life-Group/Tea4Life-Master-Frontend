import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  XCircle,
  ShoppingCart,
  Leaf,
  ArrowLeft,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { addCartItemApi } from "@/services/cartApi";
import type { CartItemResponse } from "@/types/cart/CartItemResponse";

const CART_SNAPSHOT_KEY = "tea4life_cart_snapshot";

type RestoreStatus = "idle" | "restoring" | "done" | "error";

export default function PaymentCancelPage() {
  const [animate, setAnimate] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus>("idle");
  const [restoredCount, setRestoredCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // ─── KEY FIX ───────────────────────────────────────────────
    // Read AND delete from sessionStorage synchronously in one step.
    // React 18 StrictMode runs useEffect twice in dev; the second run
    // will find nothing in sessionStorage, preventing double-restore.
    // ──────────────────────────────────────────────────────────
    const raw = sessionStorage.getItem(CART_SNAPSHOT_KEY);
    sessionStorage.removeItem(CART_SNAPSHOT_KEY); // sync — must happen before any await

    if (!raw) return; // no snapshot → cart was already fine, or already restored

    let items: CartItemResponse[];
    try {
      items = JSON.parse(raw) as CartItemResponse[];
    } catch {
      return;
    }

    if (!items.length) return;

    const restore = async () => {
      setRestoreStatus("restoring");
      let successCount = 0;

      for (const item of items) {
        try {
          await addCartItemApi({
            productId: item.productId,
            productName: item.productName,
            productImageUrl: item.productImageUrl,
            selectedOptions: item.selectedOptions?.map((opt) => ({
              productOptionId: opt.productOptionId,
              productOptionName: opt.productOptionName,
              productOptionValueId: opt.productOptionValueId,
              productOptionValueName: opt.productOptionValueName,
              extraPrice: opt.extraPrice,
            })),
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          });
          successCount++;
        } catch {
          // If a product is unavailable, skip it and continue
        }
      }

      setRestoredCount(successCount);
      setRestoreStatus(successCount > 0 ? "done" : "error");
    };

    restore();
  }, []); // empty deps — runs once on mount

  const renderStatusBanner = () => {
    switch (restoreStatus) {
      case "restoring":
        return (
          <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-4 py-3 mb-8">
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />
            <p className="text-[12px] text-blue-700 font-medium text-left">
              Đang khôi phục sản phẩm về giỏ hàng...
            </p>
          </div>
        );
      case "done":
        return (
          <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 px-4 py-3 mb-8 text-left">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-[12px] text-emerald-700 leading-relaxed">
              Đã khôi phục{" "}
              <strong>{restoredCount} sản phẩm</strong> về giỏ hàng.
              Bạn có thể thử lại bất cứ lúc nào!
            </p>
          </div>
        );
      case "error":
        return (
          <div className="flex items-start gap-2.5 bg-orange-50 border border-orange-200 px-4 py-3 mb-8 text-left">
            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
            <p className="text-[12px] text-orange-700 leading-relaxed">
              Không thể khôi phục giỏ hàng tự động. Vui lòng thêm lại sản phẩm
              thủ công.
            </p>
          </div>
        );
      default:
        return (
          <p className="text-[#1A4331]/60 text-sm leading-relaxed mb-8">
            Đơn hàng{" "}
            <span className="font-semibold text-[#1A4331]">
              chưa được xác nhận
            </span>
            . Giỏ hàng của bạn vẫn còn nguyên — bạn có thể thử lại bất cứ lúc
            nào.
          </p>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center relative overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "linear-gradient(#1A4331 1px, transparent 1px), linear-gradient(90deg, #1A4331 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div
          className={`bg-white border-2 border-[#1A4331]/15 shadow-xl p-10 text-center transition-all duration-700 ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Branding */}
          <div className="flex items-center justify-center gap-1.5 mb-8">
            <Leaf className="h-4 w-4 text-[#8A9A7A]" />
            <span className="text-[#8A9A7A] text-xs font-bold uppercase tracking-widest">
              Tea4Life
            </span>
          </div>

          {/* Icon */}
          <div
            className={`flex items-center justify-center mb-6 transition-all duration-700 delay-200 ${
              animate ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          >
            <div className="h-24 w-24 rounded-full bg-orange-50 border-4 border-orange-200 flex items-center justify-center">
              <XCircle className="h-12 w-12 text-orange-400 stroke-[1.5]" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl pixel-text text-[#1A4331] mb-3">
            Đã Hủy Thanh Toán
          </h1>
          <p className="text-[#1A4331]/60 text-sm leading-relaxed mb-4">
            Giao dịch của bạn đã bị hủy hoặc không hoàn tất.
          </p>

          {/* Dynamic status banner */}
          {renderStatusBanner()}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              disabled={restoreStatus === "restoring"}
              className="flex-1 bg-[#1A4331] text-[#F8F5F0] hover:bg-[#1A4331]/80 rounded-none h-11 font-bold text-sm disabled:opacity-60"
            >
              <Link to="/cart">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Quay lại giỏ hàng
              </Link>
            </Button>
            <Button
              asChild
              disabled={restoreStatus === "restoring"}
              variant="outline"
              className="flex-1 border-2 border-[#1A4331]/30 text-[#1A4331] hover:bg-[#1A4331]/5 rounded-none h-11 font-bold text-sm disabled:opacity-60"
            >
              <Link to="/checkout">
                <RotateCcw className="h-4 w-4 mr-2" />
                Thử lại thanh toán
              </Link>
            </Button>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-[#8A9A7A] hover:text-[#1A4331] text-xs font-medium mt-5 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Tiếp tục mua sắm
          </Link>
        </div>

        <p className="text-center text-[11px] text-[#1A4331]/40 mt-6">
          Nếu bạn gặp vấn đề khi thanh toán, vui lòng liên hệ hỗ trợ Tea4Life.
        </p>
      </div>
    </div>
  );
}
