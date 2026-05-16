import { useState, useEffect, useCallback } from "react";
import { usePaginationState } from "@/hooks/use-pagination-state";
import { findAllRoles, deleteRoleApi } from "@/services/admin/roleAdminApi";
import type { RoleResponse } from "@/types/role/RoleResponse";
import { handleError } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Sub-components
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import { Lock } from "lucide-react";
import TableSection from "./components/TableSection";
import PaginationSection from "./components/PaginationSection";

export default function AdminRolesPage() {
  const { pagination, onPageChange, onSizeChange } = usePaginationState();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RoleResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);

  // Search local state
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await findAllRoles({
        ...pagination,
        // Có thể thêm search query vào đây nếu API hỗ trợ
      });
      const pageData = response.data.data;
      setData(pageData.content);
      setTotalElements(pageData.totalElements);
    } catch (error) {
      handleError(error, "Không thể tải danh sách chức vụ.");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, [pagination]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCreate = () => {
    navigate("/admin/roles/create");
  };

  const handleEdit = (role: RoleResponse) => {
    navigate(`/admin/roles/edit/${role.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chức vụ này?")) return;

    try {
      await deleteRoleApi(id);
      toast.success("Xóa chức vụ thành công!");
      fetchRoles();
    } catch (error) {
      handleError(error, "Xóa chức vụ thất bại.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Page Header */}
      <AdminPageHeader
        icon={Lock}
        title="Quản lý chức vụ"
        description="Thiết lập và phân cấp các chức vụ trong hệ thống."
        searchPlaceholder="Tìm kiếm chức vụ..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <TableSection
        loading={loading}
        data={data}
        totalElements={totalElements}
        onCreate={handleCreate}
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
    </div>
  );
}
