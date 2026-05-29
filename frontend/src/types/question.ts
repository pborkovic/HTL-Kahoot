/**
 * Interface for a question answer option.
 */
export interface AnswerOption {
    /** The unique identifier of the answer option. */
    id: string;
    /** The text content of the answer option. */
    text: string;
    /** Indicates if this answer option is correct. */
    is_correct: boolean;
    /** The sorting order of the answer option. */
    sort_order: number;
}

/**
 * Interface for a specific version of a question.
 */
export interface QuestionVersion {
    /** The unique identifier of the question version. */
    id: string;
    /** The version number. */
    version: number;
    /** The title or text of the question. */
    title: string;
    /** An optional explanation for the question. */
    explanation: string | null;
    /** The difficulty level of the question. */
    difficulty: number | null;
    /** The default points awarded for a correct answer. */
    default_points: number;
    /** The default time limit for answering the question in seconds. */
    default_time_limit: number | null;
    /** Indicates if the answer options should be randomized. */
    randomize_options: boolean;
    /** Additional configuration for the question. */
    config: Record<string, unknown>;
    /** The timestamp when the version was created. */
    created_at: string;
    /** The list of answer options for this version. */
    answer_options: AnswerOption[];
}

/**
 * Interface for media attached to a question.
 */
export interface QuestionMedia {
    /** The unique identifier of the question media. */
    id: string;
    /** The ID of the question this media belongs to. */
    question_id: string;
    /** The type of the media. */
    type: "image" | "video" | "code_snippet";
    /** The URL to the media resource. */
    url: string;
    /** Optional alternative text for the media. */
    alt_text: string | null;
    /** The sorting order of the media. */
    sort_order: number;
    /** The timestamp when the media was created. */
    created_at: string;
}

import type { Department } from "./department";

/**
 * Interface for a question.
 */
export interface Question {
    /** The unique identifier of the question. */
    id: string;
    /** The type of the question (e.g., 'multiple_choice', 'true_false'). */
    type: string;
    /** Indicates if the question is published and available for use. */
    is_published: boolean;
    /** The ID of the user who created the question. */
    created_by: string;
    /** The timestamp when the question was created. */
    created_at: string;
    /** The timestamp when the question was last updated. */
    updated_at: string;
    /** The timestamp when the question was deleted, if applicable. */
    deleted_at: string | null;
    /** The currently active version of the question. */
    current_version: QuestionVersion | null;
    /** The list of all versions of the question. */
    versions: QuestionVersion[];
    /** The list of media items attached to the question. */
    media?: QuestionMedia[];
    /** Departments this question is assigned to. */
    departments?: Department[];
}

/**
 * Pagination metadata for a question list.
 */
export interface PaginationMeta {
    /** The current page number. */
    current_page: number;
    /** The total number of pages. */
    last_page: number;
    /** The number of items per page. */
    per_page: number;
    /** The total number of items. */
    total: number;
}

/**
 * Interface for a response containing a list of questions.
 */
export interface QuestionsResponse {
    /** The list of questions. */
    data: Question[];
    /** The pagination metadata. */
    meta: PaginationMeta;
}
