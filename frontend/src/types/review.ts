export type AnswerOption = {
    id: string;
    text: string;
    is_correct: boolean;
    sort_order: number;
};

export type StudentAnswerDetails = {
    response_id: string;
    participant_id: string;
    nickname: string;
    selected_option_ids: string[];
    is_correct: boolean | null;
    score_awarded: number;
    time_taken_ms: number | null;
    answer_text?: string;
};

export type QuestionReview = {
    question_index: number;
    question_text: string;
    question_type?: string;
    answer_options: AnswerOption[];
    student_answers: StudentAnswerDetails[];
};

export type FullReviewResponse = {
    session_id: string;
    quiz_title: string;
    questions: QuestionReview[];
};

export type StudentQuestionReviewProps = {
    studentId: string;
    gamePin: string;
};
