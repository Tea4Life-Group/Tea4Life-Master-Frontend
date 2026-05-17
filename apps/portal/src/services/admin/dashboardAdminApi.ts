import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type { DashboardResponse } from "@/types/dashboard/DashboardResponse";

const BASE_URL = "/order-service/admin/dashboard";

/**
 * Lấy toàn bộ dữ liệu thống kê cho Admin Dashboard.
 * Backend wrap kết quả trong { data: DashboardResponse }
 */
export const getAdminDashboardApi = async () => {
  return await axiosClient.get<ApiResponse<DashboardResponse>>(BASE_URL);
};
