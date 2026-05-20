import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type PageResponse from "@/types/base/PageResponse";
import type { ProductDetailResponse } from "@/types/product/ProductDetailResponse";
import type { ProductSummaryResponse } from "@/types/product/ProductSummaryResponse";
import type { PopularProductCardResponse } from "@/types/product/PopularProductCardResponse";
import type { ProductAiChatResponse } from "@/types/product/ProductAiChatResponse";
import type { ProductAiChatRequest } from "@/types/product/ProductAiChatRequest";
import type { ProductAiChatConfigResponse } from "@/types/product/ProductAiChatConfigResponse";
import type { ProductAiChatHistoryItemResponse } from "@/types/product/ProductAiChatHistoryItemResponse";

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

export const chatWithProductAiApi = async (payload: ProductAiChatRequest) => {
  return await axiosClient.post<ApiResponse<ProductAiChatResponse>>(
    "/product-service/public/products/ai-chat",
    payload,
  );
};

export const getProductAiChatConfigApi = async () => {
  return await axiosClient.get<ApiResponse<ProductAiChatConfigResponse>>(
    "/product-service/public/products/ai-chat/config",
  );
};

export const getProductAiChatHistoryApi = async (params?: {
  page?: number;
  size?: number;
}) => {
  return await axiosClient.get<
    ApiResponse<PageResponse<ProductAiChatHistoryItemResponse>>
  >("/product-service/public/products/ai-chat/history", { params });
};

export const getMyFavoritesApi = async (params?: { page?: number; size?: number }) => {
  return await axiosClient.get<ApiResponse<PageResponse<ProductSummaryResponse>>>(
    "/product-service/products/favorites",
    { params }
  );
};

export const addFavoriteApi = async (productId: string) => {
  return await axiosClient.post<ApiResponse<string>>(
    `/product-service/products/favorites/${productId}`
  );
};

export const removeFavoriteApi = async (productId: string) => {
  return await axiosClient.delete<ApiResponse<string>>(
    `/product-service/products/favorites/${productId}`
  );
};
