export interface ReportAnswerOption {
    id: string;
    text: string;
    is_correct: boolean;
    sort_order: number;
}

export interface ReportQuestion {
    question_index: number;
    question_text: string;
    is_correct: boolean | null;
    score_awarded: number;
    time_taken_ms: number | null;
    answer_options: ReportAnswerOption[];
    selected_option_ids: string[];
}

export interface ReportParticipant {
    participant_id: string;
    user_id: string | null;
    nickname: string;
    total_score: number;
    rank: number;
    correct_count: number;
    total_answered: number;
    accuracy: number;
    avg_time_ms: number | null;
    questions: ReportQuestion[];
}

export interface SessionReport {
    session_id: string;
    quiz_title: string;
    total_questions: number;
    total_participants: number;
    started_at: string | null;
    finished_at: string | null;
    participants: ReportParticipant[];
}
