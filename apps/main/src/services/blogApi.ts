import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type PageResponse from "@/types/base/PageResponse";
import type {
  BlogReviewCommentResponse,
  BlogReviewHistoryResponse,
  BlogReviewLikeResponse,
  BlogReviewResponse,
  BlogReviewShareResponse,
} from "@/types/blog/BlogReviewResponse";
import type {
  CreateBlogReviewCommentRequest,
  CreateBlogReviewRequest,
  CreateBlogReviewShareRequest,
  ModerateBlogReviewRequest,
  UpdateBlogReviewRequest,
} from "@/types/blog/BlogReviewRequest";
import type { BlogReviewHistoryAction } from "@/types/blog/BlogReviewResponse";

const PUBLIC_BASE = "/blog-service/api/v1/blog-reviews";
const MY_BASE = "/blog-service/api/v1/my/blog-reviews";
const ADMIN_BASE = "/blog-service/api/v1/admin/blog-reviews";

export const getPublicBlogReviewsApi = async (params: {
  productId?: string;
  page?: number;
  size?: number;
}) => {
  return await axiosClient.get<ApiResponse<PageResponse<BlogReviewResponse>>>(
    PUBLIC_BASE,
    { params },
  );
};

export const getPublicBlogReviewDetailApi = async (reviewId: string) => {
  return await axiosClient.get<ApiResponse<BlogReviewResponse>>(
    `${PUBLIC_BASE}/${reviewId}`,
  );
};

export const createMyBlogReviewApi = async (data: CreateBlogReviewRequest) => {
  return await axiosClient.post<ApiResponse<BlogReviewResponse>>(MY_BASE, data);
};

export const getMyBlogReviewsApi = async (params: { page?: number; size?: number }) => {
  return await axiosClient.get<ApiResponse<PageResponse<BlogReviewResponse>>>(
    MY_BASE,
    { params },
  );
};

export const getMyBlogReviewHistoryApi = async (params: {
  page?: number;
  size?: number;
  actions?: BlogReviewHistoryAction[];
  from?: string;
  to?: string;
}) => {
  return await axiosClient.get<ApiResponse<PageResponse<BlogReviewHistoryResponse>>>(
    `${MY_BASE}/history`,
    { params },
  );
};

export const updateMyBlogReviewApi = async (
  reviewId: string,
  data: UpdateBlogReviewRequest,
) => {
  return await axiosClient.put<ApiResponse<BlogReviewResponse>>(
    `${MY_BASE}/${reviewId}`,
    data,
  );
};

export const deleteMyBlogReviewApi = async (reviewId: string) => {
  return await axiosClient.delete<ApiResponse<void>>(`${MY_BASE}/${reviewId}`);
};

export const moderateBlogReviewApi = async (
  reviewId: string,
  data: ModerateBlogReviewRequest,
) => {
  return await axiosClient.patch<ApiResponse<BlogReviewResponse>>(
    `${ADMIN_BASE}/${reviewId}/moderation`,
    data,
  );
};

export const getBlogReviewCommentsApi = async (
  reviewId: string,
  params: { page?: number; size?: number } = {},
) => {
  return await axiosClient.get<ApiResponse<PageResponse<BlogReviewCommentResponse>>>(
    `${PUBLIC_BASE}/${reviewId}/comments`,
    { params },
  );
};

export const createBlogReviewCommentApi = async (
  reviewId: string,
  data: CreateBlogReviewCommentRequest,
) => {
  return await axiosClient.post<ApiResponse<BlogReviewCommentResponse>>(
    `${PUBLIC_BASE}/${reviewId}/comments`,
    data,
  );
};

export const toggleBlogReviewLikeApi = async (reviewId: string) => {
  return await axiosClient.post<ApiResponse<BlogReviewLikeResponse>>(
    `${PUBLIC_BASE}/${reviewId}/likes/toggle`,
  );
};

export const shareBlogReviewApi = async (
  reviewId: string,
  data: CreateBlogReviewShareRequest,
) => {
  return await axiosClient.post<ApiResponse<BlogReviewShareResponse>>(
    `${PUBLIC_BASE}/${reviewId}/shares`,
    data,
  );
};
