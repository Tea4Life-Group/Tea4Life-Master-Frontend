import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { updateUserPasswordApi } from "@/services/userApi";
import { toast } from "sonner";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";

export default function SecurityPage() {
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    const passwordRegex = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/;

    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = "Mật khẩu cũ không được để trống";
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "Mật khẩu mới không được để trống";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (!passwordRegex.test(formData.newPassword)) {
      newErrors.newPassword =
        "Mật khẩu phải bao gồm ít nhất 1 chữ hoa, 1 chữ số và 1 ký tự đặc biệt";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await updateUserPasswordApi({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Cập nhật mật khẩu thành công!");
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setErrors({});
      } else {
        toast.error(response.data.errorMessage || "Đã có lỗi xảy ra");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error.response?.data?.errorMessage || "Cập nhật mật khẩu thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-[#1A4331]/15">
      <div className="px-6 py-4 border-b-2 border-[#1A4331]/10">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[#8A9A7A]" />
          <h2 className="text-[#1A4331] font-bold text-sm uppercase tracking-wider">
            Đổi mật khẩu
          </h2>
        </div>
        <p className="text-[#8A9A7A] text-xs mt-1">
          Đảm bảo mật khẩu của bạn có ít nhất 8 ký tự, bao gồm chữ hoa, chữ số
          và ký tự đặc biệt.
        </p>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="oldPassword">
            Mật khẩu hiện tại <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="oldPassword"
              type={showOldPassword ? "text" : "password"}
              className={`border-2 border-[#1A4331]/20 bg-[#F8F5F0] rounded-none focus-visible:ring-0 focus-visible:border-[#1A4331] text-sm pr-10 ${errors.oldPassword ? "border-red-500" : ""}`}
              value={formData.oldPassword}
              onChange={(e) =>
                setFormData({ ...formData, oldPassword: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9A7A] hover:text-[#1A4331] focus:outline-none"
            >
              {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.oldPassword && (
            <p className="text-xs text-red-500">{errors.oldPassword}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">
            Mật khẩu mới <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              className={`border-emerald-100 focus-visible:ring-emerald-500 pr-10 ${errors.newPassword ? "border-red-500" : ""}`}
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700 focus:outline-none"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-500">{errors.newPassword}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              className={`border-emerald-100 focus-visible:ring-emerald-500 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700 focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        <Button
          onClick={handleUpdatePassword}
          disabled={loading}
          className="bg-[#1A4331] hover:bg-[#8A9A7A] text-[#F8F5F0] rounded-none font-bold w-full md:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý
            </>
          ) : (
            "Đổi mật khẩu"
          )}
        </Button>
      </div>
    </div>
  );
}
