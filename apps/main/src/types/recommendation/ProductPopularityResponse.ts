export interface ProductPopularityResponse {
  productId: string | null;
  viewCount: number;
  clickCount: number;
  orderCount: number;
  totalScore: number;
  lastUpdated: string | null;
}

export const emptyProductPopularityResponse = (
  productId: string | number | null = null,
): ProductPopularityResponse => {
  return {
    productId: productId == null ? null : productId.toString(),
    viewCount: 0,
    clickCount: 0,
    orderCount: 0,
    totalScore: 0.0,
    lastUpdated: null,
  };
};
