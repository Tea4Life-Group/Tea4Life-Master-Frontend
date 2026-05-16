import { useState, useCallback, useEffect } from "react";
import {
  getProductCategoriesApi,
  createProductCategoryApi,
  updateProductCategoryApi,
  deleteProductCategoryApi,
} from "@/services/admin/productCategoryAdminApi";
import type { ProductCategoryResponse } from "@/types/product-category/ProductCategoryResponse";
import type { CreateProductCategoryRequest } from "@/types/product-category/CreateProductCategoryRequest";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";

// Sub-components
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import { LayoutGrid } from "lucide-react";
import TableSection from "./components/TableSection";
import CategoryFormModal from "./components/CategoryFormModal";
import { ConfirmationDialog } from "@/components/custom/ConfirmationDialog";

export default function AdminCategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProductCategoryResponse[]>([]);

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<ProductCategoryResponse | null>(null);

  // Delete Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      // Product categoryService response: { code, message, data: [] }
      const response = await getProductCategoriesApi();
      const responseData = response.data.data;
      if (Array.isArray(responseData)) {
        setData(responseData);
      } else {
        setData([]); // Fallback
      }
    } catch (error) {
      handleError(error, "Không thể tải danh sách danh mục.");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreateForm = () => {
    setCurrentCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (category: ProductCategoryResponse) => {
    setCurrentCategory(category);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (
    formData: CreateProductCategoryRequest,
    id?: string,
  ) => {
    setFormLoading(true);
    try {
      if (id) {
        await updateProductCategoryApi(id, formData);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await createProductCategoryApi(formData);
        toast.success("Thêm danh mục thành công!");
      }
      setIsFormOpen(false);
      fetchCategories();
    } catch (error) {
      handleError(error, "Lưu danh mục thất bại.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDeleteDialog = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteProductCategoryApi(deleteId);
      toast.success(`Đã xóa danh mục "${deleteName}"`);
      setIsDeleteDialogOpen(false);
      fetchCategories();
    } catch (error) {
      handleError(error, "Xóa danh mục thất bại.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredData = data.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Page Header */}
      <AdminPageHeader
        icon={LayoutGrid}
        title="Quản lý danh mục"
        description="Quản lý các danh mục sản phẩm trong hệ thống."
        searchPlaceholder="Tìm kiếm danh mục..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 3. Table Section */}
      <TableSection
        loading={loading}
        data={filteredData}
        onCreate={handleOpenCreateForm}
        onEdit={handleOpenEditForm}
        onDelete={handleOpenDeleteDialog}
      />

      {/* Form Modal (Create/Update) */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        loading={formLoading}
        initialData={currentCategory}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa danh mục"
        description={`Bạn có chắc chắn muốn xóa danh mục "${deleteName}"? Hành động này không thể hoàn tác và có thể ảnh hưởng đến các sản phẩm thuộc danh mục này.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLoading}
        confirmLabel="Xóa vĩnh viễn"
        cancelLabel="Hủy bỏ"
      />
    </div>
  );
}
