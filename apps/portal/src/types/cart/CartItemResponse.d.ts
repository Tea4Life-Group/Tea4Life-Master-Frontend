import { CartItemOptionSelectionResponse } from "./CartItemOptionSelectionResponse";

export interface CartItemResponse {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  selectedOptions?: CartItemOptionSelectionResponse[];
  unitPrice: number;
  quantity: number;
  subTotal: number;
}
