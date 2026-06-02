import type { ProductAiCartOptionSelectionResponse } from "./ProductAiCartOptionSelectionResponse";

export interface ProductAiCartSuggestionResponse {
  productId: string;
  productName: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  selectedOptions: ProductAiCartOptionSelectionResponse[];
}
