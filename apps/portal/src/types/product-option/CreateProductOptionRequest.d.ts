export interface CreateProductOptionRequest {
  name: string;
  isRequired: boolean;
  isMultiSelect: boolean;
  sortOrder: number;
  productIds?: string[];
}
