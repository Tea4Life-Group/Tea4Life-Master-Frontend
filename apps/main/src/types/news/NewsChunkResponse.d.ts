import type { NewsContentType } from "./NewsContentType";

export interface NewsChunkResponse {
  id: string;
  type: NewsContentType;
  content: string;
  sortIndex: number;
}
