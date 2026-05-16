"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { ShoppingCart, Loader2, AlertCircle, Store } from "lucide-react";
import { cn, handleError } from "@/lib/utils";
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import {
  getMyStoresApi,
  getStoreOrdersApi,
  acceptStoreOrderApi,
  readyStoreOrderApi,
  cancelStoreOrderApi,
} from "@/services/orderApi";
import type { StoreOrderResponse, OrderStatus } from "@/types/order/OrderResponse";
import type { StoreResponse } from "@/types/store/StoreResponse";
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

export default function AdminOrdersPage() {
  // Store selector
  const [myStores, setMyStores] = useState<StoreResponse[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [storesLoading, setStoresLoading] = useState(true);

  // Orders
  const [orders, setOrders] = useState<StoreOrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch user's stores
  useEffect(() => {
    const fetchStores = async () => {
      setStoresLoading(true);
      try {
        const res = await getMyStoresApi();
        const stores = res.data.data || [];
        setMyStores(stores);
        if (stores.length === 1) {
          setSelectedStoreId(stores[0].id);
        }
      } catch (error) {
        handleError(error, "Không thể tải danh sách cửa hàng.");
      } finally {
        setStoresLoading(false);
      }
    };
    fetchStores();
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!selectedStoreId) return;
    setLoading(true);
    try {
      const res = await getStoreOrdersApi(selectedStoreId);
      setOrders(res.data.data || []);
    } catch (error) {
      handleError(error, "Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
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
      fetchOrders();
    } catch (error) {
      handleError(error, "Không thể xác nhận đơn hàng.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReady = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      await readyStoreOrderApi(selectedStoreId, orderId);
      toast.success("Đã đánh dấu sẵn sàng giao.");
      fetchOrders();
    } catch (error) {
      handleError(error, "Không thể đánh dấu sẵn sàng giao.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      await cancelStoreOrderApi(selectedStoreId, orderId);
      toast.success("Đã hủy đơn hàng.");
      fetchOrders();
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
    return orders.filter((o) => {
      const matchesSearch =
        o.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.receiverName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Store selector UI
  if (storesLoading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-emerald-600/60">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="font-medium">Đang tải cửa hàng...</span>
      </div>
    );
  }

  if (myStores.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <AdminPageHeader
          icon={ShoppingCart}
          title="Đơn hàng cửa hàng"
          description="Xử lý và theo dõi đơn hàng của cửa hàng."
        />
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Store className="h-12 w-12 text-slate-300" />
          <p className="font-medium text-lg">Bạn chưa được gán vào cửa hàng nào.</p>
          <p className="text-sm">Liên hệ admin để được gán vào cửa hàng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader
        icon={ShoppingCart}
        title="Đơn hàng cửa hàng"
        description="Xử lý và theo dõi đơn hàng của cửa hàng."
        searchPlaceholder="Tìm mã đơn hoặc tên khách..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        actions={
          <div className="flex items-center gap-2">
            {/* Store selector */}
            {myStores.length > 1 && (
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger className="w-[220px] h-9 text-sm border-emerald-200">
                  <div className="flex items-center gap-2">
                    <Store className="h-3.5 w-3.5 text-emerald-600" />
                    <SelectValue placeholder="Chọn cửa hàng" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {myStores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] h-9 text-sm border-slate-200">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                <SelectItem value="PREPARING">Đang chuẩn bị</SelectItem>
                <SelectItem value="READY_FOR_DELIVERY">Sẵn sàng giao</SelectItem>
                <SelectItem value="DELIVERING">Đang giao</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Store name indicator for single store */}
      {myStores.length === 1 && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700">
          <Store className="h-4 w-4 shrink-0" />
          <span className="font-medium">{myStores[0].name}</span>
          <span className="text-emerald-600/60">— {myStores[0].address}</span>
        </div>
      )}

      {!selectedStoreId ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Store className="h-10 w-10 text-slate-300" />
          <p className="font-medium">Vui lòng chọn cửa hàng để xem đơn hàng.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
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
                      <TableCell>{formatDate(o.createdAt)}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("vi-VN").format(o.finalPrice)}đ
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(getStatusStyle(o.status))}
                        >
                          {STATUS_LABELS[o.status] || o.status}
                        </Badge>
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
                              ) : null}
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
                              ) : null}
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
                              ) : null}
                              Hủy
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
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
