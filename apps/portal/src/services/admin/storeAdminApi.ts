import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type { StoreResponse } from "@/types/store/StoreResponse";
import type { UpsertStoreRequest } from "@/types/store/UpsertStoreRequest";
import type { AssignStoreEmployeeRequest } from "@/types/store/AssignStoreEmployeeRequest";
import type { StoreEmployeeResponse } from "@/types/store/StoreEmployeeResponse";

export const findAllStoresApi = async () => {
  return await axiosClient.get<ApiResponse<StoreResponse[]>>(
    "/order-service/public/stores"
  );
};

export const findStoreByIdApi = async (id: number | string) => {
  return await axiosClient.get<ApiResponse<StoreResponse>>(
    `/order-service/admin/stores/${id}`
  );
};

export const createStoreApi = async (data: UpsertStoreRequest) => {
  return await axiosClient.post<ApiResponse<StoreResponse>>(
    "/order-service/admin/stores",
    data
  );
};

export const updateStoreApi = async (id: number | string, data: UpsertStoreRequest) => {
  return await axiosClient.put<ApiResponse<StoreResponse>>(
    `/order-service/admin/stores/${id}`,
    data
  );
};

export const deleteStoreApi = async (id: number | string) => {
  return await axiosClient.delete<ApiResponse<void>>(
    `/order-service/admin/stores/${id}`
  );
};

// ============================================================
// Store Employee APIs
// ============================================================

export const findStoreEmployeesApi = async (storeId: string | number) => {
  return await axiosClient.get<ApiResponse<StoreEmployeeResponse[]>>(
    `/order-service/stores/${storeId}/employees`,
  );
};

export const assignStoreEmployeeApi = async (
  storeId: string | number,
  data: AssignStoreEmployeeRequest,
) => {
  return await axiosClient.post<ApiResponse<StoreEmployeeResponse>>(
    `/order-service/stores/${storeId}/employees`,
    data,
  );
};

export const removeStoreEmployeeApi = async (
  storeId: string | number,
  keycloakId: string,
) => {
  return await axiosClient.delete<ApiResponse<void>>(
    `/order-service/stores/${storeId}/employees`,
    {
      params: { keycloakId },
    },
  );
};
