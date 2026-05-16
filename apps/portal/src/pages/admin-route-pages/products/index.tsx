"use client";

import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";
import { handleError } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/custom/ConfirmationDialog";
import ProductFormModal from "./components/ProductFormModal";
import ProductsTableSection from "./components/ProductsTableSection";
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import { Package } from "lucide-react";
import PaginationComponent from "@/components/custom/PaginationComponent";
import {
  createAdminProductApi,
  deleteAdminProductApi,
  getAdminProductsApi,
  updateAdminProductApi,
} from "@/services/admin/productAdminApi";
import { getProductCategoriesApi } from "@/services/admin/productCategoryAdminApi";
import { getAllProductOptionsApi } from "@/services/admin/productOptionAdminApi";
import type { ProductResponse } from "@/types/product/ProductResponse";
import type { CreateProductRequest } from "@/types/product/CreateProductRequest";
import type { ProductCategoryResponse } from "@/types/product-category/ProductCategoryResponse";
import type { ProductOptionResponse } from "@/types/product-option/ProductOptionResponse";

export default function AdminProductsPage() {
  const [items, setItems] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);
  const [options, setOptions] = useState<ProductOptionResponse[]>([]);

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  const [keyword, setKeyword] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [current, setCurrent] = useState<ProductResponse | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(
    null,
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminProductsApi({ page, size });
      const pageData = res.data.data;
      setItems(pageData.content || []);
      setTotalElements(pageData.totalElements || 0);
    } catch (error) {
      handleError(error, "Không thể tải danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  const fetchMeta = useCallback(async () => {
    try {
      const [catRes, optionRes] = await Promise.all([
        getProductCategoriesApi(),
        getAllProductOptionsApi(),
      ]);
      setCategories(catRes.data.data || []);
      setOptions(optionRes.data.data || []);
    } catch (error) {
      handleError(error, "Không thể tải danh mục hoặc tuỳ chọn.");
    }
  }, []);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = items.filter((p) => {
    if (!keyword.trim()) return true;
    const kw = keyword.toLowerCase();
    return (
      p.name.toLowerCase().includes(kw) ||
      p.productCategoryName.toLowerCase().includes(kw)
    );
  });

  const openCreate = () => {
    setCurrent(null);
    setModalOpen(true);
  };

  const openEdit = (item: ProductResponse) => {
    setCurrent(item);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: CreateProductRequest, id?: string) => {
    setModalLoading(true);
    try {
      if (id) {
        await updateAdminProductApi(id, payload);
        toast.success("Cập nhật sản phẩm thành công.");
      } else {
        await createAdminProductApi(payload);
        toast.success("Tạo sản phẩm thành công.");
      }
      setModalOpen(false);
      await fetchProducts();
    } catch (error) {
      handleError(error, "Lưu sản phẩm thất bại.");
    } finally {
      setModalLoading(false);
    }
  };

  const openDelete = (item: ProductResponse) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAdminProductApi(deleteTarget.id);
      toast.success("Đã xoá sản phẩm.");
      setDeleteOpen(false);
      setDeleteTarget(null);
      await fetchProducts();
    } catch (error) {
      handleError(error, "Xoá sản phẩm thất bại.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Page Header */}
      <AdminPageHeader
        icon={Package}
        title="Quản lý sản phẩm"
        description="Quản lý các sản phẩm trong hệ thống."
        searchPlaceholder="Tìm kiếm sản phẩm / danh mục..."
        searchValue={keyword}
        onSearchChange={setKeyword}
      />
      <ProductsTableSection
        loading={loading}
        filtered={filtered}
        openCreate={openCreate}
        openEdit={openEdit}
        openDelete={openDelete}
      />

      {/* 4. Pagination Section */}
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

      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        loading={modalLoading}
        initialData={current}
        categories={categories}
        options={options}
        onSubmit={handleSubmit}
      />

      <ConfirmationDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xác nhận xoá sản phẩm"
        description={`Bạn có chắc chắn muốn xoá sản phẩm "${deleteTarget?.name || ""}"? Thao tác này không thể hoàn tác.`}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        confirmLabel="Xoá"
        cancelLabel="Huỷ"
      />
    </div>
  );
}
