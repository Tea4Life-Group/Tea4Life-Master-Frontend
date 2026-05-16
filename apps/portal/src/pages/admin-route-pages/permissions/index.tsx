import { useState, useEffect, useCallback } from "react";
import { usePaginationState } from "@/hooks/use-pagination-state";
import {
  findAllPermissions,
  createPermissionApi,
  updatePermissionApi,
  deletePermissionApi,
} from "@/services/admin/permissionAdminApi";
import type { PermissionResponse } from "@/types/permission/PermissionResponse";
import type { UpsertPermissionRequest } from "@/types/permission/UpsertPermissionRequest";
import { handleError } from "@/lib/utils";
import { toast } from "sonner";

// Sub-components
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import { ShieldCheck } from "lucide-react";
import TableSection from "./components/TableSection";
import PaginationSection from "./components/PaginationSection";
import PermissionModal from "./components/PermissionModal";

export default function AdminPermissionsPage() {
  const { pagination, onPageChange, onSizeChange } = usePaginationState();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [data, setData] = useState<PermissionResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionResponse | null>(null);

  // Search local state
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await findAllPermissions({
        ...pagination,
        // Có thể thêm search query vào đây nếu API hỗ trợ
      });
      const pageData = response.data.data;
      setData(pageData.content);
      setTotalElements(pageData.totalElements);
    } catch (error) {
      handleError(error, "Không thể tải danh sách quyền.");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, [pagination]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleCreateOpen = () => {
    setSelectedPermission(null);
    setIsModalOpen(true);
  };

  const handleEdit = (permission: PermissionResponse) => {
    setSelectedPermission(permission);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa quyền hạn này?")) return;

    try {
      await deletePermissionApi(id);
      toast.success("Xóa quyền hạn thành công!");
      fetchPermissions();
    } catch (error) {
      handleError(error, "Xóa quyền hạn thất bại.");
    }
  };

  const handleModalSubmit = async (formData: UpsertPermissionRequest) => {
    setActionLoading(true);
    try {
      if (selectedPermission) {
        // Update
        await updatePermissionApi(selectedPermission.id, formData);
        toast.success("Cập nhật quyền hạn thành công!");
      } else {
        // Create
        await createPermissionApi(formData);
        toast.success("Tạo quyền hạn mới thành công!");
      }
      setIsModalOpen(false);
      fetchPermissions();
    } catch (error) {
      handleError(
        error,
        selectedPermission ? "Cập nhật thất bại" : "Tạo mới thất bại",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Page Header */}
      <AdminPageHeader
        icon={ShieldCheck}
        title="Quản lý quyền hạn"
        description="Thiết lập và quản lý các quyền hạn trong hệ thống."
        searchPlaceholder="Tìm kiếm quyền hạn..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <TableSection
        loading={loading}
        data={data}
        totalElements={totalElements}
        onCreateOpen={handleCreateOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* 4. Pagination Section */}
      <PaginationSection
        page={pagination.page}
        size={pagination.size}
        totalElements={totalElements}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />

      {/* Overlay Modal */}
      <PermissionModal
        key={isModalOpen ? selectedPermission?.id || "create" : "closed"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedPermission}
        loading={actionLoading}
      />
    </div>
  );
}
