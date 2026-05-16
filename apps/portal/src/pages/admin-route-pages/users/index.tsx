import { useState, useEffect, useCallback } from "react";
import { usePaginationState } from "@/hooks/use-pagination-state";
import {
  findAllUsers,
  findUserByKeycloakId,
  assignRoleApi,
} from "@/services/admin/userAdminApi";
import { findAllRoleList } from "@/services/admin/roleAdminApi";
import type { UserSummaryResponse } from "@/types/user/UserSummaryResponse";
import type { UserResponse } from "@/types/user/UserResponse";
import type { RoleResponse } from "@/types/role/RoleResponse";
import { handleError } from "@/lib/utils";
import { toast } from "sonner";

// Sub-components
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import { Users } from "lucide-react";
import TableSection from "./components/TableSection";
import PaginationSection from "./components/PaginationSection";
import UserDetailModal from "./components/UserDetailModal";
import AssignRoleModal from "./components/AssignRoleModal";
import UserAddressModal from "./components/UserAddressModal";

export default function AdminUsersPage() {
  const { pagination, onPageChange, onSizeChange } = usePaginationState();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserSummaryResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);

  // Search local state
  const [searchQuery, setSearchQuery] = useState("");

  // Detail modal state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailUser, setDetailUser] = useState<UserResponse | null>(null);

  // Assign role modal state
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [assignRoleLoading, setAssignRoleLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSummaryResponse | null>(
    null,
  );
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Address modal state
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [addressUser, setAddressUser] = useState<UserSummaryResponse | null>(
    null,
  );

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await findAllUsers({
        ...pagination,
      });
      const pageData = response.data.data;
      setData(pageData.content);
      setTotalElements(pageData.totalElements);
    } catch (error) {
      handleError(error, "Không thể tải danh sách người dùng.");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, [pagination]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Detail
  const handleDetail = async (user: UserSummaryResponse) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    setDetailUser(null);
    try {
      const res = await findUserByKeycloakId(user.keycloakId);
      setDetailUser(res.data.data);
    } catch (error) {
      handleError(error, "Không thể tải thông tin người dùng.");
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Ban
  const handleBan = (user: UserSummaryResponse) => {
    toast.info(
      `Chức năng cấm người dùng "${user.fullName || user.email}" đang được phát triển.`,
    );
  };

  // Assign Role
  const handleAssignRoleOpen = async (user: UserSummaryResponse) => {
    setSelectedUser(user);
    setIsAssignRoleOpen(true);
    setRolesLoading(true);
    try {
      const res = await findAllRoleList();
      setRoles(res.data.data);
    } catch (error) {
      handleError(error, "Không thể tải danh sách chức vụ.");
    } finally {
      setRolesLoading(false);
    }
  };

  const handleAssignRoleSubmit = async (roleId: string, keycloakId: string) => {
    setAssignRoleLoading(true);
    try {
      await assignRoleApi({ roleId, keycloakId });
      toast.success("Gán chức vụ thành công!");
      setIsAssignRoleOpen(false);
      fetchUsers();
    } catch (error) {
      handleError(error, "Gán chức vụ thất bại.");
    } finally {
      setAssignRoleLoading(false);
    }
  };

  // Addresses
  const handleAddressOpen = (user: UserSummaryResponse) => {
    setAddressUser(user);
    setIsAddressOpen(true);
  };

  // Reset Password
  const handleResetPassword = (user: UserSummaryResponse) => {
    toast.info(
      `Chức năng đặt lại mật khẩu cho "${user.fullName || user.email}" đang được phát triển.`,
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Page Header */}
      <AdminPageHeader
        icon={Users}
        title="Quản lý người dùng"
        description="Danh sách người dùng và quản lý tài khoản trong hệ thống."
        searchPlaceholder="Tìm kiếm người dùng..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <TableSection
        loading={loading}
        data={data}
        totalElements={totalElements}
        onDetail={handleDetail}
        onBan={handleBan}
        onAssignRole={handleAssignRoleOpen}
        onResetPassword={handleResetPassword}
        onAddressMenu={handleAddressOpen}
      />

      {/* 4. Pagination Section */}
      <PaginationSection
        page={pagination.page}
        size={pagination.size}
        totalElements={totalElements}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        user={detailUser}
        loading={detailLoading}
      />

      {/* Assign Role Modal */}
      <AssignRoleModal
        key={isAssignRoleOpen ? selectedUser?.keycloakId || "assign" : "closed"}
        isOpen={isAssignRoleOpen}
        onClose={() => setIsAssignRoleOpen(false)}
        onSubmit={handleAssignRoleSubmit}
        user={selectedUser}
        roles={roles}
        loading={assignRoleLoading}
        rolesLoading={rolesLoading}
      />

      {/* User Address Modal */}
      <UserAddressModal
        isOpen={isAddressOpen}
        onClose={() => setIsAddressOpen(false)}
        user={addressUser}
      />
    </div>
  );
}
