import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Activity,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAdminDashboardApi } from "@/services/admin/dashboardAdminApi";
import type { DashboardResponse } from "@/types/dashboard/DashboardResponse";

// ============================
// Helpers
// ============================

/** Format số tiền VND: 1234567 → "1.234.567đ" */
function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

/** Format rút gọn số tiền: 330000 → "330K", 49900000 → "49.9M" */
function formatShortVND(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return value.toString();
}

/** Format ISO datetime → "Hôm nay, HH:mm" hoặc "DD/MM, HH:mm" */
function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return `Hôm nay, ${timeStr}`;
  if (isYesterday) return `Hôm qua, ${timeStr}`;
  return `${date.getDate()}/${date.getMonth() + 1}, ${timeStr}`;
}

/** Format trung bình mỗi ngày → rút gọn */
function formatAvgPerDay(value: number): string {
  return formatShortVND(value) + "/ngày";
}

// ============================
// Status config
// ============================
const statusConfig: Record<
  string,
  { icon: typeof CheckCircle2; color: string; bg: string }
> = {
  "Đã giao": {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  "Đang giao": {
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  "Đang xử lý": {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  "Đã hủy": {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
  },
};

// ============================
// Stat card icons config
// ============================
const statIconConfig = [
  {
    key: "totalRevenue" as const,
    label: "Tổng doanh thu",
    icon: DollarSign,
    iconBg: "bg-emerald-500",
    iconShadow: "shadow-emerald-500/25",
    formatValue: (v: number) => formatVND(v),
  },
  {
    key: "totalOrders" as const,
    label: "Đơn hàng",
    icon: ShoppingBag,
    iconBg: "bg-blue-500",
    iconShadow: "shadow-blue-500/25",
    formatValue: (v: number) => v.toLocaleString("vi-VN"),
  },
  {
    key: "newCustomers" as const,
    label: "Khách hàng mới",
    icon: Users,
    iconBg: "bg-violet-500",
    iconShadow: "shadow-violet-500/25",
    formatValue: (v: number) => v.toLocaleString("vi-VN"),
  },
  {
    key: "completionRate" as const,
    label: "Tỉ lệ hoàn thành",
    icon: TrendingUp,
    iconBg: "bg-amber-500",
    iconShadow: "shadow-amber-500/25",
    formatValue: (v: number) => v.toFixed(1) + "%",
  },
];

// ============================
// Loading Skeleton
// ============================
function SkeletonCard() {
  return (
    <Card className="border border-slate-200/60 shadow-sm bg-white animate-pulse">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-slate-200" />
          <div className="h-6 w-16 rounded-full bg-slate-200" />
        </div>
        <div className="h-8 w-28 rounded bg-slate-200 mb-2" />
        <div className="h-4 w-20 rounded bg-slate-100" />
      </CardContent>
    </Card>
  );
}

// ============================
// Error State
// ============================
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <div>
        <p className="font-semibold text-slate-700">
          Không thể tải dữ liệu dashboard
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Kiểm tra kết nối máy chủ hoặc thử lại.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry} className="rounded-lg">
        Thử lại
      </Button>
    </div>
  );
}

