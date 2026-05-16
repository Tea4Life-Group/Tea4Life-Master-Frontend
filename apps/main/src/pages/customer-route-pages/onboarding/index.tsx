import React, { useState, useRef, type FormEvent } from "react";
import {
  Camera,
  LogOut,
  Loader2,
  User,
  Phone,
  UserCircle,
  ChevronRight,
} from "lucide-react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { handleUpload } from "@/services/storageApi";
import { useAppDispatch } from "@/features/store";
import keycloak from "@/lib/keycloak";
import type { OnboardingRequest } from "@/types/user/OnboardingRequest";
import { executeOnboarding } from "@/features/auth/authThunk";
import { useAuth } from "@/features/auth/useAuth";
import ImageCropperComponent from "@/components/custom/ImageCropperComponent";

export default function OnboardingPage() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAuth();

  // --- State quản lý Form ---
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER" | "">("");

  // --- State quản lý File & UI cục bộ ---
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false); // Vẫn dùng cho bước upload S3
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- State cho Image Cropper ---
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const AVATAR_MAX_SIZE = 150;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Vui lòng chọn hình ảnh hợp lệ",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: "Ảnh không được vượt quá 5MB" }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.avatar;
      return next;
    });

    // Kiểm tra kích thước ảnh để quyết định có cần crop không
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      if (
        img.width > AVATAR_MAX_SIZE ||
        img.height > AVATAR_MAX_SIZE ||
        img.width !== img.height
      ) {
        // Ảnh to hoặc không vuông → mở cropper
        setCropperSrc(objectUrl);
        setCropperOpen(true);
      } else {
        // Ảnh nhỏ và vuông → dùng trực tiếp
        setAvatarFile(file);
        setAvatarPreview(objectUrl);
      }
    };
    img.src = objectUrl;

    // Reset input để có thể chọn lại cùng 1 file
    e.target.value = "";
  };

  const handleCropComplete = (croppedFile: File) => {
    setAvatarFile(croppedFile);
    setAvatarPreview(URL.createObjectURL(croppedFile));
    setCropperOpen(false);
    setCropperSrc(null);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    if (!dob) newErrors.dob = "Vui lòng chọn ngày sinh";
    if (!gender) newErrors.gender = "Vui lòng chọn giới tính";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      let avatarKey = "";

      // 1. Upload ảnh lên thư mục temp của S3
      if (avatarFile) {
        setIsUploading(true);
        const key = await handleUpload(avatarFile);
        setIsUploading(false);

        if (!key) throw new Error("Upload failed");
        avatarKey = key;
      }

      const request: OnboardingRequest = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        dob,
        gender: gender as "MALE" | "FEMALE" | "OTHER",
        avatarKey,
      };

      /**
       * 2. Gọi Async Thunk
       * Luồng: Post Onboarding -> Check Status (Retry 10 lần)
       * .unwrap() giúp bắt lỗi nếu Thunk bị Rejected
       */
      await dispatch(executeOnboarding(request)).unwrap();
    } catch (err) {
      console.error("[Tea4Life] Lỗi Onboarding:", err);
      setErrors((prev) => ({
        ...prev,
        submit:
          "Đã có lỗi xảy ra trong quá trình xử lý hồ sơ, vui lòng thử lại sau.",
      }));
    }
  };

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-[#1A4331] font-mono text-[#1A4331] overflow-hidden">
      {/* Background pixel grid pattern (full page) */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#F8F5F0 1px, transparent 1px), linear-gradient(90deg, #F8F5F0 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative shapes */}
      <div className="absolute top-6 left-6 w-20 h-20 border-4 border-[#8A9A7A]/20 rotate-45" />
      <div className="absolute top-12 left-12 w-8 h-8 bg-[#8A9A7A]/10 rotate-45" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-4 border-[#8A9A7A]/15 rotate-12" />
      <div className="absolute bottom-12 right-12 w-6 h-6 bg-[#8A9A7A]/10 rotate-12" />
      <div className="absolute top-1/4 right-[45%] w-10 h-10 border-2 border-[#8A9A7A]/10 rotate-45" />
      <div className="absolute bottom-1/3 left-[5%] w-14 h-14 border-2 border-[#8A9A7A]/10 -rotate-12" />

      {/* CỘT TRÁI — Thông tin */}
      <div className="relative z-10 w-full md:w-[45%] lg:w-[40%] p-8 md:p-12 lg:p-16 flex flex-col justify-center text-[#F8F5F0]">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <img
            src="/logo/logo.png"
            alt="Tea4Life"
            className="h-12 w-12 object-contain"
          />
          <span className="text-xl font-bold pixel-text uppercase tracking-wide">
            Tea4Life
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 pixel-text">
          Gia nhập cộng đồng <br />
          <span className="text-[#8A9A7A]">[ Trà Việt ]</span> <br />
          lớn nhất miền Nam.
        </h1>
        <p className="text-[#F8F5F0]/60 text-sm md:text-base max-w-sm leading-relaxed">
          Hơn 10,000 người yêu trà đang chờ đón bạn. Khám phá những hương vị độc
          bản và kết nối cùng tri kỷ.
        </p>

        {/* Decorative divider */}
        <div className="flex items-center gap-2 mt-8">
          <div className="h-1 w-8 bg-[#8A9A7A]" />
          <div className="h-1 w-4 bg-[#8A9A7A]/50" />
          <div className="h-1 w-2 bg-[#8A9A7A]/30" />
        </div>
      </div>

      {/* CỘT PHẢI — Form */}
      <div className="relative z-10 w-full md:w-[55%] lg:w-[60%] flex items-center justify-center p-6 md:p-10 lg:p-16">
        <div className="w-full max-w-lg bg-[#F8F5F0] border-2 border-[#F8F5F0]/50 p-8 md:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
          <div className="mb-8">
            <h2 className="text-xl font-black mb-2 text-[#1A4331] pixel-text">
              Hoàn tất hồ sơ
            </h2>
            <p className="text-[#8A9A7A] text-sm">
              Chúng tôi cần thêm một vài thông tin để bắt đầu trải nghiệm cùng
              bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Section */}
            <div className="flex items-center gap-4 p-3.5 bg-[#1A4331]/5 border-2 border-[#1A4331]/15 transition-all hover:border-[#1A4331]/30">
              <div className="relative shrink-0">
                <Avatar className="h-16 w-16 rounded-none border-2 border-[#1A4331]">
                  <AvatarImage
                    src={avatarPreview || ""}
                    className="object-cover rounded-none"
                  />
                  <AvatarFallback className="bg-[#8A9A7A]/20 text-[#1A4331] rounded-none">
                    <UserCircle className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 h-6 w-6 bg-[#1A4331] text-[#F8F5F0] flex items-center justify-center border-2 border-[#F8F5F0] hover:bg-[#8A9A7A] transition-colors active:translate-y-px"
                >
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1A4331]">Ảnh đại diện</p>
                <p className="text-xs text-[#8A9A7A] mt-0.5">
                  Ảnh chân dung rõ mặt giúp cộng đồng kết nối tốt hơn.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                {errors.avatar && (
                  <p className="text-xs font-bold text-red-600 mt-1">
                    {errors.avatar}
                  </p>
                )}
              </div>
            </div>

            {/* Inputs Section */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="fullName"
                  className="text-xs font-bold text-[#1A4331]/60 uppercase tracking-widest"
                >
                  Họ và tên <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A9A7A]" />
                  <Input
                    id="fullName"
                    placeholder="Nguyễn Văn Trà"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10 pl-10 rounded-none bg-white border-2 border-[#1A4331]/20 focus:border-[#1A4331] focus:ring-0 text-[#1A4331] placeholder:text-[#8A9A7A]/50"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs font-bold text-red-600">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="phone"
                  className="text-xs font-bold text-[#1A4331]/60 uppercase tracking-widest"
                >
                  Số điện thoại <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A9A7A]" />
                  <Input
                    id="phone"
                    placeholder="0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-10 pl-10 rounded-none bg-white border-2 border-[#1A4331]/20 focus:border-[#1A4331] focus:ring-0 text-[#1A4331] placeholder:text-[#8A9A7A]/50"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs font-bold text-red-600">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="dob"
                    className="text-xs font-bold text-[#1A4331]/60 uppercase tracking-widest"
                  >
                    Ngày sinh <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    max="2010-12-31"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-10 rounded-none bg-white border-2 border-[#1A4331]/20 focus:border-[#1A4331] focus:ring-0 text-[#1A4331]"
                  />
                  {errors.dob && (
                    <p className="text-xs font-bold text-red-600">
                      {errors.dob}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#1A4331]/60 uppercase tracking-widest">
                    Giới tính <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={gender}
                    onValueChange={(val: "MALE" | "FEMALE" | "OTHER") =>
                      setGender(val)
                    }
                  >
                    <SelectTrigger className="h-10 rounded-none bg-white border-2 border-[#1A4331]/20 focus:border-[#1A4331] focus:ring-0 text-[#1A4331]">
                      <SelectValue placeholder="Chọn..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-2 border-[#1A4331] bg-[#F8F5F0]">
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-xs font-bold text-red-600">
                      {errors.gender}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border-2 border-red-600 text-red-600 text-xs font-bold text-center">
                {errors.submit}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                disabled={isLoading || isUploading}
                className="w-full h-10 bg-[#1A4331] hover:bg-[#8A9A7A] hover:text-[#1A4331] text-[#F8F5F0] pixel-button text-sm font-bold flex items-center justify-center gap-2 group transition-colors"
              >
                {isLoading || isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isUploading ? "Đang tải ảnh..." : "Đang xử lý hồ sơ..."}
                  </>
                ) : (
                  <>
                    HOÀN TẤT HỒ SƠ
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 text-[#8A9A7A] hover:text-red-600 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group"
              >
                <LogOut className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                Đăng xuất
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {cropperSrc && (
        <ImageCropperComponent
          imageSrc={cropperSrc}
          open={cropperOpen}
          onClose={() => {
            setCropperOpen(false);
            setCropperSrc(null);
          }}
          onCropComplete={handleCropComplete}
          outputSize={AVATAR_MAX_SIZE}
        />
      )}
    </div>
  );
}
