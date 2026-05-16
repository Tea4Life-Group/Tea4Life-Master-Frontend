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
import { useState, useEffect } from "react";
import type { StoreResponse } from "@/types/store/StoreResponse";
import type { UpsertStoreRequest } from "@/types/store/UpsertStoreRequest";
import { AddressMapPicker } from "@/components/custom/AddressMapPicker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: StoreResponse | null;
  onSubmit: (data: UpsertStoreRequest, id?: string | number) => Promise<void>;
  loading?: boolean;
}

export default function StoreFormModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  loading,
}: Props) {
  const [formData, setFormData] = useState<UpsertStoreRequest>({
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    if (initialData && isOpen) {
      // eslint-disable-next-line
      setFormData({
        name: initialData.name,
        address: initialData.address,
        latitude: initialData.latitude,
        longitude: initialData.longitude,
      });
    } else if (!initialData && isOpen) {
      setFormData({ name: "", address: "", latitude: 0, longitude: 0 });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, initialData?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl sm:max-w-5xl w-[90vw] bg-white border-emerald-100/50 shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-emerald-50 bg-emerald-50/10 shrink-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-emerald-900">
            {initialData ? "Cập nhật cửa hàng" : "Thêm mới cửa hàng"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <form id="store-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold" htmlFor="name">
                  Tên cửa hàng
                </Label>
                <Input
                  id="name"
                  required
                  placeholder="Ví dụ: Tea4Life Quận 1"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border-emerald-100 focus-visible:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold" htmlFor="address">
                  Địa chỉ chi tiết (Từ bản đồ)
                </Label>
                <Input
                  id="address"
                  readOnly
                  placeholder="Số nhà, đường, phường, quận..."
                  value={formData.address}
                  className="border-none bg-emerald-50 text-emerald-800 focus-visible:ring-0 cursor-default"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold" htmlFor="latitude">
                    Vĩ độ
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    readOnly
                    className="border-none bg-emerald-50 text-emerald-800 focus-visible:ring-0 cursor-default"
                    value={
                      formData.latitude
                        ? Number(formData.latitude).toFixed(4)
                        : formData.latitude
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold" htmlFor="longitude">
                    Kinh độ
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    readOnly
                    className="border-none bg-emerald-50 text-emerald-800 focus-visible:ring-0 cursor-default"
                    value={
                      formData.longitude
                        ? Number(formData.longitude).toFixed(4)
                        : formData.longitude
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-[450px]">
                <AddressMapPicker
                  initialLatitude={formData.latitude || undefined}
                  initialLongitude={formData.longitude || undefined}
                  onLocationSelect={(data) => {
                    setFormData((prev) => ({
                      ...prev,
                      address: data.addressText,
                      latitude: data.latitude,
                      longitude: data.longitude,
                    }));
                  }}
                />
              </div>
              <div className="bg-emerald-50/50 px-4 py-2.5 rounded-xl border border-emerald-100 text-sm flex items-center gap-3">
                <div className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <div>
                  <p className="font-bold text-emerald-950 text-[13px] uppercase tracking-wider">
                    Ghim vị trí của cửa hàng
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                    Kéo thả ghim hoặc tìm kiếm trên bản đồ để tự động điền địa chỉ và tọa độ phía trên.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-emerald-50 shrink-0 bg-white">
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
            form="store-form"
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
