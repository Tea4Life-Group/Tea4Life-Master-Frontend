import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Store,
  ClipboardList,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMyStoresApi, getStoreOrdersApi } from "@/services/orderApi";
import type { StoreResponse } from "@/types/store/StoreResponse";
import type { StoreOrderResponse } from "@/types/order/OrderResponse";
import { handleError } from "@/lib/utils";

export default function StoreDashboard() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<StoreResponse | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [preparingCount, setPreparingCount] = useState(0);
  const [readyCount, setReadyCount] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getMyStoresApi();
        const data = res.data.data || [];
        setStores(data);
        if (data.length > 0) setSelectedStore(data[0]);
      } catch (error) {
        handleError(error, "Không thể tải cửa hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedStore) return;
    const fetchCounts = async () => {
      try {
        const res = await getStoreOrdersApi(selectedStore.id);
        const orders: StoreOrderResponse[] = res.data.data || [];
        setPendingCount(orders.filter((o) => o.status === "PENDING").length);
        setPreparingCount(orders.filter((o) => o.status === "PREPARING").length);
        setReadyCount(orders.filter((o) => o.status === "READY_FOR_DELIVERY").length);
      } catch {
        // silent
      }
    };
    fetchCounts();
  }, [selectedStore]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-emerald-600/60">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="font-medium">Đang tải...</span>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <AlertCircle className="h-12 w-12 text-slate-300" />
        <p className="font-bold text-lg">Bạn chưa được gán vào cửa hàng nào.</p>
        <p className="text-sm">Liên hệ quản trị viên để được gán làm nhân viên.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tổng quan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi trạng thái đơn hàng cửa hàng
          </p>
        </div>

        <Select
          value={selectedStore?.id || ""}
          onValueChange={(val: string) => {
            const found = stores.find((s) => s.id === val);
            if (found) setSelectedStore(found);
          }}
        >
          <SelectTrigger className="w-[280px] h-10 border-emerald-200">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-emerald-600 shrink-0" />
              <SelectValue placeholder="Chọn cửa hàng" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {stores.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats cards */}
      {selectedStore && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{pendingCount}</p>
                <p className="text-xs text-slate-500 font-medium">Chờ xác nhận</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <Package className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{preparingCount}</p>
                <p className="text-xs text-slate-500 font-medium">Đang chuẩn bị</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{readyCount}</p>
                <p className="text-xs text-slate-500 font-medium">Sẵn sàng giao</p>
              </div>
            </div>
          </div>

          {/* Quick action */}
          <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <ClipboardList className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Xử lý đơn hàng</p>
                <p className="text-sm text-slate-500">
                  Xác nhận, chuẩn bị, đánh dấu sẵn sàng giao cho tài xế
                </p>
              </div>
            </div>
            <Button
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => navigate("/app/stores/orders")}
            >
              Mở đơn hàng
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Store info */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Thông tin cửa hàng
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Tên cửa hàng</p>
                <p className="font-medium text-slate-700">{selectedStore.name}</p>
              </div>
              <div>
                <p className="text-slate-400">Địa chỉ</p>
                <p className="font-medium text-slate-700">{selectedStore.address}</p>
              </div>
              <div>
                <p className="text-slate-400">Nhân viên</p>
                <p className="font-medium text-slate-700">
                  {selectedStore.employees?.length || 0} người
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
