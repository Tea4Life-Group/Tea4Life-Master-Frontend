import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  Leaf,
  Loader2,
  Clock,
  Timer,
  X,
  AlertCircle,
} from "lucide-react";
import { getOrderByIdApi, cancelMyOrderApi } from "@/services/orderApi";
import type { OrderResponse, OrderStatus } from "@/types/order/OrderResponse";
import { handleError, getMediaUrl } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  PREPARING: "Đang chuẩn bị",
  READY_FOR_DELIVERY: "Sẵn sàng giao",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  PENDING: "Đơn hàng đang chờ cửa hàng xác nhận.",
  PREPARING: "Cửa hàng đang chuẩn bị đơn hàng của bạn.",
  READY_FOR_DELIVERY: "Đơn hàng đã sẵn sàng, đang chờ tài xế lấy hàng.",
  DELIVERING: "Tài xế đang trên đường giao hàng cho bạn.",
  COMPLETED: "Đơn hàng đã giao thành công. Cảm ơn bạn!",
  CANCELLED: "Đơn hàng đã bị hủy.",
};

const PAYMENT_LABELS: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng (COD)",
  BANKING: "Chuyển khoản ngân hàng",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chưa thanh toán",
  COMPLETED: "Đã thanh toán",
  CANCELED: "Đã hủy thanh toán",
};

function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="h-5 w-5 text-[#8A9A7A]" />;
    case "DELIVERING":
      return <Truck className="h-5 w-5 text-blue-500" />;
    case "PENDING":
      return <Clock className="h-5 w-5 text-[#D2A676]" />;
    case "PREPARING":
      return <Timer className="h-5 w-5 text-amber-500" />;
    case "READY_FOR_DELIVERY":
      return <Package className="h-5 w-5 text-indigo-500" />;
    case "CANCELLED":
      return <X className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
}

