export interface CreateProductRequest {
  productCategoryId: string;
  name: string;
  description?: string;
  basePrice: number;
  imageKey?: string;
  productOptionIds?: string[];
}
