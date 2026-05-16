"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Store,
  AlertCircle,
  CheckCircle2,
  Package,
  Clock,
  X,
} from "lucide-react";
import { cn, handleError } from "@/lib/utils";
import {
  getMyStoresApi,
  getStoreOrdersApi,
  acceptStoreOrderApi,
  readyStoreOrderApi,
  cancelStoreOrderApi,
} from "@/services/orderApi";
import type { StoreResponse } from "@/types/store/StoreResponse";
import type { StoreOrderResponse, OrderStatus } from "@/types/order/OrderResponse";
import { toast } from "sonner";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  PREPARING: "Đang chuẩn bị",
  READY_FOR_DELIVERY: "Sẵn sàng giao",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

function getStatusStyle(status: OrderStatus) {
  switch (status) {
    case "COMPLETED":
      return "border-emerald-500 text-emerald-600";
    case "DELIVERING":
      return "border-blue-500 text-blue-600";
    case "PENDING":
      return "border-amber-500 text-amber-600";
    case "PREPARING":
      return "border-orange-500 text-orange-600";
    case "READY_FOR_DELIVERY":
      return "border-indigo-500 text-indigo-600";
    case "CANCELLED":
      return "border-red-500 text-red-600";
    default:
      return "border-gray-500 text-gray-600";
  }
}

export default function StoreOrdersPage() {
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [storesLoading, setStoresLoading] = useState(true);

  const [orders, setOrders] = useState<StoreOrderResponse[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchStores = async () => {
      setStoresLoading(true);
      try {
        const res = await getMyStoresApi();
        const data = res.data.data || [];
        setStores(data);
        if (data.length > 0) setSelectedStoreId(data[0].id);
      } catch (error) {
        handleError(error, "Không thể tải cửa hàng.");
      } finally {
        setStoresLoading(false);
      }
    };
    fetchStores();
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!selectedStoreId) return;
    setOrdersLoading(true);
    try {
      const res = await getStoreOrdersApi(selectedStoreId);
      setOrders(res.data.data || []);
    } catch (error) {
      handleError(error, "Không thể tải đơn hàng.");
    } finally {
      setOrdersLoading(false);
    }
  }, [selectedStoreId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleAccept = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      await acceptStoreOrderApi(selectedStoreId, orderId);
      toast.success("Đã xác nhận đơn hàng.");
      await fetchOrders();
    } catch (error) {
      handleError(error, "Không thể xác nhận.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReady = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      await readyStoreOrderApi(selectedStoreId, orderId);
      toast.success("Đã đánh dấu sẵn sàng giao.");
      await fetchOrders();
    } catch (error) {
      handleError(error, "Không thể đánh dấu sẵn sàng.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      await cancelStoreOrderApi(selectedStoreId, orderId);
      toast.success("Đã hủy đơn hàng.");
      await fetchOrders();
    } catch (error) {
      handleError(error, "Không thể hủy đơn hàng.");
    } finally {
      setActionLoadingId(null);
    }
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

  const canCancel = (status: OrderStatus) =>
    status !== "DELIVERING" && status !== "COMPLETED" && status !== "CANCELLED";

  const filteredOrders = useMemo(() => {
    return orders.filter((o) =>
      statusFilter === "all" ? true : o.status === statusFilter
    );
  }, [orders, statusFilter]);

  // Counts for tab-style filter
  const counts = useMemo(() => {
    const c = { PENDING: 0, PREPARING: 0, READY_FOR_DELIVERY: 0, total: 0 };
    for (const o of orders) {
      c.total++;
      if (o.status === "PENDING") c.PENDING++;
      if (o.status === "PREPARING") c.PREPARING++;
      if (o.status === "READY_FOR_DELIVERY") c.READY_FOR_DELIVERY++;
    }
    return c;
  }, [orders]);

  if (storesLoading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-emerald-600/60">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="font-medium">Đang tải...</span>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <Store className="h-12 w-12 text-slate-300" />
        <p className="font-bold text-lg">Bạn chưa được gán vào cửa hàng nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Đơn hàng</h1>
          <p className="text-sm text-slate-500 mt-1">
            Xử lý đơn hàng của cửa hàng
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Store selector */}
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger className="w-[240px] h-9 text-sm border-emerald-200">
              <div className="flex items-center gap-2">
                <Store className="h-3.5 w-3.5 text-emerald-600" />
                <SelectValue placeholder="Chọn cửa hàng" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {stores.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-9 text-sm border-slate-200">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ({counts.total})</SelectItem>
              <SelectItem value="PENDING">Chờ xác nhận ({counts.PENDING})</SelectItem>
              <SelectItem value="PREPARING">Đang chuẩn bị ({counts.PREPARING})</SelectItem>
              <SelectItem value="READY_FOR_DELIVERY">Sẵn sàng giao ({counts.READY_FOR_DELIVERY})</SelectItem>
              <SelectItem value="DELIVERING">Đang giao</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick stat pills */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <Clock className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-bold text-amber-700">{counts.PENDING}</span>
          <span className="text-xs text-amber-600">chờ xác nhận</span>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
          <Package className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-700">{counts.PREPARING}</span>
          <span className="text-xs text-orange-600">đang chuẩn bị</span>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-bold text-indigo-700">{counts.READY_FOR_DELIVERY}</span>
          <span className="text-xs text-indigo-600">sẵn sàng giao</span>
        </div>
      </div>

      {/* Orders table */}
      {!selectedStoreId ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Store className="h-10 w-10 text-slate-300" />
          <p className="font-medium">Vui lòng chọn cửa hàng.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {ordersLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-bold">{o.orderCode}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{o.receiverName}</p>
                          <p className="text-xs text-slate-400">{o.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[160px]">
                        <p className="text-xs text-slate-500 truncate">
                          {[o.detail, o.ward, o.province].filter((s) => s && s !== "-").join(", ")}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            o.paymentMethod === "COD"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {o.paymentMethod === "COD" ? "COD" : "Banking"}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat("vi-VN").format(o.finalPrice)}đ
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(getStatusStyle(o.status))}>
                          {STATUS_LABELS[o.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {formatDate(o.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {o.status === "PENDING" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              disabled={actionLoadingId === o.id}
                              onClick={() => handleAccept(o.id)}
                            >
                              {actionLoadingId === o.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              Xác nhận
                            </Button>
                          )}
                          {o.status === "PREPARING" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                              disabled={actionLoadingId === o.id}
                              onClick={() => handleReady(o.id)}
                            >
                              {actionLoadingId === o.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Package className="h-3.5 w-3.5" />
                              )}
                              Sẵn sàng giao
                            </Button>
                          )}
                          {canCancel(o.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                              disabled={actionLoadingId === o.id}
                              onClick={() => handleCancel(o.id)}
                            >
                              {actionLoadingId === o.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                              Hủy
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-20">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <AlertCircle className="h-8 w-8" />
                        <p>Không có đơn hàng nào.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
