import type { ProductOptionValueResponse } from "./ProductOptionValueResponse";

export interface ProductOptionResponse {
  id: string;
  name: string;
  isRequired: boolean;
  isMultiSelect: boolean;
  sortOrder: number;
  productOptionValues: ProductOptionValueResponse[];
}
