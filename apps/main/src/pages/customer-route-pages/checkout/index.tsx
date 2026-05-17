import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import {
  CreditCard,
  MapPin,
  ChevronLeft,
  Leaf,
  Loader2,
  Home,
  Building2,
  MapPinned,
  Check,
  QrCode,
  Truck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { getCartApi } from "@/services/cartApi";
import { checkoutOrderApi } from "@/services/orderApi";
import { findMyAddressesApi } from "@/services/addressApi";
import type { CartResponse } from "@/types/cart/CartResponse";
import type { AddressResponse } from "@/types/address/AddressResponse";
import { handleError } from "@/lib/utils";
import { toast } from "sonner";

const ADDRESS_TYPE_ICONS: Record<string, typeof Home> = {
  HOME: Home,
  OFFICE: Building2,
  OTHER: MapPinned,
};

const ADDRESS_TYPE_LABELS: Record<string, string> = {
  HOME: "Nhà riêng",
  OFFICE: "Văn phòng",
  OTHER: "Khác",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { fullName } = useAuth();

  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    receiverName: "",
    phone: "",
    province: "",
    ward: "",
    detail: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    paymentMethod: "COD" as "COD" | "BANKING",
  });

  const applyAddress = (addr: AddressResponse) => {
    setFormData((prev) => ({
      ...prev,
      receiverName: addr.receiverName,
      phone: addr.phone,
      province: addr.province,
      ward: addr.ward,
      detail: addr.detail,
      latitude: addr.latitude,
      longitude: addr.longitude,
    }));
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      receiverName: fullName || "",
    }));
  }, [fullName]);

  // Fetch cart + saved addresses in parallel
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cartRes, addrRes] = await Promise.all([
          getCartApi(),
          findMyAddressesApi(),
        ]);

        // Cart
        setCart(cartRes.data.data);
        if (!cartRes.data.data?.items?.length) {
          toast.error("Giỏ hàng của bạn đang trống.");
          navigate("/shop");
          return;
        }

        // Addresses
        const addresses = addrRes.data.data || [];
        setSavedAddresses(addresses);

        // Auto-select default address
        const defaultAddr = addresses.find((a) => a.isDefault);
        if (defaultAddr) {
          applyAddress(defaultAddr);
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (error) {
        handleError(error, "Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);



  const handleSelectAddress = (addr: AddressResponse) => {
    setSelectedAddressId(addr.id);
    applyAddress(addr);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Once user manually edits, clear address selection
    setSelectedAddressId(null);
  };

  const handlePaymentChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: value as "COD" | "BANKING",
    }));
  };

  const subtotal = cart?.totalAmount || 0;
  const shippingFee = 0; // subtotal > 500000 ? 0 : 30000;
  const total = subtotal + (cart?.items?.length ? shippingFee : 0);

  const handleSubmit = async () => {
    if (!formData.receiverName || !formData.phone || !formData.detail) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng.");
      return;
    }

    if (!cart?.items?.length) return;

    try {
      setSubmitting(true);

      // Snapshot cart BEFORE the checkout API call.
      // Backend clears the cart immediately on checkout regardless of payment method,
      // so if the user cancels BANKING payment we need this to restore their cart.
      if (formData.paymentMethod === "BANKING") {
        sessionStorage.setItem(
          "tea4life_cart_snapshot",
          JSON.stringify(cart.items),
        );
      }

      const res = await checkoutOrderApi({
        receiverName: formData.receiverName,
        phone: formData.phone,
        province: formData.province || "-",
        ward: formData.ward || "-",
        detail: formData.detail,
        latitude: formData.latitude,
        longitude: formData.longitude,
        paymentMethod: formData.paymentMethod,
        shippingFee: shippingFee,
      });

      const order = res.data.data;

      // BANKING: hand off to PayOS
      if (formData.paymentMethod === "BANKING" && order.checkoutUrl) {
        toast.success("Đang chuyển đến trang thanh toán...");
        window.location.href = order.checkoutUrl;
        return;
      }

      // COD success — snapshot not needed
      sessionStorage.removeItem("tea4life_cart_snapshot");
      toast.success("Đặt hàng thành công!");
      navigate(`/order/${order.id}`);
    } catch (error) {
      // Checkout API failed — cart was never touched, clear stale snapshot
      sessionStorage.removeItem("tea4life_cart_snapshot");
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
            {/* Saved addresses */}
            {savedAddresses.length > 0 && (
              <div className="bg-white border-2 border-[#1A4331]/15">
                <div className="px-6 py-4 border-b-2 border-[#1A4331]/10">
                  <h2 className="flex items-center gap-2 text-[#1A4331] font-bold text-sm uppercase tracking-wider">
                    <MapPinned className="h-4 w-4 text-[#8A9A7A]" /> Địa chỉ đã
                    lưu
                  </h2>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => {
                    const Icon =
                      ADDRESS_TYPE_ICONS[addr.addressType] || MapPinned;
                    const isSelected = selectedAddressId === addr.id;

                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectAddress(addr)}
                        className={`text-left p-4 border-2 transition-all relative ${
                          isSelected
                            ? "border-[#1A4331] bg-[#1A4331]/5"
                            : "border-[#1A4331]/10 hover:border-[#1A4331]/30"
                        }`}
                      >
                        {/* Selected check */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[#1A4331] flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-4 w-4 text-[#8A9A7A] shrink-0" />
                          <span className="text-xs font-bold text-[#8A9A7A] uppercase">
                            {ADDRESS_TYPE_LABELS[addr.addressType] || "Khác"}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] font-bold bg-[#1A4331] text-white px-1.5 py-0.5 uppercase">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-[#1A4331]">
                          {addr.receiverName}
                        </p>
                        <p className="text-xs text-[#1A4331]/60 mt-0.5">
                          {addr.phone}
                        </p>
                        <p className="text-xs text-[#1A4331]/60 mt-1 line-clamp-2">
                          {[addr.detail, addr.ward, addr.province]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipping form */}
            <div className="bg-white border-2 border-[#1A4331]/15">
              <div className="px-6 py-4 border-b-2 border-[#1A4331]/10">
                <h2 className="flex items-center gap-2 text-[#1A4331] font-bold text-sm uppercase tracking-wider">
                  <MapPin className="h-4 w-4 text-[#8A9A7A]" /> Thông tin giao
                  hàng
                </h2>
                {selectedAddressId && (
                  <p className="text-[10px] text-[#8A9A7A] mt-1">
                    Đang dùng địa chỉ đã lưu — bạn vẫn có thể chỉnh sửa bên
                    dưới
                  </p>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="receiverName"
                      className="text-xs font-bold text-[#1A4331] uppercase tracking-wider"
                    >
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
                    <Label
                      htmlFor="phone"
                      className="text-xs font-bold text-[#1A4331] uppercase tracking-wider"
                    >
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
                    <Label
                      htmlFor="province"
                      className="text-xs font-bold text-[#1A4331] uppercase tracking-wider"
                    >
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
                    <Label
                      htmlFor="ward"
                      className="text-xs font-bold text-[#1A4331] uppercase tracking-wider"
                    >
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
                  <Label
                    htmlFor="detail"
                    className="text-xs font-bold text-[#1A4331] uppercase tracking-wider"
                  >
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

            {/* Payment method */}
            <div className="bg-white border-2 border-[#1A4331]/15">
              <div className="px-6 py-4 border-b-2 border-[#1A4331]/10">
                <h2 className="flex items-center gap-2 text-[#1A4331] font-bold text-sm uppercase tracking-wider">
                  <CreditCard className="h-4 w-4 text-[#8A9A7A]" /> Phương thức
                  thanh toán
                </h2>
              </div>
              <div className="p-6">
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={handlePaymentChange}
                  className="space-y-3"
                >
                  {/* COD option */}
                  <div
                    onClick={() => handlePaymentChange("COD")}
                    className={`flex items-start space-x-3 p-4 border-2 transition-all cursor-pointer ${formData.paymentMethod === "COD" ? "border-[#1A4331] bg-[#1A4331]/5" : "border-[#1A4331]/10 hover:border-[#1A4331]/30"}`}
                  >
                    <RadioGroupItem value="COD" id="COD" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="COD" className="flex items-center gap-2 cursor-pointer text-sm text-[#1A4331] font-bold">
                        <Truck className="h-4 w-4 text-[#8A9A7A] shrink-0" />
                        Thanh toán khi nhận hàng (COD)
                      </Label>
                      <p className="text-[11px] text-[#1A4331]/50 mt-1">Trả tiền mặt cho shipper khi nhận hàng.</p>
                    </div>
                  </div>

                  {/* BANKING / VietQR option */}
                  <div
                    onClick={() => handlePaymentChange("BANKING")}
                    className={`flex items-start space-x-3 p-4 border-2 transition-all cursor-pointer ${formData.paymentMethod === "BANKING" ? "border-[#1A4331] bg-[#1A4331]/5" : "border-[#1A4331]/10 hover:border-[#1A4331]/30"}`}
                  >
                    <RadioGroupItem value="BANKING" id="BANKING" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="BANKING" className="flex items-center gap-2 cursor-pointer text-sm text-[#1A4331] font-bold">
                        <QrCode className="h-4 w-4 text-[#8A9A7A] shrink-0" />
                        Chuyển khoản ngân hàng (VietQR)
                      </Label>
                      <p className="text-[11px] text-[#1A4331]/50 mt-1">Quét mã QR để thanh toán qua PayOS — hỗ trợ tất cả ngân hàng.</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Order summary sidebar */}
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
                  <span className="font-bold text-[#1A4331]">
                    {formatPrice(subtotal)}
                  </span>
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
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-4 w-4" />
                      {formData.paymentMethod === "BANKING" ? "Đang tạo link thanh toán..." : "Đang xử lý..."}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {formData.paymentMethod === "BANKING" ? (
                        <><QrCode className="h-4 w-4" /> Tiến hành thanh toán VietQR</>
                      ) : (
                        <><Truck className="h-4 w-4" /> Xác nhận Đặt hàng (COD)</>
                      )}
                    </span>
                  )}
                </Button>
                <p className="text-[10px] text-center text-[#8A9A7A] mt-2">
                  Bằng cách nhấn Đặt hàng, bạn đồng ý với Điều khoản dịch vụ
                  của Tea4Life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
