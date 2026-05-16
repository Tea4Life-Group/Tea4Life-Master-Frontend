import type PaginationParams from "../base/PaginationParams";

export interface ProductQuery extends PaginationParams {
  keyword?: string | null;
  categoryId?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
}
