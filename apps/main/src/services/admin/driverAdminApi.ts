import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type { DriverResponse } from "@/types/driver/DriverResponse";
import type { UpsertDriverRequest } from "@/types/driver/UpsertDriverRequest";

export const findAllDriversApi = async () => {
  return await axiosClient.get<ApiResponse<DriverResponse[]>>(
    "/order-service/admin/drivers",
  );
};

export const findDriverByIdApi = async (id: string | number) => {
  return await axiosClient.get<ApiResponse<DriverResponse>>(
    `/order-service/admin/drivers/${id}`,
  );
};

export const createDriverApi = async (data: UpsertDriverRequest) => {
  return await axiosClient.post<ApiResponse<DriverResponse>>(
    "/order-service/admin/drivers",
    data,
  );
};

export const updateDriverApi = async (id: string | number, data: UpsertDriverRequest) => {
  return await axiosClient.put<ApiResponse<DriverResponse>>(
    `/order-service/admin/drivers/${id}`,
    data,
  );
};

export const deleteDriverApi = async (id: string | number) => {
  return await axiosClient.delete<ApiResponse<void>>(
    `/order-service/admin/drivers/${id}`,
  );
};
