/**
 * Represents an answer option for a quiz question.
 */
export type AnswerOption = {
    /** Unique identifier for the answer option. */
    id: string;
    /** Text content of the answer option. */
    text: string;
    /** Whether this answer option is correct. */
    is_correct: boolean;
    /** Order in which the answer option should be displayed. */
    sort_order: number;
};

/**
 * Details of a student's answer to a specific question.
 */
export type StudentAnswerDetails = {
    /** Unique identifier for the participant's response. */
    response_id: string;
    /** Unique identifier for the participant in the session. */
    participant_id: string;
    /** Nickname of the student. */
    nickname: string;
    /** IDs of the answer options selected by the student. */
    selected_option_ids: string[];
    /** Whether the answer was correct. Null if not applicable or pending. */
    is_correct: boolean | null;
    /** Points awarded to the student for this answer. */
    score_awarded: number;
    /** Time taken in milliseconds to provide the answer. */
    time_taken_ms: number | null;
    /** Written text for questions requiring text input. */
    answer_text?: string;
};

/**
 * Information for reviewing a single quiz question and its participant responses.
 */
export type QuestionReview = {
    /** Index of the question within the quiz. */
    question_index: number;
    /** The text content of the question. */
    question_text: string;
    /** Type of question (e.g., multiple choice). */
    question_type?: string;
    /** List of all possible answer options for the question. */
    answer_options: AnswerOption[];
    /** List of all participant answers for this specific question. */
    student_answers: StudentAnswerDetails[];
};

/**
 * Complete set of review data for a quiz session.
 */
export type FullReviewResponse = {
    /** Unique identifier for the quiz session. */
    session_id: string;
    /** Title of the quiz being reviewed. */
    quiz_title: string;
    /** List of questions and their associated participant answers. */
    questions: QuestionReview[];
};

/**
 * Properties for the student question review component.
 */
export type StudentQuestionReviewProps = {
    /** ID of the student whose answers are being reviewed. */
    studentId: string;
    /** Game PIN of the quiz session. */
    gamePin: string;
};
