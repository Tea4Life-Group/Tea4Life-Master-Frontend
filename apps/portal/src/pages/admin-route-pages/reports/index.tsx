"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Page Header */}
      <AdminPageHeader
        icon={BarChart3}
        title="Báo cáo doanh thu"
        description="Xem và phân tích hiệu quả kinh doanh."
        actions={
          <Button variant="outline" size="sm" className="hidden sm:flex rounded-lg">
            <Download className="h-4 w-4 mr-2" /> Xuất báo cáo (Excel)
          </Button>
        }
      />

      {/* 2. Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-emerald-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-emerald-100 text-sm font-medium">
              Tổng lợi nhuận
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">128.450.000đ</div>
            <div className="flex items-center mt-2 text-emerald-200 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" /> +15.2% so với tháng
              trước
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-500 text-sm font-medium">
              Giá trị đơn trung bình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">850.000đ</div>
            <div className="flex items-center mt-2 text-red-500 text-sm">
              <ArrowDownRight className="h-4 w-4 mr-1" /> -2.4% biến động
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-500 text-sm font-medium">
              Tổng đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-slate-900">1,284</div>
              <ShoppingBag className="h-5 w-5 text-slate-400 mb-1" />
            </div>
            <div className="flex items-center mt-2 text-emerald-500 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" /> +8.1% tăng trưởng
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Charts Section */}
      <Card className="border border-slate-200/60 shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Biểu đồ tăng trưởng</CardTitle>
          <Select defaultValue="7days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 ngày qua</SelectItem>
              <SelectItem value="30days">30 ngày qua</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">
              Tích hợp Recharts hoặc Chart.js tại đây để hiển thị dữ liệu.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
