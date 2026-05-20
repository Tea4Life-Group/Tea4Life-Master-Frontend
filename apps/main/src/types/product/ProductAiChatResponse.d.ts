import type { ProductSummaryResponse } from "@/types/product/ProductSummaryResponse";

export interface ProductAiChatResponse {
  answer: string;
  recommendedProducts: ProductSummaryResponse[];
  chatboxDisplayName?: string;
  maxQuestionsPerUserPerDay?: number;
  remainingQuestionsToday?: number | null;
  limitReached?: boolean;
}
