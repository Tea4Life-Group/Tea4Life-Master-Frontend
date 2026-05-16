import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X } from "lucide-react";
import type { RoleResponse } from "@/types/role/RoleResponse";
import type { UserSummaryResponse } from "@/types/user/UserSummaryResponse";

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roleId: string, keycloakId: string) => void;
  user: UserSummaryResponse | null;
  roles: RoleResponse[];
  loading?: boolean;
  rolesLoading?: boolean;
}

const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  roles,
  loading,
  rolesLoading,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId || !user) return;
    onSubmit(selectedRoleId, user.keycloakId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] rounded-[2.5rem] border-emerald-50 shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-emerald-50/50 border-b border-emerald-100">
          <div>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              Gán chức vụ
            </DialogTitle>
            <DialogDescription className="text-slate-500 italic mt-1">
              Chọn chức vụ để gán cho{" "}
              <span className="font-semibold text-slate-700">
                {user?.fullName || user?.email}
              </span>
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
              Chức vụ <span className="text-red-500">*</span>
            </Label>
            {rolesLoading ? (
              <div className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-slate-50/50 border border-slate-200">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                <span className="text-sm text-slate-400">
                  Đang tải danh sách chức vụ...
                </span>
              </div>
            ) : (
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="rounded-2xl border-slate-200 focus:ring-emerald-500 h-12 bg-slate-50/50 px-4">
                  <SelectValue placeholder="Chọn chức vụ..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{role.name}</span>
                        {role.description && (
                          <span className="text-xs text-slate-400">
                            {role.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter className="pt-6 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-600 gap-2 h-12 font-bold transition-all active:scale-95"
            >
              <X className="h-4 w-4" />
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedRoleId}
              className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 gap-2 h-12 font-bold transition-all active:scale-95"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Xác nhận
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignRoleModal;
