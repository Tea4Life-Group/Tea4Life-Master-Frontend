import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { CreditCard, MapPin, ChevronLeft, Leaf, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { getCartApi } from "@/services/cartApi";
import { checkoutOrderApi } from "@/services/orderApi";
import type { CartResponse } from "@/types/cart/CartResponse";
import { handleError } from "@/lib/utils";
import { toast } from "sonner";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { fullName } = useAuth();
  
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    receiverName: "",
    phone: "",
    province: "",
    ward: "",
    detail: "",
    paymentMethod: "COD" as "COD" | "BANKING",
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      receiverName: fullName || "",
    }));
  }, [fullName]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const res = await getCartApi();
        setCart(res.data.data);
        if (!res.data.data?.items?.length) {
          toast.error("Giỏ hàng của bạn đang trống.");
          navigate("/shop");
        }
      } catch (error) {
        handleError(error, "Không thể tải giỏ hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePaymentChange = (value: string) => {
    setFormData(prev => ({ ...prev, paymentMethod: value as "COD" | "BANKING" }));
  };

  const handleSubmit = async () => {
    if (!formData.receiverName || !formData.phone || !formData.detail) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng.");
      return;
    }

    if (!cart?.items?.length) return;

    try {
      setSubmitting(true);

      const res = await checkoutOrderApi({
        receiverName: formData.receiverName,
        phone: formData.phone,
        province: formData.province || "-",
        ward: formData.ward || "-",
        detail: formData.detail,
        paymentMethod: formData.paymentMethod,
      });

      toast.success("Đặt hàng thành công!");
      navigate(`/order/${res.data.data.id}`);
    } catch (error) {
      handleError(error, "Không thể đặt hàng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#1A4331]" />
      </div>
    );
  }

  const subtotal = cart?.totalAmount || 0;
  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + (cart?.items?.length ? shippingFee : 0);

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A4331] relative">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "linear-gradient(#1A4331 1px, transparent 1px), linear-gradient(90deg, #1A4331 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <Link
          to="/cart"
          className="inline-flex items-center text-[#8A9A7A] hover:text-[#1A4331] font-bold text-sm mb-8 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại giỏ hàng
        </Link>

        <div className="mb-10 border-b-2 border-[#1A4331]/10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-[#8A9A7A]" />
            <p className="text-[#8A9A7A] font-bold text-sm uppercase tracking-wider">
              Thanh Toán
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl pixel-text text-[#1A4331]">
            Xác Nhận Đơn Hàng
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border-2 border-[#1A4331]/15">
              <div className="px-6 py-4 border-b-2 border-[#1A4331]/10">
                <h2 className="flex items-center gap-2 text-[#1A4331] font-bold text-sm uppercase tracking-wider">
                  <MapPin className="h-4 w-4 text-[#8A9A7A]" /> Thông tin giao hàng
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiverName" className="text-xs font-bold text-[#1A4331] uppercase tracking-wider">
                      Họ và tên
                    </Label>
                    <Input
                      id="receiverName"
                      value={formData.receiverName}
                      onChange={handleInputChange}
                      placeholder="Nguyễn Văn A"
                      className="border-2 border-[#1A4331]/20 bg-[#F8F5F0] rounded-none focus-visible:ring-0 focus-visible:border-[#1A4331] text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-bold text-[#1A4331] uppercase tracking-wider">
                      Số điện thoại
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0901234567"
                      className="border-2 border-[#1A4331]/20 bg-[#F8F5F0] rounded-none focus-visible:ring-0 focus-visible:border-[#1A4331] text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province" className="text-xs font-bold text-[#1A4331] uppercase tracking-wider">
                      Tỉnh / Thành phố
                    </Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      placeholder="TP. Hồ Chí Minh"
                      className="border-2 border-[#1A4331]/20 bg-[#F8F5F0] rounded-none focus-visible:ring-0 focus-visible:border-[#1A4331] text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ward" className="text-xs font-bold text-[#1A4331] uppercase tracking-wider">
                      Phường / Xã
                    </Label>
                    <Input
                      id="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                      placeholder="Phường 6"
                      className="border-2 border-[#1A4331]/20 bg-[#F8F5F0] rounded-none focus-visible:ring-0 focus-visible:border-[#1A4331] text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="detail" className="text-xs font-bold text-[#1A4331] uppercase tracking-wider">
                    Địa chỉ chi tiết
                  </Label>
                  <Input
                    id="detail"
                    value={formData.detail}
                    onChange={handleInputChange}
                    placeholder="Số nhà, tên đường..."
                    className="border-2 border-[#1A4331]/20 bg-[#F8F5F0] rounded-none focus-visible:ring-0 focus-visible:border-[#1A4331] text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-[#1A4331]/15">
              <div className="px-6 py-4 border-b-2 border-[#1A4331]/10">
                <h2 className="flex items-center gap-2 text-[#1A4331] font-bold text-sm uppercase tracking-wider">
                  <CreditCard className="h-4 w-4 text-[#8A9A7A]" /> Phương thức thanh toán
                </h2>
              </div>
              <div className="p-6">
                <RadioGroup value={formData.paymentMethod} onValueChange={handlePaymentChange} className="space-y-3">
                  <div 
                    onClick={() => handlePaymentChange("COD")}
                    className={`flex items-center space-x-3 p-3 border-2 transition-colors cursor-pointer ${formData.paymentMethod === "COD" ? "border-[#1A4331] bg-[#1A4331]/5" : "border-[#1A4331]/10"}`}
                  >
                    <RadioGroupItem value="COD" id="COD" />
                    <Label htmlFor="COD" className="flex-1 cursor-pointer text-sm text-[#1A4331] font-bold">
                      Thanh toán khi nhận hàng (COD)
                    </Label>
                  </div>
                  <div 
                    onClick={() => handlePaymentChange("BANKING")}
                    className={`flex items-center space-x-3 p-3 border-2 transition-colors cursor-pointer ${formData.paymentMethod === "BANKING" ? "border-[#1A4331] bg-[#1A4331]/5" : "border-[#1A4331]/10"}`}
                  >
                    <RadioGroupItem value="BANKING" id="BANKING" />
                    <Label htmlFor="BANKING" className="flex-1 cursor-pointer text-sm text-[#1A4331] font-bold">
                      Chuyển khoản ngân hàng (BANKING)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-[#1A4331]/15 sticky top-24">
              <div className="px-6 py-4 border-b-2 border-[#1A4331]/10">
                <h2 className="text-[#1A4331] font-bold text-sm uppercase tracking-wider">
                  Tóm tắt đơn hàng
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#1A4331]/70">
                    Tạm tính ({cart?.totalItems} sản phẩm)
                  </span>
                  <span className="font-bold text-[#1A4331]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#1A4331]/70">Phí vận chuyển</span>
                  <span className="font-bold text-[#8A9A7A]">
                    {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="border-t-2 border-dashed border-[#1A4331]/20 pt-4">
                  <div className="flex justify-between text-xl font-bold text-[#1A4331]">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-[#1A4331] text-[#F8F5F0] hover:bg-[#8A9A7A] rounded-none h-12 text-base font-bold mt-4"
                >
                  {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : "Xác nhận Đặt hàng"}
                </Button>
                <p className="text-[10px] text-center text-[#8A9A7A] mt-2">
                  Bằng cách nhấn Đặt hàng, bạn đồng ý với Điều khoản dịch vụ của Tea4Life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
