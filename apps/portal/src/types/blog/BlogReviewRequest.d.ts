import type { BlogReviewStatus } from "./BlogReviewStatus";

export interface ModerateBlogReviewRequest {
  status: Exclude<BlogReviewStatus, "PENDING">;
  rejectionReason?: string;
}
