export interface AnswerOption {
    id: string;
    text: string;
    is_correct: boolean;
    sort_order: number;
}

export interface QuestionVersion {
    id: string;
    version: number;
    title: string;
    explanation: string | null;
    difficulty: number | null;
    default_points: number;
    default_time_limit: number | null;
    randomize_options: boolean;
    config: Record<string, unknown>;
    created_at: string;
    answer_options: AnswerOption[];
}

export interface Question {
    id: string;
    type: string;
    is_published: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    current_version: QuestionVersion | null;
    versions: QuestionVersion[];
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface QuestionsResponse {
    data: Question[];
    meta: PaginationMeta;
}
