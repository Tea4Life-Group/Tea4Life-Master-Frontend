import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { Shield, Truck, Store, Lock, ChevronRight } from "lucide-react";
import keycloak from "@/lib/keycloak";

const sections = [
  {
    key: "admin",
    title: "Quản trị viên",
    description: "Quản lý sản phẩm, đơn hàng, người dùng, phân quyền và báo cáo",
    icon: Shield,
    path: "/app/admin",
    requireRole: "ADMIN",
    gradient: "from-emerald-500 to-emerald-700",
    iconBg: "bg-emerald-100 text-emerald-700",
    disabledBg: "bg-slate-100 text-slate-400",
  },
  {
    key: "driver",
    title: "Tài xế",
    description: "Xem và quản lý đơn hàng giao, cập nhật trạng thái vận chuyển",
    icon: Truck,
    path: "/app/drivers",
    requireRole: null,
    gradient: "from-blue-500 to-blue-700",
    iconBg: "bg-blue-100 text-blue-700",
    disabledBg: "bg-slate-100 text-slate-400",
  },
  {
    key: "store",
    title: "Nhân viên cửa hàng",
    description: "Xử lý đơn hàng tại cửa hàng, theo dõi doanh số bán hàng",
    icon: Store,
    path: "/app/stores",
    requireRole: null,
    gradient: "from-amber-500 to-amber-700",
    iconBg: "bg-amber-100 text-amber-700",
    disabledBg: "bg-slate-100 text-slate-400",
  },
];

export default function AppHubPage() {
  const navigate = useNavigate();
  const { fullName, email, role } = useAuth();

  const displayName = fullName || email || "Người dùng";

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">T4L</span>
            </div>
            <span className="text-sm font-semibold text-slate-700">Tea4Life Portal</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-500 hover:text-red-600 transition-colors font-medium cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {/* Greeting */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-slate-800">
              Xin chào, {displayName}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Chọn khu vực bạn muốn truy cập
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {sections.map((section) => {
              const allowed = section.requireRole ? role === section.requireRole : true;

              return (
                <button
                  key={section.key}
                  onClick={() => allowed && navigate(section.path)}
                  disabled={!allowed}
                  className={`group relative text-left rounded-2xl border p-6 transition-all duration-200 outline-none ${
                    allowed
                      ? "bg-white border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer"
                      : "bg-slate-50/80 border-slate-200/60 cursor-not-allowed opacity-60"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      allowed ? section.iconBg : section.disabledBg
                    }`}
                  >
                    {allowed ? (
                      <section.icon className="h-6 w-6" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>

                  {/* Text */}
                  <h2
                    className={`text-base font-semibold mb-1 ${
                      allowed ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {section.title}
                  </h2>
                  <p
                    className={`text-sm leading-relaxed ${
                      allowed ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {section.description}
                  </p>

                  {/* Arrow / Lock label */}
                  {allowed ? (
                    <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Truy cập <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                    </div>
                  ) : (
                    <div className="mt-4 text-xs font-medium text-slate-400">
                      Không có quyền truy cập
                    </div>
                  )}

                  {/* Active indicator bar */}
                  {allowed && (
                    <div
                      className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-linear-to-r ${section.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
