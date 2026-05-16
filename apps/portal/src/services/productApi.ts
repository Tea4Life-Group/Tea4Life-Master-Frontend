import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type PageResponse from "@/types/base/PageResponse";
import type { ProductDetailResponse } from "@/types/product/ProductDetailResponse";
import type { ProductSummaryResponse } from "@/types/product/ProductSummaryResponse";
import type { PopularProductCardResponse } from "@/types/product/PopularProductCardResponse";

import type { ProductQuery } from "@/types/product/ProductQuery";
import type { ProductCategoryResponse } from "@/types/product-category/ProductCategoryResponse";

export const getProductsApi = async (params: ProductQuery) => {
  return await axiosClient.get<
    ApiResponse<PageResponse<ProductSummaryResponse>>
  >("/product-service/public/products", { params });
};

export const getProductCategoriesApi = async () => {
  return await axiosClient.get<ApiResponse<ProductCategoryResponse[]>>(
    "/product-service/public/products/categories",
  );
};

export const getProductByIdApi = async (id: string) => {
  return await axiosClient.get<ApiResponse<ProductDetailResponse>>(
    `/product-service/public/products/${id}`,
  );
};

export const getPopularProductsApi = async (limit?: number) => {
  return await axiosClient.get<ApiResponse<PopularProductCardResponse[]>>(
    "/product-service/public/products/popular",
    { params: { limit } },
  );
};

export const getRandomProductsApi = async () => {
  return await axiosClient.get<ApiResponse<ProductSummaryResponse[]>>(
    "/product-service/public/products/random-items",
  );
};
