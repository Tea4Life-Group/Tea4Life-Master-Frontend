export interface CreateProductOptionValueRequest {
  productOptionId?: string;
  valueName: string;
  extraPrice: number;
  sortOrder: number;
  imageKey?: string;
}
