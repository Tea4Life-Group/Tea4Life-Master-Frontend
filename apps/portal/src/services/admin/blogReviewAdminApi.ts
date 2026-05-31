import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type PageResponse from "@/types/base/PageResponse";
import type PaginationParams from "@/types/base/PaginationParams";
import type { BlogReviewResponse } from "@/types/blog/BlogReviewResponse";
import type { ModerateBlogReviewRequest } from "@/types/blog/BlogReviewRequest";

const BASE_URL = "/blog-service/admin/blog-reviews";

export const getAdminBlogReviewsApi = async (params: PaginationParams) => {
  return await axiosClient.get<ApiResponse<PageResponse<BlogReviewResponse>>>(
    BASE_URL,
    { params },
  );
};

export const getAdminBlogReviewByIdApi = async (id: string) => {
  return await axiosClient.get<ApiResponse<BlogReviewResponse>>(
    `${BASE_URL}/${id}`,
  );
};

export const moderateAdminBlogReviewApi = async (
  id: string,
  data: ModerateBlogReviewRequest,
) => {
  return await axiosClient.patch<ApiResponse<BlogReviewResponse>>(
    `${BASE_URL}/${id}/moderation`,
    data,
  );
};

export const deleteAdminBlogReviewApi = async (id: string) => {
  return await axiosClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
};
