import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type PageResponse from "@/types/base/PageResponse";
import type { NewsSummaryResponse } from "@/types/news/NewsSummaryResponse";
import type { NewsDetailResponse } from "@/types/news/NewsDetailResponse";
import type { NewsCategoryResponse } from "@/types/news/NewsCategoryResponse";

// Lấy tất cả tin tức (có phân trang)
export const getNewsApi = async (params: { page?: number; size?: number }) => {
  return await axiosClient.get<ApiResponse<PageResponse<NewsSummaryResponse>>>(
    "/product-service/public/news",
    { params },
  );
};

// Lấy 3 tin tức mới nhất
export const getLatestNewsApi = async () => {
  return await axiosClient.get<ApiResponse<NewsSummaryResponse[]>>(
    "/product-service/public/news/latest",
  );
};

// Lấy chi tiết tin tức theo slug
export const getNewsBySlugApi = async (slug: string) => {
  return await axiosClient.get<ApiResponse<NewsDetailResponse>>(
    `/product-service/public/news/${slug}`,
  );
};

// Lấy tin tức theo danh mục slug (có phân trang)
export const getNewsByCategorySlugApi = async (
  categorySlug: string,
  params: { page?: number; size?: number },
) => {
  return await axiosClient.get<ApiResponse<PageResponse<NewsSummaryResponse>>>(
    `/product-service/public/news/category/${categorySlug}`,
    { params },
  );
};

// Lấy tất cả danh mục tin tức
export const getNewsCategoriesApi = async () => {
  return await axiosClient.get<ApiResponse<NewsCategoryResponse[]>>(
    "/product-service/public/news-categories",
  );
};

// Lấy danh mục tin tức theo slug
export const getNewsCategoryBySlugApi = async (slug: string) => {
  return await axiosClient.get<ApiResponse<NewsCategoryResponse>>(
    `/product-service/public/news-categories/${slug}`,
  );
};
