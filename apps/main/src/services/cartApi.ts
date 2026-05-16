import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type { CartResponse } from "@/types/cart/CartResponse";
import type { AddCartItemRequest } from "@/types/cart/AddCartItemRequest";
import type { UpdateCartItemRequest } from "@/types/cart/UpdateCartItemRequest";
import type { RecentCartItemsResponse } from "@/types/cart/RecentCartItemsResponse";

export const getCartApi = async () => {
  return await axiosClient.get<ApiResponse<CartResponse>>("/order-service/cart/me");
};

export const addCartItemApi = async (data: AddCartItemRequest) => {
  return await axiosClient.post<ApiResponse<CartResponse>>(
    "/order-service/cart/me/items",
    data,
  );
};

export const updateCartItemApi = async (
  cartItemId: string,
  data: UpdateCartItemRequest,
) => {
  return await axiosClient.put<ApiResponse<CartResponse>>(
    `/order-service/cart/me/items/${cartItemId}`,
    data,
  );
};

export const removeCartItemApi = async (cartItemId: string) => {
  return await axiosClient.delete<ApiResponse<void>>(
    `/order-service/cart/me/items/${cartItemId}`,
  );
};

export const clearCartApi = async () => {
  return await axiosClient.delete<ApiResponse<void>>("/order-service/cart/me/items");
};

export const getMyRecentCartItemsApi = async () => {
  return await axiosClient.get<ApiResponse<RecentCartItemsResponse>>(
    "/order-service/cart/me/items/recent",
  );
};
