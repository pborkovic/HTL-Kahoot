/**
 * Represents the current status of a quiz session.
 */
export interface SessionStatus {
    /** The current phase of the quiz. */
    status: "lobby" | "active" | "finished";
    /** The index of the question currently being displayed, if active. */
    current_question_idx: number | null;
    /** Whether the current question is still open for answers. */
    is_question_open: boolean;
    /** The total number of questions in the quiz. */
    total_questions: number;
}

/**
 * Represents an answer option in the context of a quiz session.
 */
export interface AnswerOption {
    /** Unique identifier for the answer option. */
    id: string;
    /** The text content of the answer option. */
    text: string;
    /** The order in which the option was displayed. */
    sort_order: number;
}

/**
 * Types of quiz questions.
 */
export type QuestionType = "single_choice" | "multiple_choice" | "true_false" | "free_text";

/**
 * Represents a media item associated with a quiz question.
 */
export interface QuestionMediaItem {
    /** Unique identifier for the media item. */
    id: string;
    /** Type of media (e.g., image, video, code snippet). */
    type: "image" | "video" | "code_snippet";
    /** URL to the media resource. */
    url: string;
    /** Alternative text for accessibility. */
    alt_text: string | null;
}

/**
 * Information about the question currently being presented.
 */
export interface CurrentQuestion {
    /** The text content of the question. */
    question_text: string;
    /** The format of the question. */
    question_type: QuestionType;
    /** Associated media items for this question. */
    question_media?: QuestionMediaItem[];
    /** List of answer options for the question. */
    answer_options: AnswerOption[];
    /** Index of this question in the quiz sequence. */
    question_index: number;
    /** Total number of questions in the session. */
    total_questions: number;
    /** Time allowed to answer the question in seconds. */
    time_limit: number;
    /** Time remaining to answer the question in seconds. */
    time_remaining: number;
    /** Timestamp when the question was opened. */
    opened_at: string;
}

/**
 * Result of a participant's answer to a question.
 */
export interface AnswerResult {
    /** Whether the answer provided was correct. */
    is_correct: boolean | null;
    /** Number of points awarded for the answer. */
    score_awarded: number;
    /** How long it took the participant to answer in milliseconds. */
    time_taken_ms: number;
    /** Current number of consecutive correct answers. */
    answer_streak: number;
}

/**
 * Entry for a participant in the session leaderboard.
 */
export interface LeaderboardEntry {
    /** Current rank of the participant. */
    rank: number;
    /** Unique identifier for the participant. */
    participant_id: string;
    /** Display name of the participant. */
    nickname: string;
    /** Total points accumulated in the session. */
    total_score: number;
}

/**
 * Statistical data for an individual answer option's response count.
 */
export interface QuestionResultOption {
    /** Unique identifier for the answer option. */
    option_id: string;
    /** Text content of the answer option. */
    option_text: string;
    /** Number of participants who selected this option. */
    count: number;
    /** Whether this was a correct option. */
    is_correct: boolean;
}

/**
 * Aggregated results for a single question after it has closed.
 */
export interface QuestionResults {
    /** Distribution of responses across the answer options. */
    answer_distribution: QuestionResultOption[];
    /** Total number of responses received. */
    total_responses: number;
    /** Number of participants who answered correctly. */
    correct_count: number;
    /** Total number of participants in the session. */
    total_participants: number;
}

/**
 * Complete set of final results for a completed quiz session.
 */
export interface FinalResults {
    /** Unique identifier for the finished session. */
    session_id: string;
    /** Title of the quiz that was played. */
    quiz_title: string;
    /** Total number of questions in the quiz. */
    total_questions: number;
    /** Total number of participants in the session. */
    total_participants: number;
    /** Final rankings of participants. */
    leaderboard: LeaderboardEntry[];
    /** Whether any answers still require manual evaluation. */
    has_pending_evaluations?: boolean;
}
