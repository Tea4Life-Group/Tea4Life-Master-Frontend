"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/custom/ConfirmationDialog";
import CategoryFormModal from "./components/CategoryFormModal";
import CategoriesTableSection from "./components/CategoriesTableSection";
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import { LibraryBig } from "lucide-react";
import {
  getAdminNewsCategoriesApi,
  createAdminNewsCategoryApi,
  updateAdminNewsCategoryApi,
  deleteAdminNewsCategoryApi,
} from "@/services/admin/newsAdminApi";
import type { NewsCategoryResponse } from "@/types/news/NewsCategoryResponse";
import type { NewsCategoryRequest } from "@/types/news/NewsRequest";

export default function AdminNewsCategoriesPage() {
  const [items, setItems] = useState<NewsCategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [current, setCurrent] = useState<NewsCategoryResponse | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NewsCategoryResponse | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminNewsCategoriesApi();
      setItems(res.data.data || []); // adjusted for ApiResponse wrapper
    } catch (error) {
      handleError(error, "Không thể tải danh sách danh mục tin tức.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Adjust in case API response is wrapped in standard ApiResponse
  const actualItems = Array.isArray(items) ? items : (items as any).data || [];

  const filtered = actualItems.filter((c: NewsCategoryResponse) => {
    if (!keyword.trim()) return true;
    return c.name?.toLowerCase().includes(keyword.toLowerCase());
  });

  const openCreate = () => {
    setCurrent(null);
    setModalOpen(true);
  };

  const openEdit = (item: NewsCategoryResponse) => {
    setCurrent(item);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: NewsCategoryRequest, id?: string) => {
    setModalLoading(true);
    try {
      if (id) {
        await updateAdminNewsCategoryApi(id, payload);
        toast.success("Cập nhật danh mục thành công.");
      } else {
        await createAdminNewsCategoryApi(payload);
        toast.success("Tạo danh mục thành công.");
      }
      setModalOpen(false);
      await fetchCategories();
    } catch (error) {
      handleError(error, "Lưu danh mục thất bại.");
      throw error; // Re-throw for the form modal to show the error
    } finally {
      setModalLoading(false);
    }
  };

  const openDelete = (item: NewsCategoryResponse) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAdminNewsCategoryApi(deleteTarget.id);
      toast.success("Đã xoá danh mục.");
      setDeleteOpen(false);
      setDeleteTarget(null);
      await fetchCategories();
    } catch (error) {
      handleError(error, "Xoá danh mục thất bại. Có thể danh mục đang chứa tin tức.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader
        icon={LibraryBig}
        title="Quản lý danh mục"
        description="Sắp xếp các tin tức theo chủ đề."
        searchPlaceholder="Tìm kiếm danh mục..."
        searchValue={keyword}
        onSearchChange={setKeyword}
      />

      <CategoriesTableSection
        loading={loading}
        filtered={filtered}
        openCreate={openCreate}
        openEdit={openEdit}
        openDelete={openDelete}
      />

      <CategoryFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        loading={modalLoading}
        initialData={current}
        onSubmit={handleSubmit}
      />

      <ConfirmationDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xác nhận xoá danh mục"
        description={`Bạn có chắc chắn muốn xoá danh mục "${deleteTarget?.name || ""}"? Thao tác này không thể hoàn tác.`}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        confirmLabel="Xoá"
        cancelLabel="Huỷ"
      />
    </div>
  );
}
