import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, CalendarDays, RotateCcw } from "lucide-react";
import type { DateRange } from "react-day-picker";
import {
  getMyBlogReviewHistoryApi,
  getPublicBlogReviewDetailApi,
} from "@/services/blogApi";
import type {
  BlogReviewHistoryAction,
  BlogReviewHistoryResponse,
  BlogReviewResponse,
} from "@/types/blog/BlogReviewResponse";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getMediaUrl, handleError } from "@/lib/utils";

type HistoryFilter = "ALL" | "LIKED" | "COMMENTED";

const HISTORY_FILTER_OPTIONS: { label: string; value: HistoryFilter }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Yêu thích", value: "LIKED" },
  { label: "Bình luận", value: "COMMENTED" },
];

function getActionBadge(action: BlogReviewHistoryAction) {
  if (action === "LIKED") {
    return { label: "LIKE", className: "bg-rose-100 text-rose-700 border-rose-200" };
  }
  if (action === "COMMENTED") {
    return { label: "COMMENT", className: "bg-sky-100 text-sky-700 border-sky-200" };
  }
  return { label: action, className: "bg-slate-100 text-slate-700 border-slate-200" };
}

function getVietnameseHistoryDescription(history: BlogReviewHistoryResponse) {
  if (history.action === "LIKED") return "Bạn đã thích bài review này.";
  if (history.action === "COMMENTED") return "Bạn đã thêm một bình luận.";
  if (history.description === "Added a comment") return "Bạn đã thêm một bình luận.";
  if (history.description === "Liked review") return "Bạn đã thích bài review này.";
  if (history.description === "Removed like") return "Bạn đã bỏ thích bài review này.";
  return history.description || "Không có mô tả";
}

