"use client";

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { handleError, getMediaUrl } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/custom/ConfirmationDialog";
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import PaginationComponent from "@/components/custom/PaginationComponent";
import { Newspaper, Plus, Edit, Trash2, Image as ImageIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import EmptyState from "@/components/custom/EmptyState";
import { getAdminNewsApi, deleteAdminNewsApi } from "@/services/admin/newsAdminApi";
import type { NewsSummaryResponse } from "@/types/news/NewsSummaryResponse";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function AdminNewsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NewsSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NewsSummaryResponse | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminNewsApi({ page: page - 1, size });
      setItems(res.data.data?.content || []);
      setTotalElements(res.data.data?.totalElements || 0);
    } catch (error) {
      handleError(error, "Không thể tải danh sách tin tức.");
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filtered = items.filter((n) => {
    if (!keyword.trim()) return true;
    return n.title.toLowerCase().includes(keyword.toLowerCase());
  });

  const openDelete = (item: NewsSummaryResponse) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAdminNewsApi(deleteTarget.id);
      toast.success("Đã xoá tin tức.");
      setDeleteOpen(false);
      setDeleteTarget(null);
      await fetchNews();
    } catch (error) {
      handleError(error, "Xoá tin tức thất bại.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader
        icon={Newspaper}
        title="Quản lý tin tức"
        description="Thêm, sửa, xóa các bài viết tin tức của cửa hàng."
        searchPlaceholder="Tìm kiếm tin tức..."
        searchValue={keyword}
        onSearchChange={setKeyword}
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Danh sách tin tức{" "}
              {totalElements > 0 && `(${totalElements})`}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Quản lý nội dung tin tức hiển thị trên website
            </p>
          </div>
          <Button
            onClick={() => navigate("/admin/news/create")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200/50 gap-2 px-8 h-12 font-bold transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            Tạo bài viết mới
          </Button>
        </div>

        <div className="overflow-hidden border border-emerald-200 rounded-[2rem] bg-white shadow-sm min-h-[500px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              <p className="text-slate-500 mt-4 font-bold italic tracking-wide">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                title="Chưa có tin tức"
                description="Hiện tại chưa có bài viết nào."
                actionLabel="Tạo bài viết mới"
                onAction={() => navigate("/admin/news/create")}
                className="border-none shadow-none bg-white"
              />
            </div>
          ) : (
            <div className="flex-1">
              <Table>
                <TableHeader className="bg-emerald-50/50">
                  <TableRow className="hover:bg-transparent border-emerald-200">
                    <TableHead className="w-[80px] font-black text-slate-700 pl-6 border-r border-emerald-200 uppercase text-[11px] tracking-wider">
                      Ảnh
                    </TableHead>
                    <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider pl-6">
                      Tiêu đề
                    </TableHead>
                    <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-center w-[140px]">
                      Danh mục
                    </TableHead>
                    <TableHead className="font-black text-slate-700 border-r border-emerald-200 uppercase text-[11px] tracking-wider text-center w-[120px]">
                      Ngày tạo
                    </TableHead>
                    <TableHead className="pr-6 font-black text-slate-700 uppercase text-[11px] tracking-wider text-center w-[120px]">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((n) => (
                    <TableRow key={n.id} className="group hover:bg-emerald-50/40 border-emerald-200 transition-colors h-20">
                      <TableCell className="pl-6 border-r border-emerald-100/50">
                        <div className="h-12 w-12 rounded-lg border border-emerald-100 bg-emerald-50 overflow-hidden flex items-center justify-center shrink-0">
                          {n.thumbnailUrl ? (
                            <img src={getMediaUrl(n.thumbnailUrl)} alt={n.title} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-emerald-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-emerald-100/50 pl-6">
                        <div className="font-semibold text-emerald-900 line-clamp-2 text-[14px]">
                          {n.title}
                        </div>
                        <div className="text-slate-400 font-mono text-xs mt-0.5 font-normal truncate max-w-[300px]">
                          /{n.slug}
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-emerald-100/50 text-center">
                        <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 rounded-full">
                          {n.categoryName}
                        </span>
                      </TableCell>
                      <TableCell className="border-r border-emerald-100/50 text-center text-sm text-slate-600">
                        <div className="flex items-center justify-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(n.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/news/edit/${n.id}`)}
                            className="h-10 w-10 rounded-2xl text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-all active:scale-95 group"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4.5 w-4.5 group-hover:rotate-12 transition-transform" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDelete(n)}
                            className="h-10 w-10 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 group"
                            title="Xóa"
                          >
                            <Trash2 className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {totalElements > 0 && (
          <PaginationComponent
            currentPage={page}
            pageSize={size}
            totalCount={totalElements}
            onPageChange={setPage}
            showItemsPerPageSelect={false}
          />
        )}
      </div>

      <ConfirmationDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xác nhận xoá tin tức"
        description={`Bạn có chắc chắn muốn xoá bài viết "${deleteTarget?.title || ""}"? Thao tác này không thể hoàn tác.`}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        confirmLabel="Xoá"
        cancelLabel="Huỷ"
      />
    </div>
  );
}
