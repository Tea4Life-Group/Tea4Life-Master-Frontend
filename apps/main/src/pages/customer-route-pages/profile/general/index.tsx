import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import type { UserProfileResponse } from "@/types/user/UserProfileResponse";
import { useAppDispatch } from "@/features/store";
import { executeUpdateProfile } from "@/features/auth/authThunk";
import { toast } from "sonner";

interface ProfileContext {
  profile: UserProfileResponse | null;
  loading: boolean;
  refetchProfile: () => Promise<void>;
}

export default function GeneralPage() {
  const { profile, loading, refetchProfile } =
    useOutletContext<ProfileContext>();
  const dispatch = useAppDispatch();

  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER" | "">("");

  // Khi profile load xong → fill state
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName || "");
    setPhone(profile.phone || "");
    setDob(profile.dob || "");
    setGender(profile.gender || "");
  }, [profile]);

  if (loading) {
    return (
      <div className="bg-white border-2 border-[#1A4331]/15">
        <div className="py-12 flex justify-center">
          <div className="h-6 w-6 animate-spin border-2 border-[#1A4331] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-[#1A4331]/15">
      <div className="px-6 py-4 border-b-2 border-[#1A4331]/10">
        <h2 className="text-[#1A4331] font-bold text-sm uppercase tracking-wider">
          Thông tin cơ bản
        </h2>
        <p className="text-[#8A9A7A] text-xs mt-1">
          Cập nhật thông tin cá nhân của bạn để đồng bộ với hồ sơ hệ thống.
        </p>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullname">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullname"
              placeholder="Nhập họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border-2 border-[#1A4331]/20 bg-[#F8F5F0] rounded-none focus-visible:ring-0 focus-visible:border-[#1A4331] text-sm"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-emerald-100 focus-visible:ring-emerald-500"
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dob">
              Ngày sinh <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="dob"
                type="date"
                max="2010-12-31"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="border-2 border-[#1A4331]/20 bg-[#F8F5F0] rounded-none focus-visible:ring-0 focus-visible:border-[#1A4331] text-sm pl-10"
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A9A7A]" />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">
              Giới tính <span className="text-red-500">*</span>
            </Label>
            <Select
              value={gender}
              onValueChange={(val: "MALE" | "FEMALE" | "OTHER") =>
                setGender(val)
              }
            >
              <SelectTrigger className="border-2 border-[#1A4331]/20 bg-[#F8F5F0] rounded-none text-sm focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Nam</SelectItem>
                <SelectItem value="FEMALE">Nữ</SelectItem>
                <SelectItem value="OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Thông tin hệ thống */}
        {profile?.id && (
          <div className="p-4 bg-[#F8F5F0] border border-[#1A4331]/10 space-y-2">
            <p className="text-xs text-[#8A9A7A] font-bold uppercase tracking-wider">
              Thông tin hệ thống
            </p>
            <div className="grid grid-cols-2 text-sm">
              <span className="text-[#1A4331]/70">Profile ID:</span>
              <span className="font-mono text-[#1A4331] text-right">
                #{profile.id}
              </span>
            </div>
          </div>
        )}

        <Button
          disabled={saving}
          onClick={async () => {
            if (!fullName.trim() || !phone.trim() || !dob || !gender) {
              toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
              return;
            }
            setSaving(true);
            try {
              await dispatch(
                executeUpdateProfile({
                  fullName: fullName.trim(),
                  phone: phone.trim(),
                  dob,
                  gender: gender as "MALE" | "FEMALE" | "OTHER",
                }),
              ).unwrap();
              await refetchProfile();
              toast.success("Cập nhật hồ sơ thành công!");
            } catch {
              toast.error("Cập nhật thất bại. Vui lòng thử lại.");
            } finally {
              setSaving(false);
            }
          }}
          className="w-full md:w-auto bg-[#1A4331] hover:bg-[#8A9A7A] text-[#F8F5F0] rounded-none gap-2 font-bold"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Lưu hồ sơ
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
