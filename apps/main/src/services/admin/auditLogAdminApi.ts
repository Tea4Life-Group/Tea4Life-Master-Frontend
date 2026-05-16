import axiosClient from "@/lib/axios-client";
import type { AuditLog, SpringPage } from "@/types/audit-log/AuditLog";
import type ApiResponse from "@/types/base/ApiResponse";

const BASE_URL = "/audit-service/admin/audit";

export const getAllAuditLogsApi = async (
  page: number = 0,
  size: number = 10,
  entityType?: string,
  action?: string,
) => {
  return await axiosClient.get<ApiResponse<SpringPage<AuditLog>>>(BASE_URL, {
    params: {
      page,
      size,
      entityType: entityType !== "ALL" ? entityType : undefined,
      action: action !== "ALL" ? action : undefined,
    },
  });
};