export default function MyBlogReviewHistoryPage() {
  const [histories, setHistories] = useState<BlogReviewHistoryResponse[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("ALL");
  const [historyFromDate, setHistoryFromDate] = useState("");
  const [historyToDate, setHistoryToDate] = useState("");
  const [historyDateRange, setHistoryDateRange] = useState<DateRange | undefined>(undefined);
  const [historyReviewMap, setHistoryReviewMap] = useState<Record<string, BlogReviewResponse>>({});

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateLabel = (value?: Date) => {
    if (!value) return "";
    return value.toLocaleDateString("vi-VN");
  };

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const actions: BlogReviewHistoryAction[] =
        historyFilter === "ALL" ? ["LIKED", "COMMENTED"] : [historyFilter];
      const historyRes = await getMyBlogReviewHistoryApi({
        page: 0,
        size: 50,
        actions,
        from: historyFromDate || undefined,
        to: historyToDate || undefined,
      });
      const historyItems = historyRes.data.data?.content || [];
      setHistories(historyItems);

      const reviewIds = Array.from(new Set(historyItems.map((history) => history.reviewId)));
      if (reviewIds.length === 0) {
        setHistoryReviewMap({});
        return;
      }

      const detailResults = await Promise.allSettled(
        reviewIds.map(async (reviewId) => {
          const detailRes = await getPublicBlogReviewDetailApi(reviewId);
          return { reviewId, review: detailRes.data.data };
        }),
      );

      const nextMap: Record<string, BlogReviewResponse> = {};
      for (const result of detailResults) {
        if (result.status === "fulfilled" && result.value.review) {
          nextMap[result.value.reviewId] = result.value.review;
        }
      }
      setHistoryReviewMap(nextMap);
    } catch (error) {
      handleError(error, "Không thể tải lịch sử tương tác.");
    } finally {
      setHistoryLoading(false);
    }
  }, [historyFilter, historyFromDate, historyToDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    setHistoryFromDate(historyDateRange?.from ? formatDateForInput(historyDateRange.from) : "");
    setHistoryToDate(historyDateRange?.to ? formatDateForInput(historyDateRange.to) : "");
  }, [historyDateRange]);

  const handleResetHistoryFilters = () => {
    setHistoryFilter("ALL");
    setHistoryDateRange(undefined);
  };

  const setQuickRange = (days?: number) => {
    if (!days) {
      setHistoryDateRange(undefined);
      return;
    }
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    setHistoryDateRange({ from, to });
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A4331] pt-12 pb-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-[#1A4331]/10 pb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Lịch Sử Tương Tác</h1>
            <p className="text-sm text-[#8A9A7A] mt-1">
              Theo dõi các bài review bạn đã yêu thích và bình luận.
            </p>
          </div>
          <Link to="/my-reviews" className="text-sm font-semibold text-[#1A4331] underline">
            Quay lại đánh giá của tôi
          </Link>
        </div>

        <div className="bg-white border border-[#1A4331]/10 rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-lg">Lịch sử đã like, comment</h3>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value as HistoryFilter)}
                className="rounded-lg border border-[#1A4331]/20 bg-white px-3 py-1.5 text-sm font-semibold text-[#1A4331] focus:outline-none focus:ring-2 focus:ring-[#1A4331]/20"
              >
                {HISTORY_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#1A4331]/20 bg-white px-3 py-1.5 text-sm font-semibold text-[#1A4331] hover:bg-[#1A4331]/5"
                  >
                    <CalendarDays className="h-4 w-4" />
                    {historyDateRange?.from
                      ? `${formatDateLabel(historyDateRange.from)}${
                          historyDateRange.to ? ` - ${formatDateLabel(historyDateRange.to)}` : ""
                        }`
                      : "Chọn khoảng ngày"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={historyDateRange}
                    onSelect={setHistoryDateRange}
                    numberOfMonths={1}
                    disabled={{ after: new Date() }}
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickRange(7)}
                  disabled={historyLoading}
                  className="rounded-lg border border-[#1A4331]/10 bg-white px-2 py-1 text-xs font-semibold text-[#1A4331] hover:bg-[#1A4331]/5"
                  title="7 ngày"
                >
                  7d
                </button>
                <button
                  type="button"
                  onClick={() => setQuickRange(30)}
                  disabled={historyLoading}
                  className="rounded-lg border border-[#1A4331]/10 bg-white px-2 py-1 text-xs font-semibold text-[#1A4331] hover:bg-[#1A4331]/5"
                  title="30 ngày"
                >
                  30d
                </button>
                <button
                  type="button"
                  onClick={() => setQuickRange(undefined)}
                  disabled={historyLoading}
                  className="rounded-lg border border-[#1A4331]/10 bg-white px-2 py-1 text-xs font-semibold text-[#1A4331] hover:bg-[#1A4331]/5"
                  title="Tất cả"
                >
                  All
                </button>
              </div>
              <button
                type="button"
                onClick={handleResetHistoryFilters}
                disabled={historyLoading}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#1A4331]/20 bg-white text-[#1A4331] hover:bg-[#1A4331]/5 disabled:opacity-50"
                title="Reset bộ lọc"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {historyLoading ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#8A9A7A]" />
            </div>
          ) : histories.length === 0 ? (
            <p className="text-sm text-[#8A9A7A] mt-2">Chưa có lịch sử like/comment.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {histories.map((history) => {
                const review = historyReviewMap[history.reviewId];
                const actionBadge = getActionBadge(history.action);
                return (
                  <Link
                    key={history.id}
                    to={`/blog?reviewId=${history.reviewId}`}
                    className="block rounded-xl border border-[#1A4331]/10 bg-[#F8F5F0] p-3 text-sm hover:bg-[#f3efe9]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#1A4331]/10 bg-white">
                        {review?.thumbnailUrl ? (
                          <img
                            src={getMediaUrl(review.thumbnailUrl)}
                            alt={review?.productName || review?.title || "Ảnh sản phẩm"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-[#8A9A7A]">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold pr-2">
                            {review?.title || `Review #${history.reviewId}`}
                          </p>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold ${actionBadge.className}`}
                          >
                            {actionBadge.label}
                          </span>
                        </div>
                        {review?.productName && (
                          <p className="text-[#5c4033]/80">Sản phẩm: {review.productName}</p>
                        )}
                        <p className="text-[#5c4033]/80">{getVietnameseHistoryDescription(history)}</p>
                        <p className="text-xs text-[#8A9A7A]">
                          {new Date(history.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
