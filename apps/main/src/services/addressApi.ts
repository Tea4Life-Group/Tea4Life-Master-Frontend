import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type { CreateAddressRequest } from "@/types/address/CreateAddressRequest";
import type { AddressResponse } from "@/types/address/AddressResponse";

export const createAddressApi = async (data: CreateAddressRequest) => {
  return await axiosClient.post<ApiResponse<AddressResponse>>(
    "/user-service/users/me/addresses",
    data,
  );
};

export const findMyAddressesApi = async () => {
  return await axiosClient.get<ApiResponse<AddressResponse[]>>(
    "/user-service/users/me/addresses",
  );
};

export const findMyAddressByIdApi = async (id: string | number) => {
  return await axiosClient.get<ApiResponse<AddressResponse>>(
    `/user-service/users/me/addresses/${id}`,
  );
};

export const updateMyAddressApi = async (
  id: string | number,
  data: CreateAddressRequest,
) => {
  return await axiosClient.post<ApiResponse<AddressResponse>>(
    `/user-service/users/me/addresses/${id}`,
    data,
  );
};

export const deleteMyAddressApi = async (id: string | number) => {
  return await axiosClient.delete<ApiResponse<void>>(
    `/user-service/users/me/addresses/${id}`,
  );
};

export const setDefaultMyAddressApi = async (id: string | number) => {
  return await axiosClient.post<ApiResponse<AddressResponse>>(
    `/user-service/users/me/addresses/${id}/default`,
  );
};
