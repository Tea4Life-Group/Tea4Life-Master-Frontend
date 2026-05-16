import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddressMapPicker } from "@/components/custom/AddressMapPicker";
import {
  MapPin,
  Phone,
  User,
  Edit2,
  Trash2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { UserSummaryResponse } from "@/types/user/UserSummaryResponse";
import type { AddressResponse } from "@/types/address/AddressResponse";
import type {
  CreateAddressRequest,
  AddressType,
} from "@/types/address/CreateAddressRequest";
import {
  findAddressesByKeycloakId,
  updateAddress,
  deleteAddress,
} from "@/services/admin/addressAdminApi";

interface UserAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSummaryResponse | null;
}

const UserAddressModal: React.FC<UserAddressModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [view, setView] = useState<"list" | "edit">("list");

  // Edit State
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | number | null
  >(null);
  const [editForm, setEditForm] = useState<CreateAddressRequest>({
    receiverName: "",
    phone: "",
    province: "",
    ward: "",
    detail: "",
    latitude: 0,
    longitude: 0,
    addressType: "HOME",
    isDefault: false,
  });

  const fetchAddresses = async (keycloakId: string) => {
    setLoading(true);
    try {
      const res = await findAddressesByKeycloakId(keycloakId);
      setAddresses(res.data.data);
    } catch (error) {
      toast.error("Không thể tải danh sách địa chỉ.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      setView("list");
      fetchAddresses(user.keycloakId);
    }
  }, [isOpen, user]);

  const handleEditClick = (address: AddressResponse) => {
    setSelectedAddressId(address.id);
    setEditForm({
      receiverName: address.receiverName,
      phone: address.phone,
      province: address.province,
      ward: address.ward,
      detail: address.detail,
      latitude: address.latitude || 0,
      longitude: address.longitude || 0,
      addressType: address.addressType,
      isDefault: address.isDefault,
    });
    setView("edit");
  };

  const handleSaveEdit = async () => {
    if (!user || !selectedAddressId) return;

    // Validate
    if (!editForm.receiverName || !editForm.phone || !editForm.detail) {
      toast.error("Vui lòng điền đủ thông tin tên, SĐT, và chi tiết địa chỉ!");
      return;
    }

    setLoading(true);
    try {
      await updateAddress(user.keycloakId, selectedAddressId, editForm);
      toast.success("Cập nhật địa chỉ thành công!");
      setView("list");
      fetchAddresses(user.keycloakId);
    } catch (error) {
      toast.error("Cập nhật địa chỉ thất bại.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId: string | number) => {
    if (!user) return;
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;

    setLoading(true);
    try {
      await deleteAddress(user.keycloakId, addressId);
      toast.success("Xóa địa chỉ thành công!");
      fetchAddresses(user.keycloakId);
    } catch (error) {
      toast.error("Xóa địa chỉ thất bại.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setView("list");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl sm:max-w-5xl w-[90vw] bg-white border-emerald-100/50 shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-emerald-50 bg-emerald-50/10">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-emerald-900">
            {view === "edit" ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -ml-2 text-emerald-700"
                  onClick={() => setView("list")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                Chỉnh sửa địa chỉ
              </>
            ) : (
              <>
                <MapPin className="h-5 w-5 text-emerald-600" />
                Quản lý địa chỉ - {user?.fullName || user?.email}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 min-h-[400px] flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700 mt-2">
                Đang tải...
              </p>
            </div>
          ) : view === "list" ? (
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-emerald-200">
                  <p className="text-emerald-700/70 font-medium">
                    Người dùng này chưa có địa chỉ nào.
                  </p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="group flex items-start justify-between p-4 rounded-xl border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all"
                  >
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-emerald-900">
                            {addr.addressType === "HOME"
                              ? "Nhà riêng"
                              : addr.addressType === "OFFICE"
                                ? "Văn phòng"
                                : "Khác"}
                          </p>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-500 text-white rounded-full">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-emerald-700 pb-1">
                          <span className="flex items-center gap-1 font-medium">
                            <User className="h-3 w-3" /> {addr.receiverName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {addr.phone}
                          </span>
                        </div>
                        <p className="text-sm text-emerald-600 border-t border-emerald-50 pt-1">
                          {addr.detail}, {addr.ward}, {addr.province}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(addr)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(addr.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Edit Form View
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
              <div className="space-y-3">
                <div className="h-[450px]">
                  <AddressMapPicker
                    initialLatitude={editForm.latitude || undefined}
                    initialLongitude={editForm.longitude || undefined}
                    onLocationSelect={(data) => {
                      setEditForm((prev) => ({
                        ...prev,
                        province: data.province,
                        ward: data.ward,
                        detail: data.addressText,
                        latitude: data.latitude,
                        longitude: data.longitude,
                      }));
                    }}
                  />
                </div>
                <div className="bg-emerald-50/50 px-4 py-2.5 rounded-xl border border-emerald-100 text-sm flex items-center gap-3">
                  <div className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-950 text-[13px] uppercase tracking-wider">
                      Ghim vị trí của người dùng
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      Kéo thả ghim hoặc tìm kiếm để tự động điền địa chỉ.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">
                    Tên người nhận
                  </Label>
                  <Input
                    value={editForm.receiverName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, receiverName: e.target.value })
                    }
                    className="border-emerald-100 focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">
                    Số điện thoại
                  </Label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="border-emerald-100 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">
                    Tỉnh/TP
                  </Label>
                  <Input
                    readOnly
                    value={editForm.province}
                    className="border-none bg-emerald-50 text-emerald-800 focus-visible:ring-0 cursor-default"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">
                    Phường/Xã
                  </Label>
                  <Input
                    readOnly
                    value={editForm.ward}
                    className="border-none bg-emerald-50 text-emerald-800 focus-visible:ring-0 cursor-default"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">Loại</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-emerald-100 bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editForm.addressType}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        addressType: e.target.value as AddressType,
                      })
                    }
                  >
                    <option value="HOME">Nhà riêng</option>
                    <option value="OFFICE">Văn phòng</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold">
                  Địa chỉ chi tiết (Sổ nhà, tên đường)
                </Label>
                <Input
                  readOnly
                  value={editForm.detail}
                  className="border-none bg-emerald-50 text-emerald-800 focus-visible:ring-0 cursor-default"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2 pb-4">
                <input
                  type="checkbox"
                  id="adminIsDefault"
                  className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  checked={editForm.isDefault}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isDefault: e.target.checked })
                  }
                />
                <Label
                  htmlFor="adminIsDefault"
                  className="text-sm font-medium cursor-pointer text-emerald-900"
                >
                  Đặt làm địa chỉ mặc định
                </Label>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-emerald-50">
                <Button
                  variant="outline"
                  onClick={() => setView("list")}
                  className="border-emerald-200 text-emerald-800"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserAddressModal;
