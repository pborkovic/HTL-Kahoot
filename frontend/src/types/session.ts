export interface SessionStatus {
    status: "lobby" | "active" | "finished";
    current_question_idx: number | null;
    is_question_open: boolean;
    total_questions: number;
}

export interface AnswerOption {
    id: string;
    text: string;
    sort_order: number;
}

export interface CurrentQuestion {
    question_text: string;
    answer_options: AnswerOption[];
    question_index: number;
    total_questions: number;
    time_limit: number;
    time_remaining: number;
    opened_at: string;
}

export interface AnswerResult {
    is_correct: boolean;
    score_awarded: number;
    time_taken_ms: number;
}

export interface LeaderboardEntry {
    rank: number;
    participant_id: string;
    nickname: string;
    total_score: number;
}

export interface QuestionResultOption {
    option_id: string;
    option_text: string;
    count: number;
    is_correct: boolean;
}

export interface QuestionResults {
    answer_distribution: QuestionResultOption[];
    total_responses: number;
    correct_count: number;
    total_participants: number;
}

export interface FinalResults {
    session_id: string;
    quiz_title: string;
    total_questions: number;
    total_participants: number;
    leaderboard: LeaderboardEntry[];
}
