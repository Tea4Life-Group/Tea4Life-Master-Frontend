import { useState, useEffect, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  Leaf,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/features/store";
import { fetchCart, setLastAction } from "@/features/cart/cartSlice";
import { updateCartItemApi, removeCartItemApi, clearCartApi } from "@/services/cartApi";
import type { CartItemResponse } from "@/types/cart/CartItemResponse";
import { getMediaUrl, handleError } from "@/lib/utils";
import { toast } from "sonner";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

interface CartItemRowProps {
  item: CartItemResponse;
  isUpdating: boolean;
  updateQuantity: (id: string, delta: number, currentQuantity: number) => void;
  removeItem: (id: string) => void;
}

const CartItemRow = memo(
  ({ item, isUpdating, updateQuantity, removeItem }: CartItemRowProps) => {
    return (
      <div
        className={`bg-white border-2 border-[#1A4331]/15 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-200 hover:shadow-[2px_2px_0px_rgba(26,67,49,0.08)] ${
          isUpdating ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        <img
          src={
            item.productImageUrl
              ? getMediaUrl(item.productImageUrl)
              : "/placeholder.svg"
          }
          alt={item.productName}
          className="h-24 w-24 object-cover border border-[#1A4331]/10 shrink-0"
        />
        <div className="flex-1 w-full">
          <h3 className="font-bold text-[#1A4331] text-lg">
            {item.productName}
          </h3>

          {item.selectedOptions && item.selectedOptions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 mb-3">
              {item.selectedOptions.map((opt) => (
                <span
                  key={opt.productOptionValueId}
                  className="bg-[#F8F5F0] text-[#1A4331] text-xs font-semibold px-2 py-0.5 rounded-sm border border-[#1A4331]/20"
                >
                  {opt.productOptionName}: {opt.productOptionValueName}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-0 mt-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-2 border-[#1A4331]/20 text-[#1A4331] rounded-none hover:bg-[#1A4331] hover:text-[#F8F5F0]"
              onClick={() => updateQuantity(item.id, -1, item.quantity)}
              disabled={item.quantity <= 1 || isUpdating}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-10 h-8 flex items-center justify-center text-sm font-bold text-[#1A4331] border-y-2 border-[#1A4331]/20 bg-[#F8F5F0]">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-2 border-[#1A4331]/20 text-[#1A4331] rounded-none hover:bg-[#1A4331] hover:text-[#F8F5F0]"
              onClick={() => updateQuantity(item.id, 1, item.quantity)}
              disabled={isUpdating}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="text-right flex flex-row sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto h-full space-y-2 mt-4 sm:mt-0">
          <p className="font-bold text-[#1A4331] text-lg">
            {formatPrice(item.subTotal)}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-700 hover:bg-red-50 rounded-none text-xs"
            onClick={() => removeItem(item.id)}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Xóa
          </Button>
        </div>
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.isUpdating === next.isUpdating &&
      prev.item.id === next.item.id &&
      prev.item.quantity === next.item.quantity &&
      prev.item.subTotal === next.item.subTotal
    );
  }
);

const CartPage = () => {
  const dispatch = useAppDispatch();
  const { cart, loading } = useAppSelector((state) => state.cart);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const updateQuantity = useCallback(async (id: string, delta: number, currentQuantity: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) return;
    
    try {
      setIsUpdating(true);
      await updateCartItemApi(id, { quantity: newQuantity });
      dispatch(setLastAction("update"));
      dispatch(fetchCart());
    } catch (error) {
      handleError(error, "Không thể cập nhật số lượng.");
    } finally {
      setIsUpdating(false);
    }
  }, [dispatch]);

  const removeItem = useCallback(async (id: string) => {
    try {
      setIsUpdating(true);
      await removeCartItemApi(id);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      dispatch(setLastAction("remove"));
      dispatch(fetchCart());
    } catch (error) {
      handleError(error, "Không thể xóa sản phẩm.");
    } finally {
      setIsUpdating(false);
    }
  }, [dispatch]);

  const clearCart = useCallback(async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?")) {
      return;
    }
    
    try {
      setIsUpdating(true);
      await clearCartApi();
      toast.success("Đã xóa toàn bộ giỏ hàng");
      dispatch(setLastAction("clear"));
      dispatch(fetchCart());
    } catch (error) {
      handleError(error, "Không thể xóa giỏ hàng.");
    } finally {
      setIsUpdating(false);
    }
  }, [dispatch]);

  const subtotal = cart?.totalAmount || 0;
  // Giả sử phí vận chuyển tĩnh hoặc miễn phí trên 500k
  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + (cart?.items?.length ? shippingFee : 0);
  const hasItems = (cart?.items?.length || 0) > 0;

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#1A4331]" />
      </div>
    );
  }

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

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10 border-b-2 border-[#1A4331]/10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-[#8A9A7A]" />
            <p className="text-[#8A9A7A] font-bold text-sm uppercase tracking-wider">
              Giỏ Hàng
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl pixel-text text-[#1A4331] flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-[#8A9A7A]" />
            Giỏ hàng của bạn
          </h1>
        </div>

        {hasItems ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Danh sách sản phẩm */}
            <div className="lg:col-span-2 space-y-4">
              {cart?.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  isUpdating={isUpdating}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
              ))}

              <div className="flex justify-between items-center mt-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center text-[#8A9A7A] hover:text-[#1A4331] font-bold text-sm transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Tiếp tục mua sắm
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  disabled={isUpdating}
                  className="text-red-400 hover:text-red-700 hover:bg-red-50 font-bold text-xs h-auto py-1 px-2 rounded-none"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Xóa toàn bộ giỏ hàng
                </Button>
              </div>
            </div>

            {/* Tóm tắt đơn hàng */}
            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-[#1A4331]/15 sticky top-24">
                <div className="p-6 space-y-4">
                  <h2 className="text-lg font-bold text-[#1A4331] uppercase tracking-wider border-b-2 border-[#1A4331]/10 pb-3">
                    Tóm tắt đơn hàng
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-[#1A4331]/70">
                      <span>Số lượng sản phẩm</span>
                      <span className="font-bold text-[#1A4331]">
                        {cart?.totalItems || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-[#1A4331]/70">
                      <span>Tạm tính</span>
                      <span className="font-bold text-[#1A4331]">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-[#1A4331]/70">
                      <span>Phí vận chuyển</span>
                      <span className="font-bold text-[#1A4331]">
                        {shippingFee === 0
                          ? "Miễn phí"
                          : formatPrice(shippingFee)}
                      </span>
                    </div>
                    {shippingFee > 0 && (
                      <p className="text-[10px] text-[#8A9A7A] italic leading-tight">
                        * Miễn phí vận chuyển cho đơn hàng trên 500.000đ
                      </p>
                    )}
                  </div>

                  <div className="border-t-2 border-dashed border-[#1A4331]/20 pt-4">
                    <div className="flex justify-between text-xl font-bold text-[#1A4331]">
                      <span>Tổng cộng</span>
                      <span className="text-[#1A4331]">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <label className="text-xs text-[#1A4331] font-bold uppercase tracking-wider mb-2 block">
                      Mã giảm giá (nếu có)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="NHAPMA"
                        className="border-2 border-[#1A4331]/20 bg-[#F8F5F0] rounded-none focus-visible:ring-0 focus-visible:border-[#1A4331] text-sm"
                      />
                      <Button
                        variant="outline"
                        className="border-2 border-[#1A4331]/20 text-[#1A4331] hover:bg-[#1A4331] hover:text-[#F8F5F0] rounded-none text-sm font-bold"
                      >
                        Áp dụng
                      </Button>
                    </div>
                  </div>

                  <Link to="/checkout" className="block w-full">
                    <Button disabled={isUpdating} className="w-full bg-[#1A4331] text-[#F8F5F0] hover:bg-[#8A9A7A] rounded-none h-12 text-base font-bold gap-2">
                      Thanh toán <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white border-2 border-dashed border-[#1A4331]/20">
            <ShoppingBag className="h-16 w-16 text-[#1A4331]/10 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1A4331]">Giỏ hàng trống</h2>
            <p className="text-[#8A9A7A] text-sm mt-2 mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng.
            </p>
            <Link to="/shop">
              <Button className="bg-[#1A4331] text-[#F8F5F0] hover:bg-[#8A9A7A] rounded-none font-bold px-8 h-11">
                Khám phá sản phẩm ngay
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(CartPage);
