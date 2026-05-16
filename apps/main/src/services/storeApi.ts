import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type { StoreResponse } from "@/types/store/StoreResponse";

export const findAllStoresApi = async () => {
  return await axiosClient.get<ApiResponse<StoreResponse[]>>(
    "/order-service/public/stores"
  );
};
