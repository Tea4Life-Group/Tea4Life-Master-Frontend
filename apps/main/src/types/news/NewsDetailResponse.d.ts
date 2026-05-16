import type { NewsCategoryResponse } from "./NewsCategoryResponse";
import type { NewsChunkResponse } from "./NewsChunkResponse";

export interface NewsDetailResponse {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  category: NewsCategoryResponse;
  chunks: NewsChunkResponse[];
  createdAt: string;
  updatedAt: string;
}
