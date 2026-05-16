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
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PermissionResponse } from "@/types/permission/PermissionResponse";
import type { UpsertPermissionRequest } from "@/types/permission/UpsertPermissionRequest";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpsertPermissionRequest) => void;
  initialData?: PermissionResponse | null;
  loading?: boolean;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const [formData, setFormData] = useState<UpsertPermissionRequest>({
    name: initialData?.name || "",
    permissionGroup: initialData?.permissionGroup || "",
    description: initialData?.description || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Tên quyền không được để trống";
    if (!formData.permissionGroup.trim())
      newErrors.permissionGroup = "Nhóm quyền không được để trống";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-emerald-50 shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-emerald-50/50 border-b border-emerald-100">
          <div>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              {initialData ? "Cập nhật quyền hạn" : "Tạo quyền hạn mới"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 italic mt-1">
              {initialData
                ? "Chỉnh sửa thông tin quyền hạn hiện có trong hệ thống."
                : "Điền thông tin để đăng ký một quyền hạn mới trong hệ thống."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <Label
                htmlFor="name"
                className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1"
              >
                Tên quyền hạn <span className="text-red-500">*</span>
              </Label>
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  formData.name.length >= 250
                    ? "bg-red-50 text-red-500"
                    : "bg-slate-100 text-slate-400",
                )}
              >
                {formData.name.length}/255
              </span>
            </div>
            <div className="w-full overflow-hidden">
              <Textarea
                id="name"
                placeholder="Vd: VIEW_DASHBOARD, MANAGE_USERS..."
                value={formData.name}
                onChange={handleChange}
                maxLength={255}
                className="w-full max-w-full rounded-2xl border-slate-200 focus:ring-emerald-500 min-h-[48px] bg-slate-50/50 px-4 py-3 resize-none break-all"
              />
            </div>
            {errors.name && (
              <p className="text-xs font-medium text-red-500 ml-1 animate-in slide-in-from-top-1">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <Label
                htmlFor="permissionGroup"
                className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1"
              >
                Nhóm quyền <span className="text-red-500">*</span>
              </Label>
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  formData.permissionGroup.length >= 250
                    ? "bg-red-50 text-red-500"
                    : "bg-slate-100 text-slate-400",
                )}
              >
                {formData.permissionGroup.length}/255
              </span>
            </div>
            <div className="w-full overflow-hidden">
              <Textarea
                id="permissionGroup"
                placeholder="Vd: USERS, PRODUCTS,..."
                value={formData.permissionGroup}
                onChange={handleChange}
                maxLength={255}
                className="w-full max-w-full rounded-2xl border-slate-200 focus:ring-emerald-500 min-h-[48px] bg-slate-50/50 px-4 py-3 resize-none break-all"
              />
            </div>
            {errors.permissionGroup && (
              <p className="text-xs font-medium text-red-500 ml-1 animate-in slide-in-from-top-1">
                {errors.permissionGroup}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <Label
                htmlFor="description"
                className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1"
              >
                Mô tả chi tiết
              </Label>
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  formData.description.length >= 250
                    ? "bg-red-50 text-red-500"
                    : "bg-slate-100 text-slate-400",
                )}
              >
                {formData.description.length}/255
              </span>
            </div>
            <div className="w-full overflow-hidden">
              <Textarea
                id="description"
                placeholder="Nhập mô tả về phạm vi và chức năng của quyền này..."
                rows={4}
                value={formData.description}
                onChange={handleChange}
                maxLength={255}
                className="w-full max-w-full rounded-2xl border-slate-200 focus:ring-emerald-500 bg-slate-50/50 px-4 py-3 resize-none break-all"
              />
            </div>
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
              disabled={loading}
              className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 gap-2 h-12 font-bold transition-all active:scale-95"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {initialData ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionModal;
