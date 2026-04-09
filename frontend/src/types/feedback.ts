export interface FeedbackAuthor {
  id: string;
  display_name: string | null;
  email: string;
  class_name: string | null;
}

export interface FeedbackResolver {
  id: string;
  display_name: string | null;
  email: string;
}

export interface PlatformFeedback {
  id: string;
  message: string;
  is_constructive: boolean;
  moderation_status: "pending" | "approved" | "rejected";
  moderation_reason: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  author?: FeedbackAuthor;
  resolver?: FeedbackResolver | null;
}

export interface FeedbackListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface FeedbackListResponse {
  data: PlatformFeedback[];
  meta: FeedbackListMeta;
}

export interface FeedbackSingleResponse {
  data: PlatformFeedback;
}
