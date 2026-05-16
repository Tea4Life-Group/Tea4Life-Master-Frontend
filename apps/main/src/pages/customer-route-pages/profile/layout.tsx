import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { User, MapPin, Lock, Camera, Loader2 } from "lucide-react";
import { cn, getMediaUrl, getNameInitials } from "@/lib/utils";
import { getUserProfileApi } from "@/services/userApi";
import type { UserProfileResponse } from "@/types/user/UserProfileResponse";
import ImageCropperComponent from "@/components/custom/ImageCropperComponent";
import { useAuth } from "@/features/auth/useAuth";
import { useAppDispatch } from "@/features/store";
import { executeUpdateAvatar } from "@/features/auth/authThunk";

const menuItems = [
  { name: "Thông tin chung", href: "/profile/general", icon: User },
  { name: "Địa chỉ", href: "/profile/address", icon: MapPin },
  { name: "Bảo mật", href: "/profile/security", icon: Lock },
];

export default function ProfileLayout() {
  const { pathname } = useLocation();
  const { fullName: authFullName } = useAuth();
  const dispatch = useAppDispatch();

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Avatar cropper
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const AVATAR_MAX_SIZE = 150;

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUserProfileApi();
      const data = res.data.data;
      setProfile(data);
      if (data.avatarUrl) {
        setAvatarPreview(getMediaUrl(data.avatarUrl));
      }
    } catch (err) {
      console.error("[Tea4Life] Lấy profile thất bại:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    setAvatarPreview(URL.createObjectURL(file));
    try {
      await dispatch(executeUpdateAvatar(file)).unwrap();
      await fetchProfile();
    } catch (err) {
      console.error("[Tea4Life] Cập nhật avatar thất bại:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const objectUrl = URL.createObjectURL(file);
    setCropperSrc(objectUrl);
    setCropperOpen(true);
    e.target.value = "";
  };

  const handleCropComplete = (croppedFile: File) => {
    setCropperOpen(false);
    setCropperSrc(null);
    uploadAvatar(croppedFile);
  };

  const avatarDisplay = avatarPreview || null;

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A4331] py-12 relative">
      {/* Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "linear-gradient(#1A4331 1px, transparent 1px), linear-gradient(90deg, #1A4331 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <div className="relative group">
            <div className="h-24 w-24 bg-[#F8F5F0] flex items-center justify-center border-2 border-[#1A4331]/20 overflow-hidden relative">
              {loading ? (
                <div className="h-full w-full animate-pulse bg-[#8A9A7A]/20" />
              ) : avatarDisplay ? (
                <img
                  src={avatarDisplay}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-[#1A4331]">
                  {getNameInitials(profile?.fullName)}
                </span>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-1.5 bg-[#1A4331] text-[#F8F5F0] border-2 border-white hover:bg-[#8A9A7A] transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1A4331] pixel-text">
              {loading ? (
                <span className="inline-block h-8 w-48 animate-pulse bg-[#8A9A7A]/20" />
              ) : (
                authFullName || profile?.fullName || "Hồ sơ cá nhân"
              )}
            </h1>
            <p className="text-[#8A9A7A] text-sm">
              Quản lý thông tin tài khoản và bảo mật của bạn
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex gap-0 border-b-2 border-[#1A4331]/10 mb-6 w-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2",
                  isActive
                    ? "text-[#1A4331] border-[#1A4331] bg-white"
                    : "text-[#8A9A7A] border-transparent hover:text-[#1A4331] hover:bg-[#F8F5F0]",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Page Content — truyền profile data qua Outlet context */}
        <div className="mt-4">
          <Outlet
            context={{ profile, loading, refetchProfile: fetchProfile }}
          />
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
