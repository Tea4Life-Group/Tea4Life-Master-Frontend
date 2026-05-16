import type { CartItemResponse } from "./CartItemResponse";

export interface RecentCartItemsResponse {
  items: CartItemResponse[];
  totalItems: number;
}
