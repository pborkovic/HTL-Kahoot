/**
 * Represents an answer option in a report context.
 */
export interface ReportAnswerOption {
    /** Unique identifier for the answer option. */
    id: string;
    /** Text content of the answer option. */
    text: string;
    /** Whether this answer option is correct. */
    is_correct: boolean;
    /** Order in which the answer option was displayed. */
    sort_order: number;
}

/**
 * Represents a question's performance in a report.
 */
export interface ReportQuestion {
    /** Index of the question in the quiz. */
    question_index: number;
    /** The text of the question. */
    question_text: string;
    /** Type of the question (e.g., multiple choice, true/false). */
    question_type?: string;
    /** Whether the participant answered correctly. Null if not applicable. */
    is_correct: boolean | null;
    /** Score awarded to the participant for this question. */
    score_awarded: number;
    /** Time taken by the participant to answer in milliseconds. */
    time_taken_ms: number | null;
    /** Available answer options for the question. */
    answer_options: ReportAnswerOption[];
    /** IDs of the options selected by the participant. */
    selected_option_ids: string[];
    /** Text provided as an answer, if applicable. */
    answer_text?: string;
}

/**
 * Represents a participant's overall performance in a quiz report.
 */
export interface ReportParticipant {
    /** Unique identifier for the participant in this session. */
    participant_id: string;
    /** ID of the registered user, if the participant is logged in. */
    user_id: string | null;
    /** Nickname used by the participant in the session. */
    nickname: string;
    /** Total score accumulated by the participant. */
    total_score: number;
    /** Final rank of the participant in the session. */
    rank: number;
    /** Number of questions answered correctly. */
    correct_count: number;
    /** Total number of questions answered by the participant. */
    total_answered: number;
    /** Percentage of correct answers (0-1). */
    accuracy: number;
    /** Average time taken per question in milliseconds. */
    avg_time_ms: number | null;
    /** List of individual question results for this participant. */
    questions: ReportQuestion[];
}

/**
 * Represents a complete report for a quiz session.
 */
export interface SessionReport {
    /** Unique identifier for the quiz session. */
    session_id: string;
    /** Title of the quiz being reported. */
    quiz_title: string;
    /** Total number of questions in the quiz. */
    total_questions: number;
    /** Total number of participants who joined the session. */
    total_participants: number;
    /** Timestamp when the session started. */
    started_at: string | null;
    /** Timestamp when the session finished. */
    finished_at: string | null;
    /** List of results for each participant in the session. */
    participants: ReportParticipant[];
}
