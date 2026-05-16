"use client";

import { useState, useCallback, useEffect } from "react";
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import { Store, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/custom/ConfirmationDialog";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";

import {
  findAllStoresApi,
  createStoreApi,
  updateStoreApi,
  deleteStoreApi,
} from "@/services/admin/storeAdminApi";
import type { StoreResponse } from "@/types/store/StoreResponse";
import type { UpsertStoreRequest } from "@/types/store/UpsertStoreRequest";

import StoreFormModal from "./components/StoreFormModal";
import StoresTableSection from "./components/StoresTableSection";
import StoreEmployeeModal from "./components/StoreEmployeeModal";

export default function AdminStoresPage() {
  const [items, setItems] = useState<StoreResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [current, setCurrent] = useState<StoreResponse | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StoreResponse | null>(null);

  // Employee modal state
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreResponse | null>(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await findAllStoresApi();
      setItems(res.data.data || []);
    } catch (error) {
      handleError(error, "Không thể tải danh sách cửa hàng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const filtered = items.filter((v) => {
    if (!keyword.trim()) return true;
    const kw = keyword.toLowerCase();
    return (
      v.name?.toLowerCase().includes(kw) || v.address?.toLowerCase().includes(kw)
    );
  });

  const handleOpenCreate = () => {
    setCurrent(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: StoreResponse) => {
    setCurrent(item);
    setModalOpen(true);
  };

  const handleSubmit = async (data: UpsertStoreRequest, id?: string | number) => {
    setModalLoading(true);
    try {
      if (id) {
        await updateStoreApi(id, data);
        toast.success("Cập nhật cửa hàng thành công.");
      } else {
        await createStoreApi(data);
        toast.success("Thêm mới cửa hàng thành công.");
      }
      setModalOpen(false);
      await fetchStores();
    } catch (error) {
      handleError(error, "Lưu cửa hàng thất bại.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenDelete = (item: StoreResponse) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteStoreApi(deleteTarget.id);
      toast.success("Đã xóa cửa hàng.");
      setDeleteOpen(false);
      setDeleteTarget(null);
      await fetchStores();
    } catch (error) {
      handleError(error, "Xóa cửa hàng thất bại.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenEmployees = (item: StoreResponse) => {
    setSelectedStore(item);
    setEmployeeModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Quản lý cửa hàng"
        description="Quản lý danh sách các chi nhánh và cửa hàng của hệ thống."
        icon={Store}
        searchPlaceholder="Tìm kiếm tên, địa chỉ..."
        searchValue={keyword}
        onSearchChange={setKeyword}
        actions={
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Thêm cửa hàng
          </Button>
        }
      />

      <StoresTableSection
        loading={loading}
        items={filtered}
        onOpenCreate={handleOpenCreate}
        onOpenEdit={handleOpenEdit}
        onOpenDelete={handleOpenDelete}
        onOpenEmployees={handleOpenEmployees}
      />

      <StoreFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        loading={modalLoading}
        initialData={current}
        onSubmit={handleSubmit}
      />

      <StoreEmployeeModal
        isOpen={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        store={selectedStore}
        onEmployeeChanged={fetchStores}
      />

      <ConfirmationDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xác nhận xóa cửa hàng"
        description={`Bạn có chắc muốn xóa cửa hàng "${deleteTarget?.name}" không? Thao tác này có thể ảnh hưởng đến các dữ liệu liên quan.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
      />
    </div>
  );
}
