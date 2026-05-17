import type { BlogReviewStatus } from "./BlogReviewStatus";

export interface BlogReviewResponse {
  id: string;
  productId: string;
  productName?: string;
  title: string;
  summary?: string;
  content: string;
  rating: number;
  thumbnailUrl?: string;
  status: BlogReviewStatus;
  rejectionReason?: string;
  authorKeycloakId: string;
  authorEmail: string;
  totalComments?: number;
  totalLikes?: number;
  totalShares?: number;
  likedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogReviewCommentResponse {
  id: string;
  reviewId: string;
  parentCommentId?: string;
  content: string;
  authorKeycloakId: string;
  authorEmail: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogReviewLikeResponse {
  reviewId: string;
  liked: boolean;
  totalLikes: number;
}

export interface BlogReviewShareResponse {
  reviewId: string;
  totalShares: number;
}

export type BlogReviewHistoryAction =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "MODERATED"
  | "COMMENTED"
  | "LIKED"
  | "UNLIKED"
  | "SHARED";

export interface BlogReviewHistoryResponse {
  id: string;
  reviewId: string;
  action: BlogReviewHistoryAction;
  actorKeycloakId: string;
  actorEmail: string;
  description?: string;
  createdAt: string;
}