// ============================
// Cache
// ============================
let cachedData: DashboardResponse | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// ============================
// Main Component
// ============================
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(cachedData);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState(false);

  const fetchDashboard = async (force = false) => {
    // Check cache nếu không bắt buộc tải mới
    if (!force && cachedData && Date.now() - lastFetchTime < CACHE_DURATION) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    if (!cachedData || force) {
      setLoading(true);
    }
    setError(false);
    
    try {
      const res = await getAdminDashboardApi();
      const newData = res.data.data;
      setData(newData);
      
      // Update cache
      cachedData = newData;
      lastFetchTime = Date.now();
    } catch (err) {
      console.error("[Tea4Life] Dashboard fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ---- Loading ----
  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-52 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-64 rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="h-8 w-36 rounded-lg bg-slate-200 animate-pulse" />
        </div>
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        {/* Chart skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 border border-slate-200/60 shadow-sm bg-white animate-pulse">
            <CardContent className="p-6">
              <div className="h-48 rounded-lg bg-slate-100" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 border border-slate-200/60 shadow-sm bg-white animate-pulse">
            <CardContent className="p-6 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 rounded-xl bg-slate-100" />
              ))}
            </CardContent>
          </Card>
        </div>
        {/* Center loading indicator */}
        <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  // ---- Error ----
  if (error || !data) {
    return <ErrorState onRetry={fetchDashboard} />;
  }

  // ---- Computed values ----
  const { generalStats, revenueChart, topProducts, recentOrders, quickStats } = data;
  const chartData = revenueChart.chartData ?? [];
  const maxChartValue = Math.max(...chartData.map((d) => d.value), 1);

  const quickStatsItems = [
    {
      label: "Đơn chờ xử lý",
      value: quickStats.pending,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "Đang giao hàng",
      value: quickStats.shipping,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Hoàn thành hôm nay",
      value: quickStats.completed,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Đã hủy hôm nay",
      value: quickStats.cancelled,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dữ liệu cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-lg"
            onClick={() => navigate("/app/admin/reports")}
          >
            <Activity className="h-3.5 w-3.5 mr-1.5" />
            Xem báo cáo chi tiết
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-lg"
            onClick={() => fetchDashboard(true)}
          >
            <Activity className="h-3.5 w-3.5 mr-1.5" />
            Làm mới dữ liệu
          </Button>
        </div>
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statIconConfig.map((cfg) => {
          const statItem = generalStats[cfg.key];
          const Icon = cfg.icon;
          return (
            <Card
              key={cfg.key}
              className="border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={cn(
                      "p-2.5 rounded-xl shadow-lg",
                      cfg.iconBg,
                      cfg.iconShadow
                    )}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  {/* Đã ẩn phần % tăng giảm theo yêu cầu */}
                </div>
                <div className="text-2xl font-bold text-slate-800 tracking-tight">
                  {cfg.formatValue(statItem.value)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {statItem.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 3. Charts + Top Products Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Revenue Chart - 3 columns */}
        <Card className="lg:col-span-3 border border-slate-200/60 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-800">
                  Doanh thu 7 ngày qua
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng: {formatVND(revenueChart.summary.totalRevenue7Days)} ·
                  TB: {formatAvgPerDay(revenueChart.summary.averagePerDay)}
                </p>
              </div>
              {/* Đã ẩn phần badge so sánh tuần trước */}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                Chưa có dữ liệu doanh thu
              </div>
            ) : (
              <div className="flex items-end gap-3 h-48">
                {chartData.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-medium text-slate-500">
                      {(d.value / 1_000_000).toFixed(1)}M
                    </span>
                    <div className="w-full relative group">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md transition-all duration-500 hover:from-emerald-600 hover:to-emerald-500 cursor-pointer"
                        style={{
                          height: `${(d.value / maxChartValue) * 140}px`,
                          minHeight: "4px",
                        }}
                      />
                      {/* Tooltip */}
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-10">
                        <div className="font-semibold">
                          {new Intl.NumberFormat("vi-VN").format(d.value)}đ
                        </div>
                        <div className="text-slate-300">{d.orders} đơn hàng</div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {d.day}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products - 2 columns */}
        <Card className="lg:col-span-2 border border-slate-200/60 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800">
                Sản phẩm bán chạy
              </CardTitle>
              <Package className="h-4 w-4 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {topProducts.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                Chưa có dữ liệu
              </div>
            ) : (
              <div className="space-y-2">
                {topProducts.map((product, i) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-emerald-700 text-[11px] font-bold border border-emerald-200/60 shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-700 truncate">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {product.sold} đã bán
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-slate-700">
                        {formatShortVND(product.revenue)}
                      </p>
                      {/* Đã ẩn trend % */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. Recent Orders Table */}
      <Card className="border border-slate-200/60 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Đơn hàng gần đây
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                {recentOrders.length} đơn hàng mới nhất trong hệ thống
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs rounded-lg"
              onClick={() => navigate("/app/admin/orders")}
            >
              Xem tất cả
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {recentOrders.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-slate-400 text-sm">
              Chưa có đơn hàng nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Mã đơn
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Khách hàng
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    Sản phẩm
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Thành tiền
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                    Thời gian
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => {
                  const config =
                    statusConfig[order.status] ?? statusConfig["Đang xử lý"];
                  const StatusIcon = config.icon;
                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-slate-50/50 border-slate-100"
                    >
                      <TableCell className="font-semibold text-sm text-slate-800">
                        {order.id}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {order.customer}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 hidden md:table-cell">
                        {order.product}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-800">
                        {formatVND(order.amount)}
                      </TableCell>
                      <TableCell>
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                            config.bg,
                            config.color
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {order.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 hidden sm:table-cell">
                        {formatOrderDate(order.date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg hover:bg-emerald-50 hover:text-emerald-600 h-8 w-8 p-0"
                          onClick={() => navigate(`/app/admin/orders`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 5. Quick Stats Footer */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStatsItems.map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl border",
              item.bg,
              item.border
            )}
          >
            <div className={cn("text-3xl font-bold", item.color)}>
              {item.value}
            </div>
            <p className="text-xs font-medium text-slate-600 leading-tight">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
