import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Phone,
  Navigation,
  ArrowLeft,
  PackageCheck,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDriverOrderByIdApi,
  pickupDriverOrderApi,
  completeDriverOrderApi,
} from "@/services/orderApi";
import type { DeliveryOrderResponse } from "@/types/order/OrderResponse";
import { handleError } from "@/lib/utils";
import { toast } from "sonner";

export default function DriverOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState<DeliveryOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await getDriverOrderByIdApi(id);
        setOrder(res.data.data);
      } catch (error) {
        handleError(error, "Không thể tải chi tiết vận đơn.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handlePickup = async () => {
    if (!order) return;
    try {
      setActionLoading(true);
      const res = await pickupDriverOrderApi(order.id);
      setOrder(res.data.data);
      toast.success("Đã xác nhận lấy hàng!");
    } catch (error: unknown) {
      // Handle race condition: another driver already claimed this order
      const axiosErr = error as { response?: { status?: number } };
      if (axiosErr?.response?.status === 409) {
        toast.error("Đơn hàng đã được tài xế khác nhận.");
        navigate(-1);
      } else {
        handleError(error, "Không thể xác nhận lấy hàng.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!order) return;
    try {
      setActionLoading(true);
      const res = await completeDriverOrderApi(order.id);
      setOrder(res.data.data);
      toast.success("Đã hoàn thành giao hàng!");
    } catch (error) {
      handleError(error, "Không thể hoàn thành đơn hàng.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-400">
        <AlertCircle className="h-12 w-12" />
        <p className="font-bold">Không tìm thấy vận đơn.</p>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    );
  }

  const deliveryAddress = [order.detail, order.ward, order.province]
    .filter((s) => s && s !== "-")
    .join(", ");

  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Top Header */}
      <div className="p-4 flex items-center gap-4 bg-white border-b sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="font-black text-slate-800 uppercase text-sm tracking-tight">
          Chi tiết vận đơn {order.orderCode}
        </h2>
      </div>

      <div className="p-4 space-y-4 pb-32">
        {/* Card khách hàng */}
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                <User className="text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  Khách nhận hàng
                </p>
                <p className="font-bold text-slate-800">{order.receiverName}</p>
              </div>
            </div>
            <a href={`tel:${order.phone}`}>
              <Button
                size="icon"
                className="rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none shadow-none"
              >
                <Phone size={20} />
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Lộ trình */}
        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardContent className="p-6 relative">
            {/* Đường gạch nối lộ trình */}
            <div className="absolute left-[31px] top-[50px] bottom-[50px] w-[2px] bg-slate-100 border-dashed border-l-2" />

            <div className="space-y-8">
              <div className="flex gap-4 relative z-10">
                <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-emerald-100">
                  <MapPin size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">
                    Điểm lấy hàng
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {order.storeName || "Cửa hàng Tea4Life"}
                  </p>
                  {order.storeAddress && (
                    <p className="text-xs text-slate-400">
                      {order.storeAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 relative z-10">
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
                  <Navigation size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">
                    Điểm giao hàng
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {order.receiverName}
                  </p>
                  <p className="text-xs text-slate-400">{deliveryAddress}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment info */}
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote size={16} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  Thanh toán
                </span>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                order.paymentMethod === "COD"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-blue-50 text-blue-600"
              }`}>
                {order.paymentMethod === "COD" ? "Thu tiền mặt" : "Đã chuyển khoản"}
              </span>
            </div>
            <p className="text-lg font-black text-slate-800 mt-2">
              {formatPrice(order.totalAmount)}
            </p>
          </CardContent>
        </Card>

        {/* Danh sách món */}
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-5 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">
              Kiểm tra đơn hàng ({totalItems} món)
            </p>
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm font-bold">
                <span className="text-slate-600">
                  {item.quantity}x {item.productName}
                </span>
                <span>{formatPrice(item.subTotal)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Completed status */}
        {order.status === "COMPLETED" && (
          <Card className="border-none shadow-sm rounded-3xl bg-emerald-50">
            <CardContent className="p-5 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="font-black text-emerald-700 text-sm">Đã hoàn thành</p>
                <p className="text-xs text-emerald-600/70">Đơn hàng đã giao thành công.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Nút hành động nổi (Floating Action Button) */}
      {order.status === "READY_FOR_DELIVERY" && (
        <div className="fixed bottom-20 left-0 right-0 p-4 max-w-md mx-auto z-20">
          <Button
            className="w-full h-16 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black text-base shadow-2xl transition-all active:scale-95 gap-3"
            onClick={handlePickup}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <PackageCheck size={24} />
                XÁC NHẬN ĐÃ LẤY HÀNG
              </>
            )}
          </Button>
        </div>
      )}

      {order.status === "DELIVERING" && (
        <div className="fixed bottom-20 left-0 right-0 p-4 max-w-md mx-auto z-20">
          <Button
            className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base shadow-2xl transition-all active:scale-95 gap-3"
            onClick={handleComplete}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={24} />
                XÁC NHẬN ĐÃ GIAO HÀNG
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
