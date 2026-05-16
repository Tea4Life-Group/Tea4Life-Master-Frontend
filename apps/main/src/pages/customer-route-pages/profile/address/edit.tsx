import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Phone, ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { AddressMapPicker } from "@/components/custom/AddressMapPicker";
import {
  updateMyAddressApi,
  findMyAddressByIdApi,
} from "@/services/addressApi";
import { toast } from "sonner";
import type { AddressType } from "@/types/address/CreateAddressRequest";

export default function EditAddressPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [addressForm, setAddressForm] = useState({
    receiverName: "",
    phone: "",
    province: "",
    ward: "",
    detail: "",
    latitude: 0,
    longitude: 0,
    addressType: "HOME" as AddressType,
    isDefault: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchAddressDetails = async () => {
      if (!id) return;
      try {
        const res = await findMyAddressByIdApi(id);
        if (res.data && res.data.data) {
          const addr = res.data.data;
          setAddressForm({
            receiverName: addr.receiverName,
            phone: addr.phone,
            province: addr.province,
            ward: addr.ward,
            detail: addr.detail,
            latitude: addr.latitude || 0,
            longitude: addr.longitude || 0,
            addressType: addr.addressType as AddressType,
            isDefault: addr.isDefault,
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin địa chỉ:", error);
        toast.error("Không thể tải thông tin địa chỉ.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchAddressDetails();
  }, [id]);

  const handleSave = async () => {
    // Basic validation
    if (
      !addressForm.receiverName ||
      !addressForm.phone ||
      !addressForm.detail
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (!id) return;

    setIsLoading(true);
    try {
      const response = await updateMyAddressApi(id, addressForm);
      if (response.data && !response.data.errorCode) {
        toast.success("Cập nhật địa chỉ thành công!");
        navigate("/profile/address");
      } else {
        toast.error(response.data.errorMessage || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ", error);
      toast.error("Lỗi khi cập nhật địa chỉ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-emerald-100 shadow-sm max-w-6xl mx-auto">
        <CardHeader className="pb-4 border-b border-emerald-50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile/address")}
              className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle className="text-emerald-800 text-xl flex items-center gap-2">
                Chỉnh sửa địa chỉ
              </CardTitle>
              <CardDescription>
                Cập nhật thông tin nhận hàng và vị trí định vị
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex flex-col gap-8">
            {/* 1. Bản đồ Map Picker có Autocomplete (Ở trên cùng) */}
            <div className="space-y-3">
              <div className="h-[450px]">
                <AddressMapPicker
                  initialLatitude={addressForm.latitude || undefined}
                  initialLongitude={addressForm.longitude || undefined}
                  onLocationSelect={(data) => {
                    setAddressForm((prev) => ({
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

              {/* Khối hướng dẫn hiển thị dưới map */}
              <div className="bg-emerald-50/50 px-4 py-2.5 rounded-xl border border-emerald-100 text-sm flex items-center gap-3">
                <div className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <div>
                  <p className="font-bold text-emerald-950 text-[13px] uppercase tracking-wider">
                    Ghim vị trí của bạn
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                    Gõ tìm kiếm địa danh, hoặc kéo thả chấm đỏ trên bản đồ để hệ
                    thống tự động điền địa chỉ.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Form thông tin text (Nằm bên dưới) */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold">
                  Tên người nhận
                </Label>
                <Input
                  placeholder="Họ và tên người nhận"
                  className="border-emerald-100"
                  value={addressForm.receiverName}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      receiverName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">
                    Số điện thoại
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    <Input
                      placeholder="09xx xxx xxx"
                      className="pl-10 border-emerald-100"
                      value={addressForm.phone}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">
                    Loại địa chỉ
                  </Label>
                  <select
                    className="w-full border-emerald-100 rounded-md border text-sm p-2 outline-none focus:border-emerald-500 bg-white"
                    value={addressForm.addressType}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
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

              <hr className="border-emerald-50" />

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  Kết quả định vị (Tự động điền)
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Tỉnh/Thành phố
                    </Label>
                    <Input
                      readOnly
                      placeholder="Tỉnh/Thành phố"
                      className="border-none bg-emerald-50 text-emerald-800 focus-visible:ring-0 cursor-default"
                      value={addressForm.province}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Phường/Xã
                    </Label>
                    <Input
                      readOnly
                      placeholder="Phường/Xã"
                      className="border-none bg-emerald-50 text-emerald-800 focus-visible:ring-0 cursor-default"
                      value={addressForm.ward}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">
                    Số nhà, Tên đường (Tự động điền)
                  </Label>
                  <Input
                    readOnly
                    placeholder="Số nhà, đường/ngõ chi tiết..."
                    className="border-none bg-emerald-50 text-emerald-800 focus-visible:ring-0 cursor-default"
                    value={addressForm.detail}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  checked={addressForm.isDefault}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      isDefault: e.target.checked,
                    })
                  }
                />
                <Label
                  htmlFor="isDefault"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-emerald-900"
                >
                  Đặt làm địa chỉ mặc định
                </Label>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/profile/address")}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? "Đang lưu..." : "Hoàn tất lưu"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
