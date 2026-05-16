import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type PageResponse from "@/types/base/PageResponse";
import type PaginationParams from "@/types/base/PaginationParams";
import type { UserSummaryResponse } from "@/types/user/UserSummaryResponse";
import type { UserResponse } from "@/types/user/UserResponse";
import type { UserRoleAssign } from "@/types/role/UserRoleAssign";

export const findAllUsers = async (
  params: PaginationParams = { page: 1, size: 10 },
) => {
  return await axiosClient.get<ApiResponse<PageResponse<UserSummaryResponse>>>(
    "/user-service/admin/users",
    {
      params: {
        ...params,
      },
    },
  );
};

export const findUserByKeycloakId = async (keycloakId: string) => {
  return await axiosClient.get<ApiResponse<UserResponse>>(
    `/user-service/admin/users/${keycloakId}`,
  );
};

export const assignRoleApi = async (data: UserRoleAssign) => {
  return await axiosClient.post<ApiResponse<void>>(
    "/user-service/admin/users/assign-role",
    data,
  );
};
