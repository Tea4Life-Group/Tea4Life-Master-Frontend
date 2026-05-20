import type { ProductSummaryResponse } from "@/types/product/ProductSummaryResponse";

export interface ProductAiChatHistoryItemResponse {
  question: string;
  answer: string;
  recommendedProducts: ProductSummaryResponse[];
  askedAt?: string;
}
