import { CartItemResponse } from "./CartItemResponse";

export interface CartResponse {
  id: string;
  keycloakId: string;
  items: CartItemResponse[];
  totalItems: number;
  totalAmount: number;
}
