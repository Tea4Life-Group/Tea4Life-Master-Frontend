import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Eye,
  Search,
  Leaf,
  X,
  Loader2,
  XCircle,
  Package,
  Timer,
  AlertCircle,
} from "lucide-react";
import { getMyOrdersApi, cancelMyOrderApi } from "@/services/orderApi";
import type { OrderResponse, OrderStatus } from "@/types/order/OrderResponse";
import { handleError } from "@/lib/utils";
import { toast } from "sonner";

// Status label mapping
const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  PREPARING: "Đang chuẩn bị",
  READY_FOR_DELIVERY: "Sẵn sàng giao",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const getStatusBadge = (status: OrderStatus) => {
  const baseClass =
    "inline-flex items-center gap-1 px-3 py-1 text-xs font-bold border";
  switch (status) {
    case "COMPLETED":
      return (
        <span
          className={`${baseClass} bg-[#8A9A7A]/10 text-[#1A4331] border-[#8A9A7A]/30`}
        >
          <CheckCircle2 className="w-3 h-3" /> {STATUS_LABELS.COMPLETED}
        </span>
      );
    case "DELIVERING":
      return (
        <span
          className={`${baseClass} bg-blue-50 text-blue-700 border-blue-200`}
        >
          <Truck className="w-3 h-3" /> {STATUS_LABELS.DELIVERING}
        </span>
      );
    case "PENDING":
      return (
        <span
          className={`${baseClass} bg-[#D2A676]/10 text-[#D2A676] border-[#D2A676]/30`}
        >
          <Clock className="w-3 h-3" /> {STATUS_LABELS.PENDING}
        </span>
      );
    case "PREPARING":
      return (
        <span
          className={`${baseClass} bg-amber-50 text-amber-600 border-amber-200`}
        >
          <Timer className="w-3 h-3" /> {STATUS_LABELS.PREPARING}
        </span>
      );
    case "READY_FOR_DELIVERY":
      return (
        <span
          className={`${baseClass} bg-indigo-50 text-indigo-600 border-indigo-200`}
        >
          <Package className="w-3 h-3" /> {STATUS_LABELS.READY_FOR_DELIVERY}
        </span>
      );
    case "CANCELLED":
      return (
        <span className={`${baseClass} bg-red-50 text-red-600 border-red-200`}>
          <X className="w-3 h-3" /> {STATUS_LABELS.CANCELLED}
        </span>
      );
    default:
      return (
        <span
          className={`${baseClass} bg-gray-50 text-gray-600 border-gray-200`}
        >
          {status}
        </span>
      );
  }
};

