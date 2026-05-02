import axiosClient from "@/lib/axios-client";
import type ApiResponse from "@/types/base/ApiResponse";
import type { CreateOrderRequest } from "@/types/order/CreateOrderRequest";
import type { CheckoutOrderRequest } from "@/types/order/CheckoutOrderRequest";
import type {
  OrderResponse,
  StoreOrderResponse,
  DeliveryOrderResponse,
} from "@/types/order/OrderResponse";
import type { StoreResponse } from "@/types/store/StoreResponse";

// ============================================================
// Customer APIs
// ============================================================

/** Create order directly (with items payload) */
export const createOrderApi = async (data: CreateOrderRequest) => {
  return await axiosClient.post<ApiResponse<OrderResponse>>(
    "/order-service/orders",
    data,
  );
};

/** Checkout from cart — backend reads current cart, no items needed */
export const checkoutOrderApi = async (data: CheckoutOrderRequest) => {
  return await axiosClient.post<ApiResponse<OrderResponse>>(
    "/order-service/orders/checkout",
    data,
  );
};

/** Get my orders, optionally filtered by status */
export const getMyOrdersApi = async (status?: string) => {
  return await axiosClient.get<ApiResponse<OrderResponse[]>>(
    "/order-service/orders/me",
    { params: status ? { status } : {} },
  );
};

/** Get single order detail */
export const getOrderByIdApi = async (id: string) => {
  return await axiosClient.get<ApiResponse<OrderResponse>>(
    `/order-service/orders/${id}`,
  );
};

/** Cancel my order (only allowed when PENDING) */
export const cancelMyOrderApi = async (id: string) => {
  return await axiosClient.post<ApiResponse<OrderResponse>>(
    `/order-service/orders/${id}/cancel`,
  );
};

// ============================================================
// Store Staff APIs (explicit storeId)
// ============================================================

/** Get stores assigned to the current user */
export const getMyStoresApi = async () => {
  return await axiosClient.get<ApiResponse<StoreResponse[]>>(
    "/order-service/stores/my-stores",
  );
};

/** List orders for a specific store, optionally filtered by status */
export const getStoreOrdersApi = async (storeId: string | number, status?: string) => {
  return await axiosClient.get<ApiResponse<StoreOrderResponse[]>>(
    `/order-service/stores/${storeId}/orders`,
    { params: status ? { status } : {} },
  );
};

/** Accept order: PENDING -> PREPARING */
export const acceptStoreOrderApi = async (storeId: string | number, orderId: string) => {
  return await axiosClient.post<ApiResponse<StoreOrderResponse>>(
    `/order-service/stores/${storeId}/orders/${orderId}/accept`,
  );
};

/** Mark ready for delivery: PREPARING -> READY_FOR_DELIVERY */
export const readyStoreOrderApi = async (storeId: string | number, orderId: string) => {
  return await axiosClient.post<ApiResponse<StoreOrderResponse>>(
    `/order-service/stores/${storeId}/orders/${orderId}/ready-for-delivery`,
  );
};

/** Cancel order from store */
export const cancelStoreOrderApi = async (storeId: string | number, orderId: string) => {
  return await axiosClient.post<ApiResponse<StoreOrderResponse>>(
    `/order-service/stores/${storeId}/orders/${orderId}/cancel`,
  );
};

// ============================================================
// Driver APIs
// ============================================================

/** List available orders to pick up (READY_FOR_DELIVERY, unclaimed) */
export const getDriverAvailableOrdersApi = async () => {
  return await axiosClient.get<ApiResponse<DeliveryOrderResponse[]>>(
    "/order-service/driver/orders/available",
  );
};

/** List my shipping orders (DELIVERING, claimed by current driver) */
export const getDriverShippingOrdersApi = async () => {
  return await axiosClient.get<ApiResponse<DeliveryOrderResponse[]>>(
    "/order-service/driver/orders/shipping",
  );
};

/** Get driver order detail */
export const getDriverOrderByIdApi = async (id: string) => {
  return await axiosClient.get<ApiResponse<DeliveryOrderResponse>>(
    `/order-service/driver/orders/${id}`,
  );
};

/** Pickup order: READY_FOR_DELIVERY -> DELIVERING (first-come-first-served) */
export const pickupDriverOrderApi = async (id: string) => {
  return await axiosClient.post<ApiResponse<DeliveryOrderResponse>>(
    `/order-service/driver/orders/${id}/pickup`,
  );
};

/** Complete order: DELIVERING -> COMPLETED */
export const completeDriverOrderApi = async (id: string) => {
  return await axiosClient.post<ApiResponse<DeliveryOrderResponse>>(
    `/order-service/driver/orders/${id}/complete`,
  );
};
