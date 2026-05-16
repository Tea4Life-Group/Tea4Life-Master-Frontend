import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type PageResponse from "@/types/base/PageResponse";
import type PaginationParams from "@/types/base/PaginationParams";

import type { CreateProductOptionValueRequest } from "@/types/product-option/CreateProductOptionValueRequest";
import type { ProductOptionValueResponse } from "@/types/product-option/ProductOptionValueResponse";

export const createProductOptionValueApi = async (
  productOptionId: string,
  data: CreateProductOptionValueRequest,
) => {
  return await axiosClient.post<ApiResponse<ProductOptionValueResponse>>(
    `/product-service/admin/product-options/${productOptionId}/values`,
    data,
  );
};

export const getProductOptionValuesApi = async (
  productOptionId: string,
  params: PaginationParams,
) => {
  return await axiosClient.get<
    ApiResponse<PageResponse<ProductOptionValueResponse>>
  >(`/product-service/admin/product-options/${productOptionId}/values`, {
    params,
  });
};

export const getProductOptionValueByIdApi = async (
  productOptionId: string,
  id: string,
) => {
  return await axiosClient.get<ApiResponse<ProductOptionValueResponse>>(
    `/product-service/admin/product-options/${productOptionId}/values/${id}`,
  );
};

export const updateProductOptionValueApi = async (
  productOptionId: string,
  id: string,
  data: CreateProductOptionValueRequest,
) => {
  return await axiosClient.post<ApiResponse<ProductOptionValueResponse>>(
    `/product-service/admin/product-options/${productOptionId}/values/${id}`,
    data,
  );
};

export const deleteProductOptionValueApi = async (
  productOptionId: string,
  id: string,
) => {
  return await axiosClient.delete<ApiResponse<void>>(
    `/product-service/admin/product-options/${productOptionId}/values/${id}`,
  );
};
