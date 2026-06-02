import type { ProductSummaryResponse } from "@/types/product/ProductSummaryResponse";
import type { ProductAiCartSuggestionResponse } from "./ProductAiCartSuggestionResponse";

export interface ProductAiChatResponse {
  answer: string;
  recommendedProducts: ProductSummaryResponse[];
  cartSuggestions?: ProductAiCartSuggestionResponse[];
  cartActionRequested?: boolean;
  chatboxDisplayName?: string;
  maxQuestionsPerUserPerDay?: number;
  remainingQuestionsToday?: number | null;
  limitReached?: boolean;
}
