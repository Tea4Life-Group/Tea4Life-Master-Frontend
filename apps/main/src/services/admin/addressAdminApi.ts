import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type { AddressResponse } from "@/types/address/AddressResponse";
import type { CreateAddressRequest } from "@/types/address/CreateAddressRequest";

export const createAddress = async (
  keycloakId: string,
  data: CreateAddressRequest,
) => {
  return await axiosClient.post<ApiResponse<AddressResponse>>(
    `/user-service/admin/users/${keycloakId}/addresses`,
    data,
  );
};

export const findAddressesByKeycloakId = async (keycloakId: string) => {
  return await axiosClient.get<ApiResponse<AddressResponse[]>>(
    `/user-service/admin/users/${keycloakId}/addresses`,
  );
};

export const findAddressById = async (
  keycloakId: string,
  id: string | number,
) => {
  return await axiosClient.get<ApiResponse<AddressResponse>>(
    `/user-service/admin/users/${keycloakId}/addresses/${id}`,
  );
};

export const updateAddress = async (
  keycloakId: string,
  id: string | number,
  data: CreateAddressRequest,
) => {
  return await axiosClient.post<ApiResponse<AddressResponse>>(
    `/user-service/admin/users/${keycloakId}/addresses/${id}`,
    data,
  );
};

export const deleteAddress = async (
  keycloakId: string,
  id: string | number,
) => {
  return await axiosClient.delete<ApiResponse<void>>(
    `/user-service/admin/users/${keycloakId}/addresses/${id}`,
  );
};
