import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Bot,
  BarChart3,
  CalendarDays,
  Check,
  Clock3,
  MessageSquareText,
  Users,
} from "lucide-react";
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PaginationComponent from "@/components/custom/PaginationComponent";
import { handleError } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import type { ProductAiChatConfigResponse } from "@/types/ai-chat/ProductAiChatConfigResponse";
import type { ProductAiMonthlyQuestionResponse } from "@/types/ai-chat/ProductAiMonthlyQuestionResponse";
import type { ProductAiChatOverviewResponse } from "@/types/ai-chat/ProductAiChatOverviewResponse";
import type { ProductAiUserUsageResponse } from "@/types/ai-chat/ProductAiUserUsageResponse";
import {
  getProductAiChatConfigApi,
  getProductAiMonthlyQuestionStatsApi,
  getProductAiChatOverviewApi,
  getProductAiUserUsageApi,
  updateProductAiChatConfigApi,
} from "@/services/admin/productAiChatAdminApi";

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
}

function toStartOfDayIso(value: Date) {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    0,
    0,
    0,
    0,
  ).toISOString();
}

function toEndOfDayIso(value: Date) {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    23,
    59,
    59,
    999,
  ).toISOString();
}

function formatDateLabel(value?: Date) {
  if (!value) return "";
  return value.toLocaleDateString("vi-VN");
}

