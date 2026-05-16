import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type PageResponse from "@/types/base/PageResponse";
import type { NewsSummaryResponse } from "@/types/news/NewsSummaryResponse";
import type { NewsDetailResponse } from "@/types/news/NewsDetailResponse";
import type { NewsRequest } from "@/types/news/NewsRequest";
import type { NewsCategoryResponse } from "@/types/news/NewsCategoryResponse";
import type { NewsCategoryRequest } from "@/types/news/NewsRequest";

const NEWS_BASE = "/product-service/admin/news";
const CATEGORY_BASE = "/product-service/admin/news-categories";

// ======================== NEWS ========================

export const getAdminNewsApi = async (params: { page?: number; size?: number }) => {
  return await axiosClient.get<ApiResponse<PageResponse<NewsSummaryResponse>>>(NEWS_BASE, { params });
};

export const getAdminNewsByIdApi = async (id: string) => {
  return await axiosClient.get<ApiResponse<NewsDetailResponse>>(`${NEWS_BASE}/${id}`);
};

export const createAdminNewsApi = async (data: NewsRequest) => {
  return await axiosClient.post<ApiResponse<NewsDetailResponse>>(NEWS_BASE, data);
};

export const updateAdminNewsApi = async (id: string, data: NewsRequest) => {
  return await axiosClient.put<ApiResponse<NewsDetailResponse>>(`${NEWS_BASE}/${id}`, data);
};

export const deleteAdminNewsApi = async (id: string) => {
  return await axiosClient.delete<ApiResponse<void>>(`${NEWS_BASE}/${id}`);
};

// =================== NEWS CATEGORIES ===================

export const getAdminNewsCategoriesApi = async () => {
  return await axiosClient.get<ApiResponse<NewsCategoryResponse[]>>(CATEGORY_BASE);
};

export const getAdminNewsCategoryByIdApi = async (id: string) => {
  return await axiosClient.get<ApiResponse<NewsCategoryResponse>>(`${CATEGORY_BASE}/${id}`);
};

export const createAdminNewsCategoryApi = async (data: NewsCategoryRequest) => {
  return await axiosClient.post<ApiResponse<NewsCategoryResponse>>(CATEGORY_BASE, data);
};

export const updateAdminNewsCategoryApi = async (id: string, data: NewsCategoryRequest) => {
  return await axiosClient.put<ApiResponse<NewsCategoryResponse>>(`${CATEGORY_BASE}/${id}`, data);
};

export const deleteAdminNewsCategoryApi = async (id: string) => {
  return await axiosClient.delete<ApiResponse<void>>(`${CATEGORY_BASE}/${id}`);
};
