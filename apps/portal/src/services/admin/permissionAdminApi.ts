import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type PageResponse from "@/types/base/PageResponse";
import type PaginationParams from "@/types/base/PaginationParams";
import type { PermissionResponse } from "@/types/permission/PermissionResponse";
import type { UpsertPermissionRequest } from "@/types/permission/UpsertPermissionRequest";

export const createPermissionApi = async (data: UpsertPermissionRequest) => {
  return await axiosClient.post<ApiResponse<void>>(
    "/user-service/admin/permissions",
    data,
  );
};

export const findAllPermissions = async (
  params: PaginationParams = { page: 1, size: 10 },
) => {
  return await axiosClient.get<ApiResponse<PageResponse<PermissionResponse>>>(
    "/user-service/admin/permissions",
    {
      params: {
        ...params,
      },
    },
  );
};

export const findAllPermissionList = async () => {
  return await axiosClient.get<ApiResponse<PermissionResponse[]>>(
    "/user-service/admin/permissions/all",
  );
};

export const updatePermissionApi = async (
  id: string,
  data: UpsertPermissionRequest,
) => {
  return await axiosClient.post<ApiResponse<void>>(
    `/user-service/admin/permissions/${id}`,
    data,
  );
};

export const deletePermissionApi = async (id: string) => {
  return await axiosClient.delete<ApiResponse<void>>(
    `/user-service/admin/permissions/${id}`,
  );
};
