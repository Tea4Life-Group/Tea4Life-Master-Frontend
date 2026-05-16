import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Activity,
} from "lucide-react";

// ============================
// Mock data cho dashboard
// ============================
const stats = [
  {
    label: "Tổng doanh thu",
    value: "45.280.000đ",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
    iconBg: "bg-emerald-500",
    iconShadow: "shadow-emerald-500/25",
    description: "So với tháng trước",
  },
  {
    label: "Đơn hàng",
    value: "128",
    change: "+8.2%",
    trend: "up" as const,
    icon: ShoppingBag,
    iconBg: "bg-blue-500",
    iconShadow: "shadow-blue-500/25",
    description: "Trong tháng này",
  },
  {
    label: "Khách hàng mới",
    value: "42",
    change: "+18.7%",
    trend: "up" as const,
    icon: Users,
    iconBg: "bg-violet-500",
    iconShadow: "shadow-violet-500/25",
    description: "Đăng ký mới",
  },
  {
    label: "Tỉ lệ hoàn thành",
    value: "94.2%",
    change: "-1.4%",
    trend: "down" as const,
    icon: TrendingUp,
    iconBg: "bg-amber-500",
    iconShadow: "shadow-amber-500/25",
    description: "Đơn hàng thành công",
  },
];

const recentOrders = [
  {
    id: "#ORD-2841",
    customer: "Nguyễn Văn An",
    product: "Trà Oolong Cao Sơn",
    amount: "320.000đ",
    status: "Đã giao",
    date: "Hôm nay, 14:30",
  },
  {
    id: "#ORD-2840",
    customer: "Trần Thị Lan",
    product: "Trà Sen Tây Hồ",
    amount: "450.000đ",
    status: "Đang giao",
    date: "Hôm nay, 11:15",
  },
  {
    id: "#ORD-2839",
    customer: "Lê Minh Tâm",
    product: "Trà Lài Premium",
    amount: "180.000đ",
    status: "Đang xử lý",
    date: "Hôm qua, 20:45",
  },
  {
    id: "#ORD-2838",
    customer: "Phạm Hoàng Anh",
    product: "Bộ trà Tứ Quý",
    amount: "1.200.000đ",
    status: "Đã giao",
    date: "Hôm qua, 16:20",
  },
  {
    id: "#ORD-2837",
    customer: "Vũ Thị Mai",
    product: "Trà Thái Nguyên",
    amount: "95.000đ",
    status: "Đã hủy",
    date: "Hôm qua, 09:10",
  },
];

const topProducts = [
  { name: "Trà Oolong Cao Sơn", sold: 156, revenue: "49.9M", trend: "+23%" },
  { name: "Trà Sen Tây Hồ", sold: 134, revenue: "60.3M", trend: "+15%" },
  { name: "Trà Lài Premium", sold: 98, revenue: "17.6M", trend: "+8%" },
  { name: "Bộ trà Tứ Quý", sold: 45, revenue: "54.0M", trend: "+31%" },
  { name: "Trà Thái Nguyên", sold: 210, revenue: "19.9M", trend: "+5%" },
];

// Dữ liệu biểu đồ giả lập (7 ngày)
const chartData = [
  { day: "T2", value: 4200000, orders: 18 },
  { day: "T3", value: 3800000, orders: 15 },
  { day: "T4", value: 5100000, orders: 22 },
  { day: "T5", value: 4700000, orders: 20 },
  { day: "T6", value: 6300000, orders: 28 },
  { day: "T7", value: 7800000, orders: 35 },
  { day: "CN", value: 5400000, orders: 24 },
];

const maxChartValue = Math.max(...chartData.map((d) => d.value));

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  "Đã giao": { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  "Đang giao": { icon: Truck, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  "Đang xử lý": { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  "Đã hủy": { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200" },
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dữ liệu cập nhật lần cuối: Hôm nay, 22:00 · Tháng 03/2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs rounded-lg">
            <Activity className="h-3.5 w-3.5 mr-1.5" />
            Xem báo cáo chi tiết
          </Button>
        </div>
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("p-2.5 rounded-xl shadow-lg", s.iconBg, s.iconShadow)}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full",
                      s.trend === "up"
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-red-700 bg-red-50"
                    )}
                  >
                    {s.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {s.change}
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-800 tracking-tight">
                  {s.value}
                </div>
                <p className="text-xs text-slate-500 mt-1">{s.description}</p>
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
                  Tổng: 37.300.000đ · TB: 5.3M/ngày
                </p>
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-xs">
                +18.3% vs tuần trước
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Simple CSS Bar Chart */}
            <div className="flex items-end gap-3 h-48">
              {chartData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-medium text-slate-500">
                    {(d.value / 1000000).toFixed(1)}M
                  </span>
                  <div className="w-full relative group">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md transition-all duration-500 hover:from-emerald-600 hover:to-emerald-500 cursor-pointer"
                      style={{
                        height: `${(d.value / maxChartValue) * 140}px`,
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
                      {product.revenue}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">
                      {product.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
                5 đơn hàng mới nhất trong hệ thống
              </p>
            </div>
            <Button variant="outline" size="sm" className="text-xs rounded-lg">
              Xem tất cả
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
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
                const config = statusConfig[order.status] || statusConfig["Đang xử lý"];
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
                      {order.amount}
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
                      {order.date}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg hover:bg-emerald-50 hover:text-emerald-600 h-8 w-8 p-0"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 5. Quick Stats Footer */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Đơn chờ xử lý", value: "12", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
          { label: "Đang giao hàng", value: "8", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          { label: "Hoàn thành hôm nay", value: "23", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Đã hủy hôm nay", value: "2", color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
        ].map((item) => (
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
