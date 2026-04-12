/**
 * Interface for the author of a feedback.
 */
export interface FeedbackAuthor {
  /** The unique identifier of the author. */
  id: string;
  /** The display name of the author. */
  display_name: string | null;
  /** The email address of the author. */
  email: string;
  /** The class name associated with the author. */
  class_name: string | null;
}

/**
 * Interface for the person who resolved the feedback.
 */
export interface FeedbackResolver {
  /** The unique identifier of the resolver. */
  id: string;
  /** The display name of the resolver. */
  display_name: string | null;
  /** The email address of the resolver. */
  email: string;
}

/**
 * Interface representing platform feedback.
 */
export interface PlatformFeedback {
  /** The unique identifier of the feedback. */
  id: string;
  /** The feedback message. */
  message: string;
  /** Indicates if the feedback is considered constructive. */
  is_constructive: boolean;
  /** The moderation status of the feedback. */
  moderation_status: "pending" | "approved" | "rejected";
  /** The reason for the moderation decision. */
  moderation_reason: string | null;
  /** Indicates if the feedback has been resolved. */
  is_resolved: boolean;
  /** The timestamp when the feedback was resolved. */
  resolved_at: string | null;
  /** The timestamp when the feedback was created. */
  created_at: string;
  /** The timestamp when the feedback was last updated. */
  updated_at: string;
  /** The author of the feedback. */
  author?: FeedbackAuthor;
  /** The person who resolved the feedback. */
  resolver?: FeedbackResolver | null;
}

/**
 * Pagination metadata for a feedback list.
 */
export interface FeedbackListMeta {
  /** The current page number. */
  current_page: number;
  /** The total number of pages. */
  last_page: number;
  /** The number of items per page. */
  per_page: number;
  /** The total number of feedback items. */
  total: number;
}

/**
 * Interface for a response containing a list of feedback.
 */
export interface FeedbackListResponse {
  /** The list of feedback items. */
  data: PlatformFeedback[];
  /** The pagination metadata. */
  meta: FeedbackListMeta;
}

/**
 * Interface for a response containing a single feedback item.
 */
export interface FeedbackSingleResponse {
  /** The feedback item. */
  data: PlatformFeedback;
}
