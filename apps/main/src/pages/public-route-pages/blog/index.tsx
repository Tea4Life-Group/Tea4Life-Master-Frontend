import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Loader2,
  Star,
  MessageSquareText,
  CalendarDays,
  ThumbsUp,
  Share2,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Pencil,
  Trash2,
  ImagePlus,
  X,
  Tag,
} from "lucide-react";
import {
  createMyBlogReviewApi,
  createBlogReviewCommentApi,
  deleteMyBlogReviewApi,
  getBlogReviewCommentsApi,
  getPublicBlogReviewDetailApi,
  getPublicBlogReviewsApi,
  shareBlogReviewApi,
  toggleBlogReviewLikeApi,
  updateMyBlogReviewApi,
} from "@/services/blogApi";
import type { BlogReviewCommentResponse, BlogReviewResponse } from "@/types/blog/BlogReviewResponse";
import { getMediaUrl, handleError } from "@/lib/utils";
import { handleUpload } from "@/services/storageApi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/useAuth";
import { RequireLoginDialog } from "@/components/custom/RequireLoginDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BlogPage() {
  const [searchParams] = useSearchParams();
  const reviewIdFromQuery = searchParams.get("reviewId");
  const [items, setItems] = useState<BlogReviewResponse[]>([]);
  const [focusedReview, setFocusedReview] = useState<BlogReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [size] = useState(9);
  const [totalElements, setTotalElements] = useState(0);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentMap, setCommentMap] = useState<Record<string, BlogReviewCommentResponse[]>>({});
  const [replyTargetMap, setReplyTargetMap] = useState<
    Record<string, { commentId: string; displayName: string } | null>
  >({});
  const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null);
  const commentInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [likingReviewId, setLikingReviewId] = useState<string | null>(null);
  const [sharingReviewId, setSharingReviewId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [savingEditReviewId, setSavingEditReviewId] = useState<string | null>(null);
  const isQuickComposerOpen = true;
  const [quickTitle, setQuickTitle] = useState("");
  const [quickContent, setQuickContent] = useState("");
  const [quickImageFile, setQuickImageFile] = useState<File | null>(null);
  const [quickImagePreview, setQuickImagePreview] = useState<string | null>(null);
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { isAuthenticated, email, fullName } = useAuth();
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const startItem = totalElements === 0 ? 0 : (page - 1) * size + 1;
  const endItem = Math.min(page * size, totalElements);

  const formatDateTime = (value: string) => {
    if (!value) return "";
    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 1) return "Vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayDiff = Math.floor(
      (startOfToday.getTime() - startOfTarget.getTime()) / (1000 * 60 * 60 * 24),
    );

    const hourMinute = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (dayDiff === 0) return `Hôm nay lúc ${hourMinute}`;
    if (dayDiff === 1) return `Hôm qua lúc ${hourMinute}`;

    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserDisplayName = (email: string) => {
    if (!email) return "Người dùng Tea4Life";
    return email.split("@")[0];
  };

  const getCommentDisplayName = (comment: BlogReviewCommentResponse) =>
    comment.authorName || getUserDisplayName(comment.authorEmail);

  const fetchPublicReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPublicBlogReviewsApi({ page: page - 1, size });
      const payload = res.data.data;
      setItems(payload?.content || []);
      setTotalElements(payload?.totalElements || 0);
    } catch (error) {
      handleError(error, "Không thể tải bài blog.");
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchPublicReviews();
  }, [fetchPublicReviews]);

  useEffect(() => {
    if (!reviewIdFromQuery) {
      setFocusedReview(null);
      return;
    }

    let isCancelled = false;
    const loadReviewDetail = async () => {
      try {
        const res = await getPublicBlogReviewDetailApi(reviewIdFromQuery);
        if (!isCancelled) {
          setFocusedReview(res.data.data || null);
        }
      } catch {
        if (!isCancelled) {
          setFocusedReview(null);
        }
      }
    };

    loadReviewDetail();
    return () => {
      isCancelled = true;
    };
  }, [reviewIdFromQuery]);

  const handleLoadComments = async (reviewId: string) => {
    try {
      const res = await getBlogReviewCommentsApi(reviewId, { page: 0, size: 50 });
      const comments = res.data.data?.content || [];
      setCommentMap((prev) => ({
        ...prev,
        [reviewId]: comments,
      }));
    } catch (error) {
      handleError(error, "Không thể tải bình luận.");
    }
  };

  const handleSubmitComment = async (reviewId: string) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    const content = (commentInputs[reviewId] || "").trim();
    if (!content) {
      toast.warning("Vui lòng nhập nội dung bình luận.");
      return;
    }
    try {
      setSubmittingCommentFor(reviewId);
      const res = await createBlogReviewCommentApi(reviewId, {
        content,
        parentCommentId: replyTargetMap[reviewId]?.commentId,
      });
      const newComment = res.data.data;
      setCommentInputs((prev) => ({ ...prev, [reviewId]: "" }));
      setReplyTargetMap((prev) => ({ ...prev, [reviewId]: null }));
      setCommentMap((prev) => ({
        ...prev,
        [reviewId]: [...(prev[reviewId] || []), newComment],
      }));
      setItems((prev) =>
        prev.map((item) =>
          item.id === reviewId
            ? { ...item, totalComments: (item.totalComments || 0) + 1 }
            : item,
        ),
      );
      toast.success("Đã thêm bình luận.");
    } catch (error) {
      handleError(error, "Không thể gửi bình luận.");
    } finally {
      setSubmittingCommentFor(null);
    }
  };

  const handleReplyToComment = (
    reviewId: string,
    commentId: string,
    displayName: string,
  ) => {
    setReplyTargetMap((prev) => ({
      ...prev,
      [reviewId]: { commentId, displayName },
    }));
    setCommentInputs((prev) => {
      const current = prev[reviewId] || "";
      const mention = `@${displayName} `;
      return {
        ...prev,
        [reviewId]: current.startsWith(mention) ? current : `${mention}${current}`.trimStart(),
      };
    });
    setTimeout(() => {
      commentInputRefs.current[reviewId]?.focus();
    }, 0);
  };

  const handleToggleLike = async (reviewId: string) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    let prevLiked = false;
    let prevTotalLikes = 0;
    try {
      setLikingReviewId(reviewId);
      const prevItem = items.find((item) => item.id === reviewId);
      if (!prevItem) return;
      prevLiked = Boolean(prevItem.likedByMe);
      prevTotalLikes = prevItem.totalLikes || 0;

      // Optimistic UI update: reflect immediately on click.
      setItems((prev) =>
        prev.map((item) =>
          item.id === reviewId
            ? {
                ...item,
                likedByMe: !prevLiked,
                totalLikes: Math.max(0, prevTotalLikes + (prevLiked ? -1 : 1)),
              }
            : item,
        ),
      );

      const res = await toggleBlogReviewLikeApi(reviewId);
      const payload = res.data.data;
      setItems((prev) =>
        prev.map((item) =>
          item.id === reviewId
            ? {
                ...item,
                likedByMe: payload.liked,
                totalLikes: payload.totalLikes,
              }
            : item,
        ),
      );
    } catch (error) {
      // Rollback on error.
      setItems((prev) =>
        prev.map((item) =>
          item.id === reviewId
            ? {
                ...item,
                likedByMe: prevLiked,
                totalLikes: prevTotalLikes,
              }
            : item,
        ),
      );
      handleError(error, "Không thể like bài review.");
    } finally {
      setLikingReviewId(null);
    }
  };

  const handleShareReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    try {
      setSharingReviewId(reviewId);
      const res = await shareBlogReviewApi(reviewId, { channel: "web" });
      const payload = res.data.data;
      setItems((prev) =>
        prev.map((item) =>
          item.id === reviewId
            ? {
                ...item,
                totalShares: payload.totalShares,
              }
            : item,
        ),
      );
      toast.success("Đã ghi nhận lượt chia sẻ.");
    } catch (error) {
      handleError(error, "Không thể chia sẻ bài review.");
    } finally {
      setSharingReviewId(null);
    }
  };

  const handleDeleteMyReview = async (reviewId: string) => {
    try {
      setDeletingReviewId(reviewId);
      await deleteMyBlogReviewApi(reviewId);
      setItems((prev) => prev.filter((item) => item.id !== reviewId));
      toast.success("Đã xóa bài đánh giá.");
    } catch (error) {
      handleError(error, "Không thể xóa bài đánh giá.");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const startEditReview = (review: BlogReviewResponse) => {
    setEditingReviewId(review.id);
    setEditTitle(review.title || "");
    setEditContent(review.content || "");
    setEditRating(review.rating || 5);
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditTitle("");
    setEditContent("");
    setEditRating(5);
  };

  const saveEditReview = async (review: BlogReviewResponse) => {
    const title = editTitle.trim();
    const content = editContent.trim();
    if (!title || !content) {
      toast.warning("Vui lòng nhập tiêu đề và nội dung.");
      return;
    }

    try {
      setSavingEditReviewId(review.id);
      const res = await updateMyBlogReviewApi(review.id, {
        productName: review.productName,
        title,
        summary: content.slice(0, 140),
        content,
        rating: editRating,
        thumbnailUrl: review.thumbnailUrl,
      });
      const updated = res.data.data;
      if (updated) {
        setItems((prev) => prev.map((item) => (item.id === review.id ? updated : item)));
      }
      toast.success("Đã cập nhật bài đánh giá.");
      cancelEditReview();
    } catch (error) {
      handleError(error, "Không thể cập nhật bài đánh giá.");
    } finally {
      setSavingEditReviewId(null);
    }
  };

  const resetQuickComposer = () => {
    setQuickTitle("");
    setQuickContent("");
    setQuickImageFile(null);
    if (quickImagePreview) {
      URL.revokeObjectURL(quickImagePreview);
    }
    setQuickImagePreview(null);
  };

  const handleQuickImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (quickImagePreview) {
      URL.revokeObjectURL(quickImagePreview);
    }
    setQuickImageFile(file);
    setQuickImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleQuickPost = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    const content = quickContent.trim();
    const title = quickTitle.trim() || content.slice(0, 60) || "Thảo luận cộng đồng";
    if (!content) {
      toast.warning("Vui lòng nhập nội dung bài viết.");
      return;
    }
    try {
      setQuickSubmitting(true);
      let thumbnailUrl: string | undefined;
      if (quickImageFile) {
        const uploadedKey = await handleUpload(quickImageFile);
        if (!uploadedKey) {
          toast.error("Không thể upload ảnh.");
          return;
        }
        thumbnailUrl = uploadedKey;
      }
      const res = await createMyBlogReviewApi({
        productId: "0",
        productName: "Bài thảo luận",
        title,
        summary: content.slice(0, 140),
        content,
        rating: 5,
        thumbnailUrl,
      });
      const created = res.data.data;
      if (created) {
        setItems((prev) => [created, ...prev]);
        setTotalElements((prev) => prev + 1);
      }
      toast.success("Đã đăng bài thảo luận.");
      resetQuickComposer();
    } catch (error) {
      handleError(error, "Không thể đăng bài.");
    } finally {
      setQuickSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A4331] py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#1A4331]" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-[#1A4331]/10 rounded-2xl p-10 text-center">
            <MessageSquareText className="h-10 w-10 mx-auto text-[#8A9A7A] mb-3" />
            <p className="font-semibold">Chưa có bài blog nào</p>
            <p className="text-sm text-[#8A9A7A] mt-1 mb-4">
              Hãy mua sản phẩm và để lại review đầu tiên.
            </p>
            <Link
              to="/shop"
              className="inline-flex px-4 py-2 rounded-full bg-[#1A4331] text-white text-sm font-bold"
            >
              Đi tới thực đơn
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-3xl border border-[#1A4331]/10 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1A4331] text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {getUserDisplayName(fullName || email || "").slice(0, 2).toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1A4331] leading-none">
                    {fullName || getUserDisplayName(email || "")}
                  </p>
                </div>
              </div>
              {isQuickComposerOpen && (
                <div className="mt-2 space-y-2.5 border-t border-[#1A4331]/10 pt-2.5">
                  <div className="relative">
                    <textarea
                      value={quickContent}
                      onChange={(e) => setQuickContent(e.target.value)}
                      placeholder="Bạn đang nghĩ gì? Chia sẻ với cộng đồng Tea4Life..."
                      className="w-full h-20 rounded-xl border border-[#1A4331]/15 px-3 py-2 pr-12 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1A4331]/20"
                    />
                    <label className="absolute right-2 bottom-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#1A4331]/20 bg-white text-[#1A4331] cursor-pointer hover:bg-[#F8F5F0]">
                      <ImagePlus className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQuickImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    {quickImagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuickImageFile(null);
                          URL.revokeObjectURL(quickImagePreview);
                          setQuickImagePreview(null);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                      >
                        <X className="h-3.5 w-3.5" />
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                  {quickImagePreview && (
                    <div className="mx-auto w-full max-w-[520px] rounded-xl overflow-hidden border border-[#1A4331]/10 bg-[#F8F5F0]">
                      <img
                        src={quickImagePreview}
                        alt="Ảnh bài viết"
                        className="w-full max-h-72 object-contain bg-white"
                      />
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetQuickComposer}
                      className="h-9 rounded-full px-4 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="button"
                      onClick={handleQuickPost}
                      disabled={quickSubmitting}
                      className="h-9 rounded-full px-4 bg-[#1A4331] hover:bg-[#123224]"
                    >
                      {quickSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Đăng bài"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {focusedReview && (
              <div className="mb-5 rounded-2xl border border-[#1A4331]/15 bg-white p-4">
                <p className="text-xs font-bold text-[#1A4331]/70">Bài review từ lịch sử tương tác</p>
                <h2 className="mt-1 text-lg font-bold text-[#1A4331]">{focusedReview.title}</h2>
                <p className="mt-1 text-sm text-[#5c4033]/80">
                  Sản phẩm: {focusedReview.productName || `#${focusedReview.productId}`}
                </p>
                <p className="mt-2 text-sm text-[#5c4033]/90 whitespace-pre-line">
                  {focusedReview.summary || focusedReview.content}
                </p>
              </div>
            )}
            <div className="space-y-5">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="bg-white border border-[#1A4331]/10 rounded-3xl p-5 md:p-6 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#1A4331] text-white text-sm font-bold flex items-center justify-center shrink-0">
                      {getUserDisplayName(item.authorEmail).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#1A4331] leading-none">
                        {getUserDisplayName(item.authorEmail)}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[#8A9A7A]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDateTime(item.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.productId !== "0" && (
                        <Link
                          to={`/shop/products/${item.productId}`}
                          className="inline-flex items-center gap-2 rounded-full border border-[#1A4331]/15 bg-[#F8F5F0] px-3 py-1.5 text-xs font-semibold text-[#1A4331] hover:border-[#d97743]/30 hover:text-[#d97743] hover:bg-[#fff7f2] transition-colors"
                        >
                          <Tag className="h-3.5 w-3.5" />
                          {item.productName
                            ? `Review cho ${item.productName}`
                            : "Review cho sản phẩm"}
                        </Link>
                      )}
                      {item.productId !== "0" && (
                        <div className="flex items-center gap-1 bg-[#F8F5F0] px-3 py-1.5 rounded-full">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`h-3.5 w-3.5 ${
                                idx < item.rating
                                  ? "fill-[#d97743] text-[#d97743]"
                                  : "text-[#d97743]/25"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {isAuthenticated && email && item.authorEmail === email && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="h-8 w-8 rounded-full border border-[#1A4331]/20 text-[#1A4331] inline-flex items-center justify-center hover:bg-[#1A4331]/5"
                            title="Tùy chọn bài viết"
                          >
                            <EllipsisVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEditReview(item)}>
                            <Pencil className="h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteMyReview(item.id)}
                            disabled={deletingReviewId === item.id}
                            variant="destructive"
                          >
                            {deletingReviewId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Xóa bài
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {editingReviewId === item.id ? (
                    <div className="mt-4 space-y-3">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-xl border border-[#1A4331]/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4331]/20"
                        placeholder="Tiêu đề đánh giá"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-28 rounded-xl border border-[#1A4331]/15 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1A4331]/20"
                        placeholder="Nội dung đánh giá"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold mr-1">Điểm:</span>
                        {Array.from({ length: 5 }).map((_, idx) => {
                          const value = idx + 1;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setEditRating(value)}
                              className="p-0.5"
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  value <= editRating
                                    ? "fill-[#d97743] text-[#d97743]"
                                    : "text-[#d97743]/30"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => saveEditReview(item)}
                          disabled={savingEditReviewId === item.id}
                          className="h-9 rounded-full px-4 text-sm bg-[#1A4331] hover:bg-[#123224]"
                        >
                          {savingEditReviewId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Lưu"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEditReview}
                          className="h-9 rounded-full px-4 text-sm border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mt-4">
                        <h3 className="font-bold text-lg text-[#1A4331] line-clamp-2">
                          {item.title}
                        </h3>
                        {item.productId !== "0" && (
                          <p className="text-sm text-[#8A9A7A] mt-1">
                            Sản phẩm: {item.productName || item.productId}
                          </p>
                        )}
                      </div>

                      <p className="text-[15px] text-[#5c4033]/90 mt-3 whitespace-pre-line leading-relaxed">
                        {item.summary || item.content}
                      </p>
                    </>
                  )}

                  {item.thumbnailUrl && (
                    <div className="mt-4 w-full rounded-2xl overflow-hidden border border-[#1A4331]/10 bg-[#F8F5F0]">
                      <img
                        src={getMediaUrl(item.thumbnailUrl)}
                        alt={item.title}
                        className="block w-full h-[520px] object-cover"
                      />
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-[#1A4331]/10">
                    <div className="mb-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(item.id)}
                        disabled={likingReviewId === item.id}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-all ${
                          item.likedByMe
                            ? "bg-[#1A4331] text-white border-[#1A4331] hover:opacity-90"
                            : "bg-white text-[#5c4033] border-[#5c4033]/20 hover:border-[#d97743] hover:text-[#d97743] hover:bg-[#fff7f2]"
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {item.totalLikes || 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadComments(item.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border bg-white text-[#5c4033] border-[#5c4033]/20 transition-all hover:border-[#d97743] hover:text-[#d97743] hover:bg-[#fff7f2]"
                      >
                        <MessageSquareText className="h-3.5 w-3.5" />
                        {item.totalComments || 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareReview(item.id)}
                        disabled={sharingReviewId === item.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border bg-white text-[#5c4033] border-[#5c4033]/20 transition-all hover:border-[#d97743] hover:text-[#d97743] hover:bg-[#fff7f2]"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        {item.totalShares || 0}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(commentMap[item.id] || [])
                        .filter((comment) => !comment.parentCommentId)
                        .map((parentComment) => {
                          const childComments = (commentMap[item.id] || []).filter(
                            (comment) => comment.parentCommentId === parentComment.id,
                          );
                          return (
                            <div key={parentComment.id} className="space-y-2">
                              <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-[#1A4331] text-white text-[10px] font-bold flex items-center justify-center">
                                  {getCommentDisplayName(parentComment).slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="inline-block rounded-2xl bg-[#F0F2F5] px-3 py-2 text-xs text-[#233] max-w-[520px]">
                                    <p className="font-semibold text-[#1A4331]">
                                      {getCommentDisplayName(parentComment)}
                                    </p>
                                    <p className="mt-0.5 text-[#5c4033]/90 whitespace-pre-line">{parentComment.content}</p>
                                  </div>
                                  <div className="mt-1 ml-2 flex items-center gap-3 text-[11px] text-[#1A4331]/65">
                                    <span>{formatDateTime(parentComment.createdAt)}</span>
                                    <button type="button" className="font-semibold hover:text-[#d97743]">
                                      Thích
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleReplyToComment(
                                          item.id,
                                          parentComment.id,
                                          getCommentDisplayName(parentComment),
                                        )
                                      }
                                      className="font-semibold hover:text-[#d97743]"
                                    >
                                      Trả lời
                                    </button>
                                  </div>
                                </div>
                              </div>
                              {childComments.length > 0 && (
                                <div className="ml-4 border-l border-[#1A4331]/20 pl-4 space-y-2">
                                  {childComments.map((childComment) => (
                                    <div key={childComment.id} className="flex items-start gap-2.5">
                                      <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-[#8A9A7A] text-white text-[9px] font-bold flex items-center justify-center">
                                        {getCommentDisplayName(childComment).slice(0, 2).toUpperCase()}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="inline-block rounded-2xl bg-[#F8F5F0] px-3 py-2 text-xs text-[#233] max-w-[500px]">
                                          <p className="font-semibold text-[#1A4331]">
                                            {getCommentDisplayName(childComment)}
                                          </p>
                                          <p className="mt-0.5 text-[#5c4033]/90 whitespace-pre-line">
                                            {childComment.content}
                                          </p>
                                        </div>
                                        <div className="mt-1 ml-2 flex items-center gap-3 text-[11px] text-[#1A4331]/65">
                                          <span>{formatDateTime(childComment.createdAt)}</span>
                                          <button type="button" className="font-semibold hover:text-[#d97743]">
                                            Thích
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleReplyToComment(
                                                item.id,
                                                parentComment.id,
                                                getCommentDisplayName(childComment),
                                              )
                                            }
                                            className="font-semibold hover:text-[#d97743]"
                                          >
                                            Trả lời
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      {replyTargetMap[item.id] && (
                        <div className="text-[11px] text-[#1A4331]/75 bg-[#F8F5F0] border border-[#1A4331]/10 rounded-lg px-2.5 py-1.5 inline-flex items-center gap-2">
                          Đang phản hồi{" "}
                          <span className="font-semibold">
                            @{replyTargetMap[item.id]?.displayName}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setReplyTargetMap((prev) => ({ ...prev, [item.id]: null }))
                            }
                            className="text-[#d97743] hover:text-[#b85f34] font-semibold"
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 rounded-full border border-[#5c4033]/15 bg-white px-2 py-1.5">
                        <input
                          ref={(el) => {
                            commentInputRefs.current[item.id] = el;
                          }}
                          value={commentInputs[item.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          placeholder="Viết bình luận..."
                          className="flex-1 bg-transparent px-2 py-1.5 text-sm focus:outline-none"
                        />
                        <Button
                          onClick={() => handleSubmitComment(item.id)}
                          disabled={submittingCommentFor === item.id}
                          className="h-8 min-w-[60px] rounded-full px-3 text-xs bg-[#5c4033] hover:bg-[#d97743]"
                        >
                          Gửi
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Hiển thị <span className="font-bold text-emerald-600 mx-1">{startItem}</span> đến
                <span className="font-bold text-emerald-600 mx-1">{endItem}</span> trong tổng số
                <span className="font-bold text-emerald-600 mx-1">{totalElements}</span> kết quả
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="h-8 rounded-lg border-emerald-100 px-3 text-emerald-700"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Trước
                </Button>
                <span className="text-sm font-semibold text-[#1A4331] min-w-12 text-center">
                  {page}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="h-8 rounded-lg border-emerald-100 px-3 text-emerald-700"
                >
                  Sau
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      <RequireLoginDialog
        isOpen={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        title="Yêu cầu đăng nhập"
        description="Bạn cần đăng nhập để tương tác với bài review nhé!"
      />
    </div>
  );
}
