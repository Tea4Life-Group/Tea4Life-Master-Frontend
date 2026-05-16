import type { ProductPopularityResponse } from "../recommendation/ProductPopularityResponse";

export interface PopularProductCardResponse {
  id: string;
  name: string;
  basePrice: number;
  imageUrl: string;
  productCategoryName: string;
  popularity: ProductPopularityResponse;
}
