import { CartItemOptionSelectionRequest } from "./CartItemOptionSelectionRequest";

export interface AddCartItemRequest {
  productId: string;
  productName: string;
  productImageUrl?: string;
  selectedOptions?: CartItemOptionSelectionRequest[];
  unitPrice: number;
  quantity: number;
}
