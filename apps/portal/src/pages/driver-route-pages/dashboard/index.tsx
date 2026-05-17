
import { Button } from "@/components/ui/button";
import { Wallet, Bell, Package, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { useState, useEffect } from "react";
import { getDriverShippingOrdersApi } from "@/services/orderApi";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { fullName } = useAuth();
  
  const [shippingCount, setShippingCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await getDriverShippingOrdersApi();
        setShippingCount(res.data.data?.length || 0);
      } catch {
        // silent
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sảnh tài xế</h1>
          <p className="text-sm text-slate-500 mt-1">
            Chào mừng {fullName} trở lại
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold">Đang trực tuyến</span>
          </div>
          <Button variant="outline" size="icon" className="rounded-full text-slate-400">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Package className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800">{shippingCount}</p>
            <p className="text-xs text-slate-500 font-medium">Đơn đang giao</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800">12</p>
            <p className="text-xs text-slate-500 font-medium">Hoàn thành (hôm nay)</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4 cursor-pointer hover:border-emerald-200 transition-colors">
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Wallet className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">350.000đ</p>
            <p className="text-xs text-slate-500 font-medium">Thu nhập tạm tính</p>
          </div>
        </div>
      </div>

      {/* Quick action */}
      <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800">Bảng điều phối đơn hàng</p>
            <p className="text-sm text-slate-500">
              Nhận đơn mới hoặc cập nhật trạng thái đơn đang giao
            </p>
          </div>
        </div>
        <Button
          className="gap-2 bg-slate-900 hover:bg-slate-800 text-white"
          onClick={() => navigate("/app/drivers/orders")}
        >
          Mở nhiệm vụ
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
