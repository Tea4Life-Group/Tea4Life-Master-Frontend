import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Mail, Phone, Calendar, User, Shield, KeyRound } from "lucide-react";
import type { UserResponse } from "@/types/user/UserResponse";
import { getMediaUrl } from "@/lib/utils";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserResponse | null;
  loading: boolean;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
  loading,
}) => {
  const genderLabel = (gender: string) => {
    switch (gender) {
      case "MALE":
        return "Nam";
      case "FEMALE":
        return "Nữ";
      case "OTHER":
        return "Khác";
      default:
        return gender || "—";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[720px] rounded-[2.5rem] border-emerald-50 shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-8 py-6 bg-emerald-50/50 border-b border-emerald-100">
          <div>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              Chi tiết người dùng
            </DialogTitle>
            <DialogDescription className="text-slate-500 italic mt-1">
              Thông tin chi tiết tài khoản người dùng trong hệ thống.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="px-8 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              <p className="text-slate-400 mt-4 text-sm">Đang tải...</p>
            </div>
          ) : user ? (
            <div className="space-y-4">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4 pb-4 border-b border-emerald-100/50">
                <div className="h-14 w-14 rounded-2xl bg-emerald-100 overflow-hidden flex items-center justify-center shrink-0">
                  {user.avatarUrl ? (
                    <img
                      src={getMediaUrl(user.avatarUrl)}
                      alt={user.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-emerald-600 font-bold text-lg">
                      {user.fullName
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {user.fullName || "—"}
                  </h3>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>

              {/* Info Grid - 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <InfoRow
                  icon={<KeyRound className="h-4 w-4" />}
                  label="Keycloak ID"
                  value={user.keycloakId || "—"}
                />
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={user.email}
                />
                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Số điện thoại"
                  value={user.phone || "—"}
                />
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Ngày sinh"
                  value={user.dob || "—"}
                />
                <InfoRow
                  icon={<User className="h-4 w-4" />}
                  label="Giới tính"
                  value={genderLabel(user.gender)}
                />
                <InfoRow
                  icon={<Shield className="h-4 w-4" />}
                  label="Chức vụ"
                  value={user.roleName || "—"}
                />
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8">
              Không tìm thấy thông tin người dùng.
            </p>
          )}

          <div className="pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-600 gap-2 h-12 font-bold transition-all active:scale-95"
            >
              <X className="h-4 w-4" />
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-slate-50/70 hover:bg-emerald-50/40 transition-colors">
    <div className="text-emerald-500 shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-700 truncate">{value}</p>
    </div>
  </div>
);

export default UserDetailModal;