function getStatusBadgeClass(status: OrderStatus) {
  switch (status) {
    case "COMPLETED":
      return "bg-[#8A9A7A]/10 text-[#1A4331] border-[#8A9A7A]/30";
    case "DELIVERING":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PENDING":
      return "bg-[#D2A676]/10 text-[#D2A676] border-[#D2A676]/30";
    case "PREPARING":
      return "bg-amber-50 text-amber-600 border-amber-200";
    case "READY_FOR_DELIVERY":
      return "bg-indigo-50 text-indigo-600 border-indigo-200";
    case "CANCELLED":
      return "bg-red-50 text-red-600 border-red-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await getOrderByIdApi(id);
        setOrder(res.data.data);
      } catch (error) {
        handleError(error, "Không thể tải chi tiết đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!order) return;
    try {
      setCancelling(true);
      const res = await cancelMyOrderApi(order.id);
      setOrder(res.data.data);
      toast.success("Đã hủy đơn hàng thành công.");
    } catch (error) {
      handleError(error, "Không thể hủy đơn hàng.");
    } finally {
      setCancelling(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#1A4331]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex flex-col items-center justify-center gap-4 text-[#8A9A7A]">
        <AlertCircle className="h-12 w-12" />
        <p className="font-bold">Không tìm thấy đơn hàng.</p>
        <Link to="/order">
          <Button variant="outline" className="rounded-none border-[#1A4331]/20 text-[#1A4331]">
            Quay lại lịch sử
          </Button>
        </Link>
      </div>
    );
  }

  const fullAddress = [order.detail, order.ward, order.province]
    .filter((s) => s && s !== "-")
    .join(", ");

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

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        {/* Back Button */}
        <Link to="/order">
          <Button
            variant="ghost"
            className="mb-6 text-[#8A9A7A] hover:text-[#1A4331] hover:bg-[#8A9A7A]/10 rounded-none gap-2 font-bold text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại lịch sử đơn hàng
          </Button>
        </Link>

        {/* Header Info */}
        <div className="mb-10 border-b-2 border-[#1A4331]/10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-[#8A9A7A]" />
            <p className="text-[#8A9A7A] font-bold text-sm uppercase tracking-wider">
              Chi Tiết Đơn Hàng
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl pixel-text text-[#1A4331]">
                {order.orderCode}
              </h1>
              <p className="text-sm text-[#8A9A7A] mt-1">
                Ngày đặt: {formatDate(order.createdAt)}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1 border px-4 py-2 text-sm font-bold w-fit ${getStatusBadgeClass(order.status)}`}
            >
              {getStatusIcon(order.status)} {STATUS_LABELS[order.status]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border-2 border-[#1A4331]/15">
              <div className="px-6 py-4 border-b-2 border-[#1A4331]/10">
                <h2 className="flex items-center gap-2 text-[#1A4331] font-bold text-sm uppercase tracking-wider">
                  <Package className="h-4 w-4 text-[#8A9A7A]" /> Sản phẩm đã mua
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    {item.productImageUrl ? (
                      <img
                        src={getMediaUrl(item.productImageUrl)}
                        alt={item.productName}
                        className="h-20 w-20 object-cover border border-[#1A4331]/10"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-[#F8F5F0] border border-[#1A4331]/10 flex items-center justify-center">
                        <Package className="h-8 w-8 text-[#8A9A7A]/40" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-[#1A4331]">{item.productName}</h4>
                      {item.selectedOptions?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedOptions.map((opt) => (
                            <span
                              key={opt.productOptionValueId}
                              className="text-[10px] bg-[#F8F5F0] border border-[#1A4331]/10 px-2 py-0.5 text-[#1A4331]/70"
                            >
                              {opt.productOptionName}: {opt.productOptionValueName}
                              {opt.extraPrice > 0 && ` (+${formatPrice(opt.extraPrice)})`}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-[#8A9A7A] mt-1">
                        Số lượng: {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-bold text-[#1A4331]">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                ))}

                <div className="border-t-2 border-dashed border-[#1A4331]/15 pt-4 mt-6 space-y-2">
                  <div className="flex justify-between text-sm text-[#1A4331]/70">
                    <span>Tạm tính</span>
                    <span className="font-bold text-[#1A4331]">
                      {formatPrice(order.priceBeforeDiscount)}
                    </span>
                  </div>
                  {order.priceBeforeDiscount !== order.totalAmount && (
                    <div className="flex justify-between text-sm text-[#8A9A7A]">
                      <span>Giảm giá</span>
                      <span className="font-bold">
                        -{formatPrice(order.priceBeforeDiscount - order.totalAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-[#1A4331] pt-3 border-t border-[#1A4331]/10">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Info */}
            <div className="bg-white border-2 border-[#1A4331]/15">
              <div className="px-6 py-4 border-b-2 border-[#1A4331]/10">
                <h2 className="flex items-center gap-2 text-[#1A4331] font-bold text-sm uppercase tracking-wider">
                  <MapPin className="h-4 w-4 text-[#8A9A7A]" /> Thông tin nhận hàng
                </h2>
              </div>
              <div className="p-6 space-y-2 text-sm">
                <p className="font-bold text-[#1A4331]">
                  {order.receiverName}
                </p>
                <p className="text-[#1A4331]/70">{order.phone}</p>
                <p className="text-[#8A9A7A] mt-1">{fullAddress}</p>
                {order.storeName && (
                  <p className="text-xs text-[#1A4331]/50 mt-2">
                    Cửa hàng: {order.storeName}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white border-2 border-[#1A4331]/15">
              <div className="px-6 py-4 border-b-2 border-[#1A4331]/10">
                <h2 className="flex items-center gap-2 text-[#1A4331] font-bold text-sm uppercase tracking-wider">
                  <CreditCard className="h-4 w-4 text-[#8A9A7A]" /> Thanh toán
                </h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-[#1A4331]">
                  {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#8A9A7A]">
                  {order.paymentStatus === "COMPLETED" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {PAYMENT_STATUS_LABELS.COMPLETED}
                    </>
                  ) : order.paymentStatus === "CANCELED" ? (
                    <>
                      <X className="h-4 w-4 text-red-400" />
                      {PAYMENT_STATUS_LABELS.CANCELED}
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4" />
                      {PAYMENT_STATUS_LABELS.PENDING}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-[#1A4331] border-2 border-[#1A4331] text-[#F8F5F0] p-6">
              <div className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-[#8A9A7A]" />
                <div>
                  <p className="font-bold">{STATUS_LABELS[order.status]}</p>
                  <p className="text-xs text-[#F8F5F0]/60">
                    {STATUS_DESCRIPTIONS[order.status]}
                  </p>
                </div>
              </div>
            </div>

            {/* Cancel button for PENDING orders */}
            {order.status === "PENDING" && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full rounded-none border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
              >
                {cancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Hủy đơn hàng
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
