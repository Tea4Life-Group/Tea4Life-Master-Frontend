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
