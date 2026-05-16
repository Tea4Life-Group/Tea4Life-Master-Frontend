import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type { CreateVoucherRequest } from "@/types/voucher/CreateVoucherRequest";
import type { VoucherResponse } from "@/types/voucher/VoucherResponse";

const BASE_URL = "/order-service/admin/vouchers";

export const getAllAdminVouchersApi = async () => {
  return await axiosClient.get<ApiResponse<VoucherResponse[]>>(BASE_URL);
};

export const getAdminVoucherByIdApi = async (id: string) => {
  return await axiosClient.get<ApiResponse<VoucherResponse>>(
    `${BASE_URL}/${id}`,
  );
};

export const createAdminVoucherApi = async (data: CreateVoucherRequest) => {
  return await axiosClient.post<ApiResponse<VoucherResponse>>(BASE_URL, data);
};

export const updateAdminVoucherApi = async (
  id: string,
  data: CreateVoucherRequest,
) => {
  return await axiosClient.put<ApiResponse<VoucherResponse>>(
    `${BASE_URL}/${id}`,
    data,
  );
};

export const deleteAdminVoucherApi = async (id: string) => {
  return await axiosClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
};