function formatDateRangeLabel(value?: DateRange) {
  if (!value?.from && !value?.to) {
    return "Chọn khoảng thời gian";
  }

  if (value?.from && !value?.to) {
    return `${formatDateLabel(value.from)} - ...`;
  }

  return `${formatDateLabel(value?.from)} - ${formatDateLabel(value?.to ?? value?.from)}`;
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getDisplayName(userEmail?: string, userKeycloakId?: string) {
  if (!userEmail || userEmail === "anonymous") {
    return "Khách vãng lai";
  }

  const localPart = userEmail.split("@")[0] || "";
  const normalized = localPart.replace(/[._-]+/g, " ").trim();
  if (!normalized) {
    return userKeycloakId && userKeycloakId !== "anonymous"
      ? `User ${userKeycloakId.slice(0, 6)}`
      : "Người dùng";
  }
  return toTitleCase(normalized);
}

function getInitials(name: string) {
  const tokens = name.split(" ").filter(Boolean);
  if (tokens.length === 0) return "U";
  if (tokens.length === 1) return tokens[0].slice(0, 1).toUpperCase();
  return `${tokens[0].slice(0, 1)}${tokens[tokens.length - 1].slice(0, 1)}`.toUpperCase();
}

export default function AdminAiChatPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState<ProductAiChatConfigResponse>({
    chatboxDisplayName: "Tea4Life AI",
    maxQuestionsPerUserPerDay: 20,
  });
  const [overview, setOverview] =
    useState<ProductAiChatOverviewResponse | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<
    ProductAiMonthlyQuestionResponse[]
  >([]);
  const [userStats, setUserStats] = useState<ProductAiUserUsageResponse[]>([]);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [emailKeywordInput, setEmailKeywordInput] = useState("");
  const [dateRangeInput, setDateRangeInput] = useState<DateRange | undefined>(
    undefined,
  );
  const [emailKeywordFilter, setEmailKeywordFilter] = useState("");
  const [fromTimeFilter, setFromTimeFilter] = useState<string | undefined>(
    undefined,
  );
  const [toTimeFilter, setToTimeFilter] = useState<string | undefined>(
    undefined,
  );

  const monthlyChartData = monthlyStats.map((item) => ({
    label: `T${item.month}`,
    questionCount: item.questionCount,
  }));

  const fetchConfigAndOverview = useCallback(async () => {
    const [configRes, overviewRes, monthlyRes] = await Promise.all([
      getProductAiChatConfigApi(),
      getProductAiChatOverviewApi(),
      getProductAiMonthlyQuestionStatsApi(),
    ]);

    setConfig(configRes.data.data);
    setOverview(overviewRes.data.data);
    setMonthlyStats(monthlyRes.data.data || []);
  }, []);

  const fetchUserUsage = useCallback(async () => {
    const res = await getProductAiUserUsageApi({
      page,
      size,
      emailKeyword: emailKeywordFilter || undefined,
      fromTime: fromTimeFilter,
      toTime: toTimeFilter,
    });
    const pageData = res.data.data;
    setUserStats(pageData.content || []);
    setTotalElements(pageData.totalElements || 0);
  }, [emailKeywordFilter, fromTimeFilter, page, size, toTimeFilter]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchConfigAndOverview(), fetchUserUsage()]);
    } catch (error) {
      handleError(error, "Không thể tải dữ liệu quản lý AI.");
    } finally {
      setLoading(false);
    }
  }, [fetchConfigAndOverview, fetchUserUsage]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchConfigAndOverview(), fetchUserUsage()])
      .catch((error) => handleError(error, "Không thể tải dữ liệu quản lý AI."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchUserUsage().catch((error) =>
      handleError(error, "Không thể tải thống kê người dùng AI."),
    );
  }, [fetchUserUsage]);

  const handleSaveConfig = async () => {
    const displayName = config.chatboxDisplayName?.trim();
    if (!displayName) {
      toast.warning("Tên chat box không được để trống.");
      return;
    }
    if (config.maxQuestionsPerUserPerDay < 0) {
      toast.warning("Limit phải lớn hơn hoặc bằng 0.");
      return;
    }

    setSaving(true);
    try {
      const res = await updateProductAiChatConfigApi({
        chatboxDisplayName: displayName,
        maxQuestionsPerUserPerDay: config.maxQuestionsPerUserPerDay,
      });
      setConfig(res.data.data);
      toast.success("Đã cập nhật cấu hình AI chat.");
      await fetchAll();
    } catch (error) {
      handleError(error, "Không thể cập nhật cấu hình AI chat.");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyUserFilters = () => {
    if (dateRangeInput?.from && dateRangeInput?.to && dateRangeInput.from > dateRangeInput.to) {
      toast.warning("Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc.");
      return;
    }

    const nextFromTime = dateRangeInput?.from
      ? toStartOfDayIso(dateRangeInput.from)
      : undefined;
    const nextToTime = dateRangeInput?.to
      ? toEndOfDayIso(dateRangeInput.to)
      : undefined;

    setEmailKeywordFilter(emailKeywordInput.trim());
    setFromTimeFilter(nextFromTime);
    setToTimeFilter(nextToTime);
    setPage(1);
  };

  const handleResetUserFilters = () => {
    setEmailKeywordInput("");
    setDateRangeInput(undefined);
    setEmailKeywordFilter("");
    setFromTimeFilter(undefined);
    setToTimeFilter(undefined);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader
        icon={Bot}
        title="Quản lý AI Chat"
        description="Theo dõi người dùng, câu hỏi phổ biến và cấu hình chatbot sản phẩm."
        actions={
          <Button
            onClick={() => void handleSaveConfig()}
            disabled={saving || loading}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Check className="mr-2 h-4 w-4" />
            Lưu cấu hình
          </Button>
        }
      />

      <Card className="border border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800">Cấu hình chatbox</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">
              Tên hiển thị chatbox
            </p>
            <Input
              value={config.chatboxDisplayName}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  chatboxDisplayName: e.target.value,
                }))
              }
              placeholder="Ví dụ: Trà Sư Tea4Life"
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">
              Giới hạn câu hỏi mỗi user mỗi ngày
            </p>
            <Input
              type="number"
              min={0}
              value={config.maxQuestionsPerUserPerDay}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  maxQuestionsPerUserPerDay: Number(e.target.value || 0),
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border border-slate-200/70 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Tổng câu hỏi
              </p>
              <p className="text-xl font-bold text-slate-800">
                {overview?.totalQuestions?.toLocaleString("vi-VN") || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/70 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Người dùng đã hỏi
              </p>
              <p className="text-xl font-bold text-slate-800">
                {overview?.uniqueUsers?.toLocaleString("vi-VN") || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/70 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Câu hỏi hôm nay
              </p>
              <p className="text-xl font-bold text-slate-800">
                {overview?.questionsToday?.toLocaleString("vi-VN") || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
            Thống kê câu hỏi theo tháng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyChartData}
                margin={{ top: 8, right: 16, left: 12, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#64748B" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
                  formatter={(value) => [
                    Number(value ?? 0).toLocaleString("vi-VN"),
                    "Số câu hỏi",
                  ]}
                />
                <Bar
                  dataKey="questionCount"
                  fill="#10B981"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800">
            Thống kê theo người dùng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">Email</p>
              <Input
                value={emailKeywordInput}
                onChange={(e) => setEmailKeywordInput(e.target.value)}
                placeholder="Tìm theo email..."
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">
                From - To
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarDays className="mr-2 h-4 w-4 text-slate-500" />
                    <span className="truncate">
                      {formatDateRangeLabel(dateRangeInput)}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRangeInput}
                    onSelect={setDateRangeInput}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetUserFilters}
                disabled={loading}
              >
                Xóa lọc
              </Button>
              <Button
                type="button"
                onClick={handleApplyUserFilters}
                disabled={loading}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Lọc
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead className="text-right">Tổng câu hỏi</TableHead>
                <TableHead className="text-right">Hôm nay</TableHead>
                <TableHead className="text-right">Còn lại hôm nay</TableHead>
                <TableHead className="text-right">Lần hỏi gần nhất</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500">
                    Chưa có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                userStats.map((item) => {
                  const displayName = getDisplayName(
                    item.userEmail,
                    item.userKeycloakId,
                  );
                  const initials = getInitials(displayName);
                  const shortId =
                    item.userKeycloakId && item.userKeycloakId !== "anonymous"
                      ? item.userKeycloakId.slice(0, 18)
                      : "anonymous";
                  const remainingClass =
                    item.remainingQuestionsToday === null
                      ? "bg-slate-100 text-slate-600"
                      : item.remainingQuestionsToday > 0
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700";

                  return (
                    <TableRow
                      key={`${item.userKeycloakId}-${item.userEmail}`}
                      className="hover:bg-slate-50/70"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {displayName}
                            </p>
                            <p className="text-xs text-slate-500">{shortId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {item.userEmail && item.userEmail !== "anonymous"
                          ? item.userEmail
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {item.questionCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {item.todayQuestionCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${remainingClass}`}
                        >
                          {item.remainingQuestionsToday ?? "Không giới hạn"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-slate-700">
                        {formatDateTime(item.lastAskedAt)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {totalElements > 0 && (
            <PaginationComponent
              currentPage={page}
              pageSize={size}
              totalCount={totalElements}
              onPageChange={setPage}
              onSizeChange={(newSize) => {
                setSize(newSize);
                setPage(1);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
