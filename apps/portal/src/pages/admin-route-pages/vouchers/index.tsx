"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/custom/ConfirmationDialog";
import VoucherFormModal from "./components/VoucherFormModal";
import VouchersTableSection from "./components/VouchersTableSection";
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import { Ticket } from "lucide-react";
import {
  getAllAdminVouchersApi,
  createAdminVoucherApi,
  updateAdminVoucherApi,
  deleteAdminVoucherApi,
} from "@/services/admin/voucherAdminApi";
import type { VoucherResponse } from "@/types/voucher/VoucherResponse";
import type { CreateVoucherRequest } from "@/types/voucher/CreateVoucherRequest";

export default function AdminVouchersPage() {
  const [items, setItems] = useState<VoucherResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [current, setCurrent] = useState<VoucherResponse | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VoucherResponse | null>(null);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllAdminVouchersApi();
      setItems(res.data.data || []);
    } catch (error) {
      handleError(error, "Không thể tải danh sách phiếu giảm giá.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const filtered = items.filter((v) => {
    if (!keyword.trim()) return true;
    const kw = keyword.toLowerCase();
    return v.description?.toLowerCase().includes(kw);
  });

  const openCreate = () => {
    setCurrent(null);
    setModalOpen(true);
  };

  const openEdit = (item: VoucherResponse) => {
    setCurrent(item);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: CreateVoucherRequest, id?: string) => {
    setModalLoading(true);
    try {
      if (id) {
        await updateAdminVoucherApi(id, payload);
        toast.success("Cập nhật phiếu giảm giá thành công.");
      } else {
        await createAdminVoucherApi(payload);
        toast.success("Tạo phiếu giảm giá thành công.");
      }
      setModalOpen(false);
      await fetchVouchers();
    } catch (error) {
      handleError(error, "Lưu phiếu giảm giá thất bại.");
    } finally {
      setModalLoading(false);
    }
  };

  const openDelete = (item: VoucherResponse) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAdminVoucherApi(deleteTarget.id);
      toast.success("Đã xoá phiếu giảm giá.");
      setDeleteOpen(false);
      setDeleteTarget(null);
      await fetchVouchers();
    } catch (error) {
      handleError(error, "Xoá phiếu giảm giá thất bại.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Standardized Page Header */}
      <AdminPageHeader
        icon={Ticket}
        title="Quản lý phiếu giảm giá"
        description="Kiểm soát voucher và khuyến mãi của cửa hàng."
        searchPlaceholder="Tìm kiếm phiếu giảm giá..."
        searchValue={keyword}
        onSearchChange={setKeyword}
      />

      <VouchersTableSection
        loading={loading}
        filtered={filtered}
        openCreate={openCreate}
        openEdit={openEdit}
        openDelete={openDelete}
      />

      <VoucherFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        loading={modalLoading}
        initialData={current}
        onSubmit={handleSubmit}
      />

      <ConfirmationDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xác nhận xoá phiếu giảm giá"
        description={`Bạn có chắc chắn muốn xoá phiếu giảm giá "${deleteTarget?.description || ""}"? Thao tác này không thể hoàn tác.`}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        confirmLabel="Xoá"
        cancelLabel="Huỷ"
      />
    </div>
  );
}
