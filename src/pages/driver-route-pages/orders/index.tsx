import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Clock, Loader2, Package, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getDriverAvailableOrdersApi,
  getDriverShippingOrdersApi,
} from "@/services/orderApi";
import type { DeliveryOrderResponse } from "@/types/order/OrderResponse";
import { handleError } from "@/lib/utils";

export default function DriverOrders() {
  const navigate = useNavigate();

  const [availableOrders, setAvailableOrders] = useState<DeliveryOrderResponse[]>([]);
  const [shippingOrders, setShippingOrders] = useState<DeliveryOrderResponse[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [loadingShipping, setLoadingShipping] = useState(true);

  const fetchAvailable = useCallback(async () => {
    try {
      setLoadingAvailable(true);
      const res = await getDriverAvailableOrdersApi();
      setAvailableOrders(res.data.data || []);
    } catch (error) {
      handleError(error, "Không thể tải đơn hàng sẵn sàng lấy.");
    } finally {
      setLoadingAvailable(false);
    }
  }, []);

  const fetchShipping = useCallback(async () => {
    try {
      setLoadingShipping(true);
      const res = await getDriverShippingOrdersApi();
      setShippingOrders(res.data.data || []);
    } catch (error) {
      handleError(error, "Không thể tải đơn hàng đang giao.");
    } finally {
      setLoadingShipping(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailable();
    fetchShipping();
  }, [fetchAvailable, fetchShipping]);

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return "Vừa xong";
      if (minutes < 60) return `${minutes} phút trước`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} giờ trước`;
      return `${Math.floor(hours / 24)} ngày trước`;
    } catch {
      return "";
    }
  };

  return (
    <div className="p-4 space-y-6">
      <header>
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
          Nhiệm vụ
        </h2>
        <p className="text-slate-400 text-xs font-bold uppercase">
          Quản lý lộ trình giao hàng
        </p>
      </header>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 rounded-2xl p-1 h-12">
          <TabsTrigger
            value="available"
            className="rounded-xl font-black text-xs uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Chờ lấy ({loadingAvailable ? "..." : availableOrders.length})
          </TabsTrigger>
          <TabsTrigger
            value="shipping"
            className="rounded-xl font-black text-xs uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Đang giao ({loadingShipping ? "..." : shippingOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6 space-y-4">
          {loadingAvailable ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : availableOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm font-bold">Không có đơn hàng nào cần lấy.</p>
            </div>
          ) : (
            availableOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                status="ready"
                timeAgo={formatTimeAgo(order.createdAt)}
                onClick={() => navigate(`/driver/orders/${order.id}`)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="shipping" className="mt-6 space-y-4">
          {loadingShipping ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : shippingOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm font-bold">Không có đơn hàng đang giao.</p>
            </div>
          ) : (
            shippingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                status="shipping"
                timeAgo={formatTimeAgo(order.createdAt)}
                onClick={() => navigate(`/driver/orders/${order.id}`)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component thẻ đơn hàng dùng nội bộ
function OrderCard({
  order,
  status,
  timeAgo,
  onClick,
}: {
  order: DeliveryOrderResponse;
  status: string;
  timeAgo: string;
  onClick: () => void;
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  return (
    <Card
      className="border-none shadow-md rounded-[2rem] bg-white overflow-hidden active:scale-95 transition-transform cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${status === "ready" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}
          >
            {status === "ready" ? "Sẵn sàng lấy" : "Đang vận chuyển"}
          </div>
          <span className="text-xs font-bold text-slate-300">
            {order.orderCode}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <p className="text-sm font-bold text-slate-700 line-clamp-1">
              {order.storeName || "Cửa hàng Tea4Life"}
              {order.storeAddress && (
                <span className="font-normal text-slate-400"> — {order.storeAddress}</span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            <p className="text-sm font-bold text-slate-700 line-clamp-1">
              {order.receiverName}
              <span className="font-normal text-slate-400">
                {" "}— {[order.detail, order.ward, order.province].filter((s) => s && s !== "-").join(", ")}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-slate-400">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span className="text-[10px] font-bold">{timeAgo}</span>
            </div>
            <div className="flex items-center gap-1">
              <Package size={14} />
              <span className="text-[10px] font-bold">
                {order.items?.length || 0} món · {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
          <ChevronRight size={18} />
        </div>
      </CardContent>
    </Card>
  );
}
