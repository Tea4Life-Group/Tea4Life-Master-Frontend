import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, UserCircle, Loader2 } from "lucide-react";
import type { DriverResponse } from "@/types/driver/DriverResponse";
import type { UpsertDriverRequest } from "@/types/driver/UpsertDriverRequest";
import type { UserSummaryResponse } from "@/types/user/UserSummaryResponse";
import { findAllUsers } from "@/services/admin/userAdminApi";
import { useRef } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: DriverResponse | null;
  onSubmit: (data: UpsertDriverRequest, id?: string | number) => Promise<void>;
  loading?: boolean;
}

export default function DriverFormModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  loading,
}: Props) {
  const [formData, setFormData] = useState<UpsertDriverRequest>({
    keycloakId: "",
    fullName: "",
    phone: "",
  });

  // User search
  const [searchQuery, setSearchQuery] = useState("");
  const [userResults, setUserResults] = useState<UserSummaryResponse[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        keycloakId: initialData.keycloakId,
        fullName: initialData.fullName,
        phone: initialData.phone,
      });
      setSearchQuery("");
    } else if (!initialData && isOpen) {
      setFormData({ keycloakId: "", fullName: "", phone: "" });
      setSearchQuery("");
    }
    setUserResults([]);
    setShowDropdown(false);
  }, [initialData, isOpen]);

  // Debounced user search (only for create mode)
  useEffect(() => {
    if (isEditing || !searchQuery.trim()) {
      setUserResults([]);
      setShowDropdown(false);
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await findAllUsers({ page: 1, size: 10, filter: searchQuery.trim() });
        setUserResults(res.data.data?.content || []);
        setShowDropdown(true);
      } catch {
        setUserResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, isEditing]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelectUser = (user: UserSummaryResponse) => {
    setFormData({
      keycloakId: user.keycloakId,
      fullName: user.fullName || "",
      phone: "",
    });
    setSearchQuery(user.fullName || user.email);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, initialData?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white border-emerald-100/50 shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-emerald-50 bg-emerald-50/10">
          <DialogTitle className="text-xl font-bold text-emerald-900">
            {isEditing ? "Cập nhật tài xế" : "Thêm tài xế mới"}
          </DialogTitle>
        </DialogHeader>

        <form id="driver-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User search (create mode only) */}
          {!isEditing && (
            <div className="space-y-2" ref={dropdownRef}>
              <Label className="text-emerald-900 font-semibold">
                Tìm người dùng
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (userResults.length > 0) setShowDropdown(true);
                  }}
                  className="pl-10 border-emerald-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-400"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-emerald-500" />
                )}
                {showDropdown && userResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                    {userResults.map((user) => (
                      <button
                        key={user.keycloakId}
                        type="button"
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-emerald-50 transition-colors text-sm"
                        onClick={() => handleSelectUser(user)}
                      >
                        <UserCircle className="h-5 w-5 text-slate-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">
                            {user.fullName || "Chưa có tên"}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="keycloakId" className="text-emerald-900 font-semibold">
              Keycloak ID
            </Label>
            <Input
              id="keycloakId"
              required
              readOnly={isEditing}
              placeholder="UUID keycloak"
              value={formData.keycloakId}
              onChange={(e) => setFormData({ ...formData, keycloakId: e.target.value })}
              className={`border-emerald-100 focus-visible:ring-emerald-500 ${isEditing ? "bg-slate-50 cursor-default" : ""}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-emerald-900 font-semibold">
              Họ và tên
            </Label>
            <Input
              id="fullName"
              required
              placeholder="Nguyễn Văn B"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="border-emerald-100 focus-visible:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-emerald-900 font-semibold">
              Số điện thoại
            </Label>
            <Input
              id="phone"
              required
              placeholder="0909123456"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="border-emerald-100 focus-visible:ring-emerald-500"
            />
          </div>
        </form>

        <DialogFooter className="p-6 pt-4 border-t border-emerald-50 bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-emerald-200 text-emerald-800"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="driver-form"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? "Đang xử lý..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
