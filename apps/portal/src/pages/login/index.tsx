import keycloak from "@/lib/keycloak";
import { LogIn, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const handleLogin = () => keycloak.login();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-emerald-50/30 to-slate-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 mb-5">
          <Shield className="h-7 w-7 text-emerald-700" />
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-slate-800">Tea4Life Portal</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Hệ thống quản trị dành cho nhân viên
        </p>

        {/* Login Button */}
        <Button
          onClick={handleLogin}
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-emerald-200/50 hover:shadow-lg hover:shadow-emerald-200/70 active:scale-[0.98]"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Đăng nhập
        </Button>

        {/* Footnote */}
        <p className="text-xs text-slate-400 mt-5">
          Đăng nhập qua hệ thống SSO nội bộ
        </p>

        <div className="border-t border-slate-100 mt-6 pt-4">
          <p className="text-[11px] text-slate-300">
            © {new Date().getFullYear()} Tea4Life
          </p>
        </div>
      </div>
    </div>
  );
}
