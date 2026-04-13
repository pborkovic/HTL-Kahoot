import type { PaginationMeta } from "@/types/question";

/**
 * Represents a session of a quiz being played.
 */
export interface QuizSession {
    /** Unique identifier for the quiz session. */
    id: string;
    /** Game PIN used by participants to join the session. */
    game_pin: string;
    /** Current status of the quiz session. */
    status: "lobby" | "active" | "finished";
    /** Number of participants currently in the session. */
    participants_count: number;
    /** Timestamp when the session started. */
    started_at: string | null;
    /** Timestamp when the session finished. */
    finished_at: string | null;
    /** Timestamp when the session was created. */
    created_at: string;
    /** List of top performing participants in the session. */
    top_participants: {
        /** Participant's nickname. */
        nickname: string;
        /** Participant's total score. */
        total_score: number;
    }[];
}

/**
 * Represents an entry of a question within a quiz, including overrides.
 */
export interface QuizQuestionEntry {
    /** Unique identifier for the question entry in the quiz. */
    id: string;
    /** ID of the specific question version used. */
    question_version_id: string;
    /** Order in which the question appears in the quiz. */
    sort_order: number;
    /** Weight of the question in scoring. */
    weight: number;
    /** Overridden points for this question in the quiz, if any. */
    points_override: number | null;
    /** Overridden time limit for this question in the quiz, if any. */
    time_limit_override: number | null;
    /** Detailed information about the question version. */
    question_version: {
        /** Unique identifier for the question version. */
        id: string;
        /** Title or text of the question. */
        title: string;
        /** Version number of the question. */
        version: number;
        /** Difficulty level of the question. */
        difficulty: number | null;
        /** Default points for the question. */
        default_points: number;
        /** Default time limit for the question in seconds. */
        default_time_limit: number | null;
    };
}

/**
 * Represents a complete quiz object.
 */
export interface Quiz {
    /** Unique identifier for the quiz. */
    id: string;
    /** Title of the quiz. */
    title: string;
    /** Description of the quiz content. */
    description: string | null;
    /** ID of the user who created the quiz. */
    created_by: string;
    /** How time limits are applied: per question or for the total quiz. */
    time_mode: "per_question" | "total";
    /** Total time limit for the quiz in seconds, if applicable. */
    total_time_limit: number | null;
    /** Whether speed scoring is enabled (faster answers get more points). */
    speed_scoring: boolean;
    /** Whether to randomize the order of questions for each session. */
    randomize_questions: boolean;
    /** Whether the quiz is published and available for play. */
    is_published: boolean;
    /** Timestamp when the quiz was created. */
    created_at: string;
    /** Timestamp when the quiz was last updated. */
    updated_at: string;
    /** Timestamp when the quiz was deleted (soft delete). */
    deleted_at: string | null;
    /** Number of questions in the quiz. */
    quiz_questions_count?: number;
    /** Total number of sessions played for this quiz. */
    sessions_count?: number;
    /** Details of the most recent session played for this quiz. */
    latest_session?: {
        /** Unique identifier for the latest session. */
        id: string;
        /** Game PIN for the latest session. */
        game_pin: string;
        /** Status of the latest session. */
        status: "lobby" | "active" | "finished";
        /** Timestamp when the latest session started. */
        started_at: string | null;
        /** Timestamp when the latest session finished. */
        finished_at: string | null;
    } | null;
    /** List of question entries in this quiz. */
    quiz_questions?: QuizQuestionEntry[];
    /** List of participants allowed in this quiz (if restricted). */
    participants?: QuizParticipant[];
    /** Number of participants in the quiz. */
    participants_count?: number;
}

/**
 * Represents a participant associated with a quiz.
 */
export interface QuizParticipant {
    /** Unique identifier for the participant. */
    id: string;
    /** Display name of the participant. */
    display_name: string | null;
    /** Email address of the participant. */
    email: string;
    /** Class name the participant belongs to. */
    class_name: string | null;
}

/**
 * Represents a paginated response containing quiz objects.
 */
export interface QuizzesResponse {
    /** Array of quiz objects. */
    data: Quiz[];
    /** Pagination metadata. */
    meta: PaginationMeta;
}