export default function OrderPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyOrdersApi();
      setOrders(res.data.data || []);
    } catch (error) {
      handleError(error, "Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (id: string) => {
    try {
      setCancellingId(id);
      await cancelMyOrderApi(id);
      toast.success("Đã hủy đơn hàng thành công.");
      fetchOrders();
    } catch (error) {
      handleError(error, "Không thể hủy đơn hàng.");
    } finally {
      setCancellingId(null);
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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = order.orderCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

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
              Theo Dõi Đơn Hàng
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl pixel-text text-[#1A4331] flex items-center gap-3">
            <ShoppingBag className="h-7 w-7 text-[#8A9A7A]" />
            Lịch Sử Đơn Hàng
          </h1>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9A7A]" />
            <Input
              placeholder="Tìm mã đơn..."
              className="pl-10 border-2 border-[#1A4331]/20 bg-white rounded-none focus-visible:ring-0 focus-visible:border-[#1A4331] text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-2 border-[#1A4331]/20 bg-white text-[#1A4331] text-sm focus:ring-0 focus:ring-offset-0 rounded-none">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="border border-[#1A4331]/20 bg-[#F8F5F0] rounded-none shadow-lg">
              <SelectItem
                value="all"
                className="text-sm text-[#1A4331] focus:bg-[#8A9A7A] focus:text-[#F8F5F0] rounded-none cursor-pointer"
              >
                Tất cả trạng thái
              </SelectItem>
              <SelectItem
                value="PENDING"
                className="text-sm text-[#1A4331] focus:bg-[#8A9A7A] focus:text-[#F8F5F0] rounded-none cursor-pointer"
              >
                Chờ xác nhận
              </SelectItem>
              <SelectItem
                value="PREPARING"
                className="text-sm text-[#1A4331] focus:bg-[#8A9A7A] focus:text-[#F8F5F0] rounded-none cursor-pointer"
              >
                Đang chuẩn bị
              </SelectItem>
              <SelectItem
                value="READY_FOR_DELIVERY"
                className="text-sm text-[#1A4331] focus:bg-[#8A9A7A] focus:text-[#F8F5F0] rounded-none cursor-pointer"
              >
                Sẵn sàng giao
              </SelectItem>
              <SelectItem
                value="DELIVERING"
                className="text-sm text-[#1A4331] focus:bg-[#8A9A7A] focus:text-[#F8F5F0] rounded-none cursor-pointer"
              >
                Đang giao
              </SelectItem>
              <SelectItem
                value="COMPLETED"
                className="text-sm text-[#1A4331] focus:bg-[#8A9A7A] focus:text-[#F8F5F0] rounded-none cursor-pointer"
              >
                Hoàn thành
              </SelectItem>
              <SelectItem
                value="CANCELLED"
                className="text-sm text-[#1A4331] focus:bg-[#8A9A7A] focus:text-[#F8F5F0] rounded-none cursor-pointer"
              >
                Đã hủy
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <div className="bg-white border-2 border-[#1A4331]/15 overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-[#1A4331]/10 flex items-center justify-between">
            <h2 className="text-[#1A4331] font-bold text-sm uppercase tracking-wider">
              Danh sách đơn hàng
            </h2>
            {(searchTerm || statusFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-none"
              >
                Đặt lại bộ lọc
              </Button>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#1A4331]" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#F8F5F0]">
                <TableRow className="hover:bg-transparent border-[#1A4331]/10">
                  <TableHead className="font-bold text-[#1A4331] text-center text-xs uppercase tracking-wider">
                    Mã đơn
                  </TableHead>
                  <TableHead className="font-bold text-[#1A4331] text-center text-xs uppercase tracking-wider">
                    Ngày đặt
                  </TableHead>
                  <TableHead className="font-bold text-[#1A4331] text-center text-xs uppercase tracking-wider">
                    Số lượng
                  </TableHead>
                  <TableHead className="font-bold text-[#1A4331] text-center text-xs uppercase tracking-wider">
                    Trạng thái
                  </TableHead>
                  <TableHead className="font-bold text-[#1A4331] text-center text-xs uppercase tracking-wider">
                    Tổng tiền
                  </TableHead>
                  <TableHead className="font-bold text-[#1A4331] text-center text-xs uppercase tracking-wider">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-[#1A4331]/10 hover:bg-[#F8F5F0]/50 transition-colors"
                    >
                      <TableCell className="font-bold text-[#1A4331] text-center text-sm">
                        {order.orderCode}
                      </TableCell>
                      <TableCell className="text-[#1A4331]/70 text-center text-sm">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-center text-[#1A4331]/70 text-sm">
                        {order.items?.length || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="font-bold text-[#1A4331] text-center text-sm">
                        {formatPrice(order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link to={`/order/${order.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#8A9A7A] hover:text-[#1A4331] hover:bg-[#8A9A7A]/10 rounded-none gap-1 text-xs font-bold"
                            >
                              <Eye className="h-4 w-4" />
                              Chi tiết
                            </Button>
                          </Link>
                          {order.status === "PENDING" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={cancellingId === order.id}
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-none gap-1 text-xs font-bold"
                            >
                              {cancellingId === order.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
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
                    <TableCell
                      colSpan={6}
                      className="text-center py-20"
                    >
                      <div className="flex flex-col items-center gap-2 text-[#8A9A7A]">
                        <AlertCircle className="h-8 w-8" />
                        <p>Không tìm thấy đơn hàng nào.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
