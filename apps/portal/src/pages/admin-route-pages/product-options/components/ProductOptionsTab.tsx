"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings2, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";

import {
  getAllProductOptionsApi,
  createProductOptionApi,
  updateProductOptionApi,
  deleteProductOptionApi,
} from "@/services/admin/productOptionAdminApi";

import type { ProductOptionResponse } from "@/types/product-option/ProductOptionResponse";
import type { CreateProductOptionRequest } from "@/types/product-option/CreateProductOptionRequest";

import { ConfirmationDialog } from "@/components/custom/ConfirmationDialog";
import ProductOptionFormModal from "./ProductOptionFormModal";

export default function ProductOptionsTab() {
  const [data, setData] = useState<ProductOptionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentOption, setCurrentOption] =
    useState<ProductOptionResponse | null>(null);

  // Delete Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const sortedData = useMemo(() => {
    const sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof ProductOptionResponse] ?? "";
        const bVal = b[sortConfig.key as keyof ProductOptionResponse] ?? "";
        if (aVal < bVal) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllProductOptionsApi();
      setData(response.data.data || []);
    } catch (error) {
      handleError(error, "Không thể tải danh sách tùy chọn.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const handleOpenCreateForm = () => {
    setCurrentOption(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (option: ProductOptionResponse) => {
    setCurrentOption(option);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (
    formData: CreateProductOptionRequest,
    id?: string,
  ) => {
    setFormLoading(true);
    try {
      if (id) {
        await updateProductOptionApi(id, formData);
        toast.success("Cập nhật tùy chọn thành công!");
      } else {
        await createProductOptionApi(formData);
        toast.success("Thêm tùy chọn mới thành công!");
      }
      setIsFormOpen(false);
      fetchOptions();
    } catch (error) {
      handleError(error, "Lưu tùy chọn thất bại.");
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
      await deleteProductOptionApi(deleteId);
      toast.success(`Đã xóa tùy chọn "${deleteName}"`);
      setIsDeleteDialogOpen(false);
      fetchOptions();
    } catch (error) {
      handleError(error, "Xóa tùy chọn thất bại.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Tổng cộng:{" "}
          <span className="font-semibold text-emerald-700">{data.length}</span>{" "}
          tùy chọn
        </p>
        <Button
          onClick={handleOpenCreateForm}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all shadow-emerald-200"
        >
          <Plus className="h-4 w-4 mr-2" /> Thêm Tùy Chọn
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th
                className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => requestSort("id")}
              >
                <div className="flex items-center gap-1">
                  ID
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                Tên tùy chọn
              </th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                Bắt buộc
              </th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                Chọn nhiều
              </th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                Thứ tự
              </th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                Giá trị
              </th>
              <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-slate-100 rounded w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  <Settings2 className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">Chưa có tùy chọn nào</p>
                  <p className="text-xs mt-1">
                    Nhấn "Thêm Tùy Chọn" để bắt đầu
                  </p>
                </td>
              </tr>
            ) : (
              sortedData.map((option) => (
                <tr
                  key={option.id}
                  className="hover:bg-emerald-50/30 transition-colors"
                >
                  <td className="px-5 py-4 text-slate-400 font-mono text-xs">
                    {option.id}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {option.name}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        option.isRequired
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-50 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {option.isRequired ? "Có" : "Không"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        option.isMultiSelect
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-slate-50 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {option.isMultiSelect ? "Có" : "Không"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {option.sortOrder}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      {option.productOptionValues?.length || 0} giá trị
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditForm(option)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleOpenDeleteDialog(option.id, option.name)
                        }
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProductOptionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        loading={formLoading}
        initialData={currentOption}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa tùy chọn"
        description={`Bạn có chắc chắn muốn xóa tùy chọn "${deleteName}"? Thao tác này có thể xóa cả các giá trị thuộc tùy chọn này (tùy thuộc vào backend).`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLoading}
        confirmLabel="Xóa vĩnh viễn"
        cancelLabel="Hủy bỏ"
      />
    </div>
  );
}
