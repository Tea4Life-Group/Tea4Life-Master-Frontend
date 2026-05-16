import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";

import type { CreateProductOptionRequest } from "@/types/product-option/CreateProductOptionRequest";
import type { ProductOptionResponse } from "@/types/product-option/ProductOptionResponse";

// ==========================================
// API Cho Product Options
// ==========================================

export const createProductOptionApi = async (
  data: CreateProductOptionRequest,
) => {
  return await axiosClient.post<ApiResponse<ProductOptionResponse>>(
    "/product-service/admin/product-options",
    data,
  );
};

export const getAllProductOptionsApi = async () => {
  return await axiosClient.get<ApiResponse<ProductOptionResponse[]>>(
    "/product-service/admin/product-options",
  );
};

export const getProductOptionByIdApi = async (id: string) => {
  return await axiosClient.get<ApiResponse<ProductOptionResponse>>(
    `/product-service/admin/product-options/${id}`,
  );
};

export const updateProductOptionApi = async (
  id: string,
  data: CreateProductOptionRequest,
) => {
  return await axiosClient.post<ApiResponse<ProductOptionResponse>>(
    `/product-service/admin/product-options/${id}`,
    data,
  );
};

export const deleteProductOptionApi = async (id: string) => {
  return await axiosClient.delete<ApiResponse<void>>(
    `/product-service/admin/product-options/${id}`,
  );
};
