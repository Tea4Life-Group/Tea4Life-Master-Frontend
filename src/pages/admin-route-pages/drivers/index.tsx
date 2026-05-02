"use client";

import { useState, useCallback, useEffect } from "react";
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import { Truck, Plus, Edit, Trash2, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmationDialog } from "@/components/custom/ConfirmationDialog";
import EmptyState from "@/components/custom/EmptyState";
import { toast } from "sonner";
import { handleError } from "@/lib/utils";

import {
  findAllDriversApi,
  createDriverApi,
  updateDriverApi,
  deleteDriverApi,
} from "@/services/admin/driverAdminApi";
import type { DriverResponse } from "@/types/driver/DriverResponse";
import type { UpsertDriverRequest } from "@/types/driver/UpsertDriverRequest";

import DriverFormModal from "./components/DriverFormModal";

export default function AdminDriversPage() {
  const [items, setItems] = useState<DriverResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [current, setCurrent] = useState<DriverResponse | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DriverResponse | null>(null);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await findAllDriversApi();
      setItems(res.data.data || []);
    } catch (error) {
      handleError(error, "Không thể tải danh sách tài xế.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const filtered = items.filter((v) => {
    if (!keyword.trim()) return true;
    const kw = keyword.toLowerCase();
    return (
      v.fullName?.toLowerCase().includes(kw) ||
      v.phone?.toLowerCase().includes(kw) ||
      v.keycloakId?.toLowerCase().includes(kw)
    );
  });

  const handleOpenCreate = () => {
    setCurrent(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: DriverResponse) => {
    setCurrent(item);
    setModalOpen(true);
  };

  const handleSubmit = async (data: UpsertDriverRequest, id?: string | number) => {
    setModalLoading(true);
    try {
      if (id) {
        await updateDriverApi(id, data);
        toast.success("Cập nhật tài xế thành công.");
      } else {
        await createDriverApi(data);
        toast.success("Thêm tài xế thành công.");
      }
      setModalOpen(false);
      await fetchDrivers();
    } catch (error) {
      handleError(error, "Lưu tài xế thất bại.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenDelete = (item: DriverResponse) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteDriverApi(deleteTarget.id);
      toast.success("Đã xóa tài xế.");
      setDeleteOpen(false);
      setDeleteTarget(null);
      await fetchDrivers();
    } catch (error) {
      handleError(error, "Xóa tài xế thất bại.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Quản lý tài xế"
        description="Quản lý danh sách tài xế giao hàng của hệ thống."
        icon={Truck}
        searchPlaceholder="Tìm tên, SĐT, Keycloak ID..."
        searchValue={keyword}
        onSearchChange={setKeyword}
        actions={
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Thêm tài xế
          </Button>
        }
      />

      {loading ? (
        <div className="py-12 text-center text-emerald-600/60 font-medium flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải danh sách tài xế...
        </div>
      ) : !filtered.length ? (
        <EmptyState
          title="Chưa có tài xế nào"
          description="Thêm tài xế để bắt đầu giao hàng."
          actionLabel="Thêm tài xế"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Keycloak ID</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-sm text-gray-500">
                    {String(item.id).slice(0, 8) || "N/A"}
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-800">
                    {item.fullName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Phone className="h-3 w-3" />
                      {item.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-slate-50 px-2 py-0.5 rounded text-slate-600 font-mono">
                      {item.keycloakId.slice(0, 18)}...
                    </code>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDelete(item)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DriverFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        loading={modalLoading}
        initialData={current}
        onSubmit={handleSubmit}
      />

      <ConfirmationDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xác nhận xóa tài xế"
        description={`Bạn có chắc muốn xóa tài xế "${deleteTarget?.fullName}" không?`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
      />
    </div>
  );
}
