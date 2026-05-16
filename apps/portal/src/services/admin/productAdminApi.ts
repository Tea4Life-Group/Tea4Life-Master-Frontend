import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type PageResponse from "@/types/base/PageResponse";
import type PaginationParams from "@/types/base/PaginationParams";
import type { CreateProductRequest } from "@/types/product/CreateProductRequest";
import type { ProductResponse } from "@/types/product/ProductResponse";

const BASE_URL = "/product-service/admin/products";

export const getAdminProductsApi = async (params: PaginationParams) => {
  return await axiosClient.get<ApiResponse<PageResponse<ProductResponse>>>(BASE_URL, {
    params,
  });
};

export const getAdminProductByIdApi = async (id: string) => {
  return await axiosClient.get<ApiResponse<ProductResponse>>(`${BASE_URL}/${id}`);
};

export const createAdminProductApi = async (data: CreateProductRequest) => {
  return await axiosClient.post<ApiResponse<ProductResponse>>(BASE_URL, data);
};

export const updateAdminProductApi = async (id: string, data: CreateProductRequest) => {
  return await axiosClient.post<ApiResponse<ProductResponse>>(`${BASE_URL}/${id}`, data);
};

export const deleteAdminProductApi = async (id: string) => {
  return await axiosClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
};
