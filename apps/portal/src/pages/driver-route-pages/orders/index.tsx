"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, AlertCircle, ArrowRight, Truck } from "lucide-react";
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nhiệm vụ</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý lộ trình giao hàng
          </p>
        </div>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="available" className="gap-2">
            <Package className="h-4 w-4" />
            Chờ lấy ({loadingAvailable ? "..." : availableOrders.length})
          </TabsTrigger>
          <TabsTrigger value="shipping" className="gap-2">
            <Truck className="h-4 w-4" />
            Đang giao ({loadingShipping ? "..." : shippingOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {loadingAvailable ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : availableOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <AlertCircle className="h-10 w-10 text-slate-300" />
                <p className="font-medium text-sm">Không có đơn hàng nào cần lấy.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Cửa hàng</TableHead>
                    <TableHead>Điểm giao</TableHead>
                    <TableHead>Thu hộ</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-bold">{o.orderCode}</TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-800">{o.storeName}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">
                          {o.storeAddress}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-800">{o.receiverName}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">
                          {[o.detail, o.ward, o.province]
                            .filter((s) => s && s !== "-")
                            .join(", ")}
                        </p>
                      </TableCell>
                      <TableCell>
                        {o.paymentMethod === "COD" ? (
                          <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                            {new Intl.NumberFormat("vi-VN").format(o.totalAmount)}đ
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                            Đã thanh toán
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatTimeAgo(o.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="gap-2 bg-slate-900 hover:bg-slate-800 text-white"
                          onClick={() => navigate(`/app/drivers/orders/${o.id}`)}
                        >
                          Chi tiết
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {loadingShipping ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : shippingOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <AlertCircle className="h-10 w-10 text-slate-300" />
                <p className="font-medium text-sm">Bạn chưa nhận giao đơn nào.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Điểm giao</TableHead>
                    <TableHead>Thanh toán</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shippingOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-bold">{o.orderCode}</TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-800">{o.receiverName}</p>
                        <p className="text-xs text-slate-500">{o.phone}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-slate-500 truncate max-w-[250px]">
                          {[o.detail, o.ward, o.province]
                            .filter((s) => s && s !== "-")
                            .join(", ")}
                        </p>
                      </TableCell>
                      <TableCell>
                        {o.paymentMethod === "COD" ? (
                          <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                            Thu {new Intl.NumberFormat("vi-VN").format(o.totalAmount)}đ
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                            Không thu tiền
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatTimeAgo(o.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => navigate(`/app/drivers/orders/${o.id}`)}
                        >
                          Cập nhật
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
