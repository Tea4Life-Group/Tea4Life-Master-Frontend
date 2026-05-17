import type { BlogReviewStatus } from "./BlogReviewStatus";

export interface CreateBlogReviewRequest {
  productId: string;
  productName?: string;
  title?: string;
  summary?: string;
  content?: string;
  rating: number;
  thumbnailUrl?: string;
}

export interface UpdateBlogReviewRequest {
  productName?: string;
  title: string;
  summary?: string;
  content: string;
  rating: number;
  thumbnailUrl?: string;
}

export interface ModerateBlogReviewRequest {
  status: Exclude<BlogReviewStatus, "PENDING">;
  rejectionReason?: string;
}

export interface CreateBlogReviewCommentRequest {
  content: string;
  parentCommentId?: string;
}

export interface CreateBlogReviewShareRequest {
  channel?: string;
}
