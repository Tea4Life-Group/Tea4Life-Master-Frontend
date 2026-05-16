import type { ProductCategoryResponse } from "../product-category/ProductCategoryResponse";
import type { ProductOptionResponse } from "../product-option/ProductOptionResponse";

export interface ProductDetailResponse {
  id: string;
  productCategory: ProductCategoryResponse;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  productOptions: ProductOptionResponse[];
}
