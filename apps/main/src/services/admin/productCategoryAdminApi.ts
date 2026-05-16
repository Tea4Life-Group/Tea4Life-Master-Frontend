import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type { CreateProductCategoryRequest } from "@/types/product-category/CreateProductCategoryRequest";
import type { ProductCategoryResponse } from "@/types/product-category/ProductCategoryResponse";

export const getProductCategoriesApi = async () => {
  return await axiosClient.get<ApiResponse<ProductCategoryResponse[]>>(
    "/product-service/admin/product-categories",
  );
};

export const getProductCategoryByIdApi = async (id: string) => {
  return await axiosClient.get<ApiResponse<ProductCategoryResponse>>(
    `/product-service/admin/product-categories/${id}`,
  );
};

export const createProductCategoryApi = async (
  data: CreateProductCategoryRequest,
) => {
  return await axiosClient.post<ApiResponse<ProductCategoryResponse>>(
    "/product-service/admin/product-categories",
    data,
  );
};

export const updateProductCategoryApi = async (
  id: string,
  data: CreateProductCategoryRequest,
) => {
  return await axiosClient.post<ApiResponse<ProductCategoryResponse>>(
    `/product-service/admin/product-categories/${id}`,
    data,
  );
};

export const deleteProductCategoryApi = async (id: string) => {
  return await axiosClient.delete<ApiResponse<void>>(
    `/product-service/admin/product-categories/${id}`,
  );
};
