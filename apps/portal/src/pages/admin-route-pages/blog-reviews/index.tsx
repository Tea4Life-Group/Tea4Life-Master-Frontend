"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  MessageSquareText,
  Star,
  ThumbsUp,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import PaginationComponent from "@/components/custom/PaginationComponent";
import { ConfirmationDialog } from "@/components/custom/ConfirmationDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { handleError } from "@/lib/utils";
import {
  deleteAdminBlogReviewApi,
  getAdminBlogReviewsApi,
  moderateAdminBlogReviewApi,
} from "@/services/admin/blogReviewAdminApi";
import type { BlogReviewResponse } from "@/types/blog/BlogReviewResponse";
import type { BlogReviewStatus } from "@/types/blog/BlogReviewStatus";

const statusLabel: Record<BlogReviewStatus, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

const statusVariant: Record<BlogReviewStatus, "default" | "secondary" | "destructive"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

export default function AdminBlogReviewsPage() {
  const [items, setItems] = useState<BlogReviewResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<BlogReviewStatus | "ALL">("ALL");

  const [selected, setSelected] = useState<BlogReviewResponse | null>(null);
  const [rejectTarget, setRejectTarget] = useState<BlogReviewResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<BlogReviewResponse | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminBlogReviewsApi({ page, size });
      const pageData = res.data.data;
      setItems(pageData.content || []);
      setTotalElements(pageData.totalElements || 0);
    } catch (error) {
      handleError(error, "Không thể tải danh sách blog review.");
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      if (!matchesStatus) return false;
      if (!kw) return true;
      return (
        item.title.toLowerCase().includes(kw) ||
        item.productName?.toLowerCase().includes(kw) ||
        item.authorEmail.toLowerCase().includes(kw) ||
        item.productId.includes(kw)
      );
    });
  }, [items, keyword, statusFilter]);

  const moderate = async (
    review: BlogReviewResponse,
    status: Exclude<BlogReviewStatus, "PENDING">,
    rejectionReason?: string,
  ) => {
    setActionLoading(true);
    try {
      await moderateAdminBlogReviewApi(review.id, { status, rejectionReason });
      toast.success(status === "APPROVED" ? "Đã duyệt blog review." : "Đã từ chối blog review.");
      setRejectTarget(null);
      setRejectReason("");
      await fetchReviews();
    } catch (error) {
      handleError(error, "Cập nhật trạng thái blog review thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    await moderate(rejectTarget, "REJECTED", rejectReason.trim());
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteAdminBlogReviewApi(deleteTarget.id);
      toast.success("Đã xoá blog review.");
      setDeleteTarget(null);
      await fetchReviews();
    } catch (error) {
      handleError(error, "Xoá blog review thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader
        icon={MessageSquareText}
        title="Quản lý blog"
        description="Theo dõi, duyệt và xử lý các bài blog review của khách hàng."
        searchPlaceholder="Tìm theo tiêu đề, sản phẩm, email..."
        searchValue={keyword}
        onSearchChange={setKeyword}
      />

      <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Blog review</p>
          <p className="text-xs text-slate-500">{totalElements} bài trong hệ thống</p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: string) => setStatusFilter(value as BlogReviewStatus | "ALL")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="PENDING">Chờ duyệt</SelectItem>
            <SelectItem value="APPROVED">Đã duyệt</SelectItem>
            <SelectItem value="REJECTED">Từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bài viết</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead>Tương tác</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-28 text-center text-slate-500">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-28 text-center text-slate-500">
                  Chưa có blog review phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="min-w-[260px]">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 overflow-hidden rounded-md bg-slate-100">
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-[260px] truncate font-semibold text-slate-800">{item.title}</p>
                        <p className="max-w-[260px] truncate text-xs text-slate-500">{item.summary || item.content}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-700">{item.productName || `#${item.productId}`}</p>
                    <p className="text-xs text-slate-500">ID {item.productId}</p>
                  </TableCell>
                  <TableCell>{item.authorEmail}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {item.rating}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{item.totalComments || 0} bình luận</span>
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {item.totalLikes || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[item.status]}>{statusLabel[item.status]}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => setSelected(item)} title="Xem chi tiết">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={actionLoading || item.status === "APPROVED"}
                        onClick={() => moderate(item, "APPROVED")}
                        title="Duyệt"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={actionLoading || item.status === "REJECTED"}
                        onClick={() => setRejectTarget(item)}
                        title="Từ chối"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => setDeleteTarget(item)} title="Xoá">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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

      <Dialog open={!!selected} onOpenChange={(open: boolean) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex flex-wrap gap-2">
              {selected?.status && <Badge variant={statusVariant[selected.status]}>{statusLabel[selected.status]}</Badge>}
              <Badge variant="secondary">{selected?.rating} sao</Badge>
              <Badge variant="secondary">{selected?.authorEmail}</Badge>
            </div>
            {selected?.summary && <p className="rounded-lg bg-slate-50 p-3 font-medium">{selected.summary}</p>}
            <p className="whitespace-pre-wrap leading-7">{selected?.content}</p>
            {selected?.rejectionReason && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                Lý do từ chối: {selected.rejectionReason}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectTarget} onOpenChange={(open: boolean) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối blog review</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Nhập lý do từ chối"
            className="min-h-28"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectTarget(null)} disabled={actionLoading}>
              Huỷ
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={actionLoading || !rejectReason.trim()}>
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xác nhận xoá blog review"
        description={`Bạn có chắc chắn muốn xoá "${deleteTarget?.title || ""}"?`}
        confirmLabel="Xoá"
        cancelLabel="Huỷ"
        isLoading={actionLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
