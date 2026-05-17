import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";

// ============================
// Types
// ============================

export type ReportPeriod = "7days" | "30days" | "year";

export interface ReportStatItem {
  value: number;
  change: string;
  trend: "up" | "down";
}

export interface ReportSummary {
  totalProfit: ReportStatItem;
  averageOrderValue: ReportStatItem;
  totalOrders: ReportStatItem;
}

export interface ReportChartPoint {
  label: string;
  revenue: number;
  profit: number;
  orders: number;
}

// ============================
// API Functions
// ============================

/** Tổng quan: tổng lợi nhuận, AOV, tổng đơn hàng */
export const getReportSummaryApi = async () => {
  return await axiosClient.get<ApiResponse<ReportSummary>>(
    "/order-service/admin/reports/summary"
  );
};

/** Dữ liệu biểu đồ theo period */
export const getReportChartApi = async (period: ReportPeriod) => {
  return await axiosClient.get<ApiResponse<ReportChartPoint[]>>(
    "/order-service/admin/reports/chart",
    { params: { period } }
  );
};

/** Xuất Excel — backend trả về file binary */
export const exportReportApi = async (period: ReportPeriod) => {
  return await axiosClient.get<Blob>(
    "/order-service/admin/reports/export",
    {
      params: { period },
      responseType: "blob",
    }
  );
};
