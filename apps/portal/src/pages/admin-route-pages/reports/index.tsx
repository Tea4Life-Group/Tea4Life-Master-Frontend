import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  ShoppingBag,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  getReportSummaryApi,
  getReportChartApi,
  exportReportApi,
  type ReportPeriod,
  type ReportSummary,
  type ReportChartPoint,
} from "@/services/admin/reportsAdminApi";

// ============================
// Helpers
// ============================

function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function formatShortVND(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return value.toString();
}

// ============================
// Custom Tooltip for Recharts
// ============================
interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-slate-800 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl space-y-1 min-w-[140px]">
      <p className="font-semibold text-slate-200 mb-1">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: item.color }}
            />
            {item.name}
          </span>
          <span className="font-medium">
            {item.name === "Đơn hàng"
              ? item.value
              : formatVND(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================
// Period Label
// ============================
const periodLabels: Record<ReportPeriod, string> = {
  "7days": "7 ngày qua",
  "30days": "30 ngày qua",
  year: "Năm nay",
};

// ============================
// Main Component
// ============================
export default function AdminReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("7days");

  // Summary state
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState(false);

  // Chart state
  const [chartData, setChartData] = useState<ReportChartPoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [errorChart, setErrorChart] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);

  // ---- Fetch summary ----
  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingSummary(true);
      setErrorSummary(false);
      try {
        const res = await getReportSummaryApi();
        setSummary(res.data.data);
      } catch {
        setErrorSummary(true);
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchSummary();
  }, []);

  // ---- Fetch chart (re-runs when period changes) ----
  const fetchChart = useCallback(async (p: ReportPeriod) => {
    setLoadingChart(true);
    setErrorChart(false);
    try {
      const res = await getReportChartApi(p);
      setChartData(res.data.data || []);
    } catch {
      setErrorChart(true);
    } finally {
      setLoadingChart(false);
    }
  }, []);

  useEffect(() => {
    fetchChart(period);
  }, [period, fetchChart]);

  // ---- Export Excel ----
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportReportApi(period);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bao-cao-doanh-thu.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // silent: user sees button return to normal state
    } finally {
      setExporting(false);
    }
  };

  // ============================
  // Summary cards config
  // ============================
  const summaryCards = summary
    ? [
        {
          title: "Tổng doanh thu",
          value: formatVND(summary.totalProfit.value),
          change: summary.totalProfit.change,
          trend: summary.totalProfit.trend,
          highlight: true,
        },
        {
          title: "Giá trị đơn trung bình",
          value: formatVND(summary.averageOrderValue.value),
          change: summary.averageOrderValue.change,
          trend: summary.averageOrderValue.trend,
          highlight: false,
          icon: ShoppingBag,
        },
        {
          title: "Tổng đơn hàng",
          value: summary.totalOrders.value.toLocaleString("vi-VN"),
          change: summary.totalOrders.change,
          trend: summary.totalOrders.trend,
          highlight: false,
          icon: ShoppingBag,
        },
      ]
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Page Header */}
      <AdminPageHeader
        icon={BarChart3}
        title="Báo cáo doanh thu"
        description="Xem và phân tích hiệu quả kinh doanh."
        actions={
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex rounded-lg"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {exporting ? "Đang xuất..." : "Xuất báo cáo (Excel)"}
          </Button>
        }
      />

      {/* 2. Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loadingSummary ? (
          // Skeleton
          [0, 1, 2].map((i) => (
            <Card key={i} className="border-none shadow-sm animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-28 rounded bg-slate-200 mb-4" />
                <div className="h-9 w-40 rounded bg-slate-200 mb-3" />
                <div className="h-4 w-24 rounded bg-slate-100" />
              </CardContent>
            </Card>
          ))
        ) : errorSummary || !summaryCards ? (
          <div className="col-span-3 flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3 border border-red-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Không thể tải dữ liệu thống kê. Vui lòng thử lại.
          </div>
        ) : (
          summaryCards.map((card, idx) => (
            <Card
              key={card.title}
              className={
                idx === 0
                  ? "border-none shadow-sm bg-emerald-600 text-white"
                  : "border border-slate-200/60 shadow-sm bg-white"
              }
            >
              <CardHeader className="pb-2">
                <CardTitle
                  className={`text-sm font-medium ${
                    idx === 0 ? "text-emerald-100" : "text-slate-500"
                  }`}
                >
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${
                    idx === 0 ? "text-white" : "text-slate-900"
                  }`}
                >
                  {card.value}
                </div>
                <div
                  className={`flex items-center mt-2 text-sm ${
                    card.trend === "up"
                      ? idx === 0
                        ? "text-emerald-200"
                        : "text-emerald-500"
                      : idx === 0
                      ? "text-red-200"
                      : "text-red-500"
                  }`}
                >
                  {card.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  {card.change}
                  {idx === 0 && " so với tháng trước"}
                  {idx === 1 && " biến động"}
                  {idx === 2 && " tăng trưởng"}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 3. Chart Section */}
      <Card className="border border-slate-200/60 shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">
              Biểu đồ tăng trưởng
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Doanh thu theo{" "}
              {periodLabels[period].toLowerCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={period}
              onValueChange={(val) => setPeriod(val as ReportPeriod)}
            >
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <SelectValue placeholder="Chọn thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 ngày qua</SelectItem>
                <SelectItem value="30days">30 ngày qua</SelectItem>
                <SelectItem value="year">Năm nay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loadingChart ? (
            <div className="h-[320px] flex items-center justify-center gap-2 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Đang tải biểu đồ...</span>
            </div>
          ) : errorChart ? (
            <div className="h-[320px] flex flex-col items-center justify-center gap-3 text-slate-400">
              <AlertCircle className="h-10 w-10 text-slate-300" />
              <p className="text-sm">Không thể tải dữ liệu biểu đồ.</p>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs"
                onClick={() => fetchChart(period)}
              >
                Thử lại
              </Button>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[320px] flex flex-col items-center justify-center gap-3 text-slate-400">
              <TrendingUp className="h-12 w-12 text-slate-300" />
              <p className="text-sm">Chưa có dữ liệu cho kỳ này.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart
                data={chartData}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="money"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatShortVND(v)}
                  width={52}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                  formatter={(value) => (
                    <span className="text-slate-600">{value}</span>
                  )}
                />
                <Bar
                  yAxisId="money"
                  dataKey="revenue"
                  name="Doanh thu"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  opacity={0.85}
                />
                <Line
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  name="Đơn hàng"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
