import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type PageResponse from "@/types/base/PageResponse";
import type { ProductAiChatConfigResponse } from "@/types/ai-chat/ProductAiChatConfigResponse";
import type { ProductAiMonthlyQuestionResponse } from "@/types/ai-chat/ProductAiMonthlyQuestionResponse";
import type { ProductAiChatOverviewResponse } from "@/types/ai-chat/ProductAiChatOverviewResponse";
import type { ProductAiTopQuestionResponse } from "@/types/ai-chat/ProductAiTopQuestionResponse";
import type { ProductAiUserUsageResponse } from "@/types/ai-chat/ProductAiUserUsageResponse";

const BASE_URL = "/product-service/admin/products/ai-chat";

export const getProductAiChatConfigApi = async () => {
  return await axiosClient.get<ApiResponse<ProductAiChatConfigResponse>>(
    `${BASE_URL}/config`,
  );
};

export const updateProductAiChatConfigApi = async (
  payload: ProductAiChatConfigResponse,
) => {
  return await axiosClient.post<ApiResponse<ProductAiChatConfigResponse>>(
    `${BASE_URL}/config`,
    payload,
  );
};

export const getProductAiChatOverviewApi = async () => {
  return await axiosClient.get<ApiResponse<ProductAiChatOverviewResponse>>(
    `${BASE_URL}/stats/overview`,
  );
};

export const getProductAiMonthlyQuestionStatsApi = async () => {
  return await axiosClient.get<ApiResponse<ProductAiMonthlyQuestionResponse[]>>(
    `${BASE_URL}/stats/monthly`,
  );
};

export const getProductAiTopQuestionsApi = async (limit = 10) => {
  return await axiosClient.get<ApiResponse<ProductAiTopQuestionResponse[]>>(
    `${BASE_URL}/stats/top-questions`,
    { params: { limit } },
  );
};

export const getProductAiUserUsageApi = async (params: {
  page: number;
  size: number;
  emailKeyword?: string;
  fromTime?: string;
  toTime?: string;
}) => {
  return await axiosClient.get<ApiResponse<PageResponse<ProductAiUserUsageResponse>>>(
    `${BASE_URL}/stats/users`,
    { params },
  );
};
