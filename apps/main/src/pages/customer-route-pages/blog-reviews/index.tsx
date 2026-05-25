import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MessageSquareText, Trash2, Star, Pencil, EllipsisVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  deleteMyBlogReviewApi,
  getMyBlogReviewsApi,
  updateMyBlogReviewApi,
} from "@/services/blogApi";
import type { BlogReviewResponse } from "@/types/blog/BlogReviewResponse";
import { handleError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MyBlogReviewsPage() {
  const [items, setItems] = useState<BlogReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);

  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const startItem = totalElements === 0 ? 0 : (page - 1) * size + 1;
  const endItem = Math.min(page * size, totalElements);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyBlogReviewsApi({ page: page - 1, size });
      const payload = res.data.data;
      setItems(payload?.content || []);
      setTotalElements(payload?.totalElements || 0);
    } catch (error) {
      handleError(error, "Không thể tải danh sách đánh giá của bạn");
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteMyBlogReviewApi(id);
      toast.success("Đã xóa bài đánh giá");
      fetchReviews();
    } catch (error) {
      handleError(error, "Không thể xóa bài đánh giá");
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (item: BlogReviewResponse) => {
    setEditingId(item.id);
    setEditTitle(item.title || "");
    setEditContent(item.content || "");
    setEditRating(item.rating || 5);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setEditRating(5);
  };

  const handleSaveEdit = async (item: BlogReviewResponse) => {
    const title = editTitle.trim();
    const content = editContent.trim();
    if (!title || !content) {
      toast.warning("Vui lòng nhập tiêu đề và nội dung.");
      return;
    }

    try {
      setSavingId(item.id);
      const res = await updateMyBlogReviewApi(item.id, {
        productName: item.productName,
        title,
        summary: content.slice(0, 140),
        content,
        rating: editRating,
        thumbnailUrl: item.thumbnailUrl,
      });
      const updated = res.data.data;
      if (updated) {
        setItems((prev) => prev.map((review) => (review.id === item.id ? updated : review)));
      }
      toast.success("Đã cập nhật bài đánh giá.");
      cancelEdit();
    } catch (error) {
      handleError(error, "Không thể cập nhật bài đánh giá");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-white border-2 border-[#1A4331]/15">
      <div className="px-6 py-4 border-b-2 border-[#1A4331]/10 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[#1A4331] font-bold text-sm uppercase tracking-wider">Đánh Giá Của Tôi</h2>
          <p className="text-[#8A9A7A] text-xs mt-1">
            Quản lý các bài review sản phẩm bạn đã đăng.
          </p>
        </div>
        <Link
          to="/profile/my-review-history"
          className="inline-flex items-center rounded-full bg-[#1A4331] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123224]"
        >
          Lịch sử hoạt động
        </Link>
      </div>

      <div className="p-6">

        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#8A9A7A]" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-[#1A4331]/10 rounded-2xl p-10 text-center">
            <MessageSquareText className="h-10 w-10 mx-auto text-[#8A9A7A] mb-3" />
            <p className="font-semibold mb-3">Bạn chưa có bài đánh giá nào</p>
            <Link
              to="/shop"
              className="inline-flex px-4 py-2 rounded-full bg-[#1A4331] text-white text-sm font-bold"
            >
              Đi mua hàng và đánh giá
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#1A4331]/10 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#8A9A7A]">Sản phẩm #{item.productId}</p>
                    {editingId === item.id ? (
                      <div className="mt-2 space-y-2">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full rounded-xl border border-[#1A4331]/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4331]/20"
                          placeholder="Tiêu đề đánh giá"
                        />
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full h-24 rounded-xl border border-[#1A4331]/15 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1A4331]/20"
                          placeholder="Nội dung đánh giá"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold mr-1">Điểm:</span>
                          {Array.from({ length: 5 }).map((_, index) => {
                            const value = index + 1;
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
                      </div>
                    ) : (
                      <>
                        <h3 className="font-bold text-lg mt-1">{item.title}</h3>
                        <p className="text-sm text-[#5c4033]/80 mt-2 whitespace-pre-line">
                          {item.summary || item.content}
                        </p>
                      </>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#d97743] inline-flex items-center gap-1">
                        <Star className="h-4 w-4 fill-[#d97743]" /> {item.rating}/5
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {editingId === item.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item)}
                          disabled={savingId === item.id}
                          className="h-9 rounded-full border border-emerald-200 text-emerald-600 inline-flex items-center justify-center px-4 text-sm font-semibold hover:bg-emerald-50 disabled:opacity-50"
                          title="Lưu chỉnh sửa"
                        >
                          {savingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Lưu"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="h-9 rounded-full border border-red-200 text-red-600 inline-flex items-center justify-center px-4 text-sm font-semibold hover:bg-red-50"
                          title="Hủy chỉnh sửa"
                        >
                          Hủy bỏ
                        </button>
                      </>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="h-9 w-9 rounded-full border border-[#1A4331]/20 text-[#1A4331] inline-flex items-center justify-center hover:bg-[#1A4331]/5"
                            title="Tùy chọn"
                          >
                            <EllipsisVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEdit(item)}>
                            <Pencil className="h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            variant="destructive"
                          >
                            {deletingId === item.id ? (
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
                </div>
              </div>
            ))}

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
          </div>
        )}
      </div>
    </div>
  );
}
