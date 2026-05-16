export interface VoucherResponse {
  id: string;
  discountPercentage: number;
  minOrderAmount: string;
  maxDiscountAmount: string;
  description: string;
  imgUrl: string;
}