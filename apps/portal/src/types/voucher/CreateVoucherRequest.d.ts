export interface CreateVoucherRequest {
    id?: string;
    discountPercentage: number;
    minOrderAmount: string | number;
    maxDiscountAmount: string | number;
    description: string;
    imgKey: string;
}