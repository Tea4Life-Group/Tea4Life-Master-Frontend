import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Shield, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { findAllPermissionList } from "@/services/admin/permissionAdminApi";
import type { PermissionResponse } from "@/types/permission/PermissionResponse";
import { handleError } from "@/lib/utils";
import { toast } from "sonner";
import {
  createRoleApi,
  updateRoleApi,
  findRoleById,
} from "@/services/admin/roleAdminApi";

// Switch component inline styling since ui/switch is missing
const Switch = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
  </label>
);

export default function RoleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<
    Set<string>
  >(new Set());

  // Group permissions
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionResponse[]> = {};
    permissions.forEach((p) => {
      const group = p.permissionGroup || "Khác";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(p);
    });
    return groups;
  }, [permissions]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const res = await findAllPermissionList();
        setPermissions(res.data.data);

        if (isEdit && id) {
          try {
            const roleRes = await findRoleById(id);
            const actualRole = roleRes.data.data;

            setName(actualRole.name);
            setDescription(actualRole.description || "");

            // Map permissions to ID set
            if (actualRole.permissions) {
              const permIds = new Set(actualRole.permissions.map((p) => p.id));
              setSelectedPermissionIds(permIds);
            }
          } catch (error) {
            handleError(error, "Không thể tải thông tin chức vụ");
            navigate("/admin/roles");
          }
        }
      } catch (error) {
        handleError(error, "Lỗi tải danh sách quyền hạn");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isEdit, id, navigate]);

  const handleTogglePermission = (permissionId: string, checked: boolean) => {
    const newSet = new Set(selectedPermissionIds);
    if (checked) {
      newSet.add(permissionId);
    } else {
      newSet.delete(permissionId);
    }
    setSelectedPermissionIds(newSet);
  };

  const handleToggleGroup = (groupName: string, checked: boolean) => {
    const groupPermissions = groupedPermissions[groupName];
    const newSet = new Set(selectedPermissionIds);

    groupPermissions.forEach((p) => {
      if (checked) {
        newSet.add(p.id);
      } else {
        newSet.delete(p.id);
      }
    });

    setSelectedPermissionIds(newSet);
  };

  const isGroupFullyChecked = (groupName: string) => {
    const groupPermissions = groupedPermissions[groupName];
    return groupPermissions.every((p) => selectedPermissionIds.has(p.id));
  };

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Vui lòng nhập tên chức vụ");
      return;
    }

    const payload = {
      name,
      description,
      permissionIdList: Array.from(selectedPermissionIds),
    };

    setLoading(true);
    try {
      if (isEdit && id) {
        await updateRoleApi(id, payload);
        toast.success("Cập nhật chức vụ thành công!");
      } else {
        await createRoleApi(payload);
        toast.success("Tạo chức vụ mới thành công!");
      }
      navigate("/admin/roles");
    } catch (error) {
      handleError(error, isEdit ? "Cập nhật thất bại" : "Tạo mới thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-emerald-100 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/roles")}
          className="rounded-full hover:bg-emerald-50 text-slate-500"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEdit ? "Chỉnh sửa chức vụ" : "Tạo chức vụ mới"}
          </h1>
          <p className="text-sm text-slate-500">
            Thiết lập thông tin và phân quyền cho chức vụ
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/roles")}>
            Hủy bỏ
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            onClick={handleSubmit}
          >
            <Save className="h-4 w-4" />
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Role Info Section */}
        <Card className="border-emerald-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Thông tin chung
            </CardTitle>
            <CardDescription>Tên và mô tả cho chức vụ này</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên chức vụ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ví dụ: MEMBER, ADMIN"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Mô tả</Label>
                <Input
                  id="desc"
                  placeholder="Mô tả chi tiết về trách nhiệm..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-emerald-600" />
              Phân quyền hệ thống
            </h2>
            <div className="text-sm text-slate-500">
              Đã chọn:{" "}
              <span className="font-bold text-emerald-600">
                {selectedPermissionIds.size}
              </span>{" "}
              quyền
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-emerald-200">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              <p className="text-slate-400 mt-4 text-sm">
                Đang tải danh sách quyền...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([group, groupPerms]) => (
                <Card
                  key={group}
                  className="border-emerald-100/50 shadow-sm overflow-hidden"
                >
                  <div className="bg-emerald-50/50 px-6 py-3 border-b border-emerald-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-700">{group}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 uppercase font-medium">
                        Chọn tất cả
                      </span>
                      <Switch
                        checked={isGroupFullyChecked(group)}
                        onCheckedChange={(checked) =>
                          handleToggleGroup(group, checked)
                        }
                      />
                    </div>
                  </div>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:gap-px bg-emerald-50/30">
                      {groupPerms.map((perm) => (
                        <div
                          key={perm.id}
                          className="flex items-start justify-between p-4 bg-white hover:bg-emerald-50/30 transition-colors border-b md:border-b-0 md:border-r border-emerald-50 last:border-0"
                        >
                          <div className="pr-4 flex-1">
                            <div className="font-medium text-slate-700 text-sm">
                              {perm.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {perm.description}
                            </div>
                          </div>
                          <Switch
                            checked={selectedPermissionIds.has(perm.id)}
                            onCheckedChange={(checked) =>
                              handleTogglePermission(perm.id, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
