import type { PaginationMeta } from "@/types/question";

export interface QuizSession {
    id: string;
    game_pin: string;
    status: "lobby" | "active" | "finished";
    participants_count: number;
    started_at: string | null;
    finished_at: string | null;
    created_at: string;
    top_participants: {
        nickname: string;
        total_score: number;
    }[];
}

export interface QuizQuestionEntry {
    id: string;
    question_version_id: string;
    sort_order: number;
    weight: number;
    points_override: number | null;
    time_limit_override: number | null;
    question_version: {
        id: string;
        title: string;
        version: number;
        difficulty: number | null;
        default_points: number;
        default_time_limit: number | null;
    };
}

export interface Quiz {
    id: string;
    title: string;
    description: string | null;
    created_by: string;
    time_mode: "per_question" | "total";
    total_time_limit: number | null;
    speed_scoring: boolean;
    randomize_questions: boolean;
    is_published: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    quiz_questions_count?: number;
    sessions_count?: number;
    latest_session?: {
        id: string;
        game_pin: string;
        status: "lobby" | "active" | "finished";
        started_at: string | null;
        finished_at: string | null;
    } | null;
    quiz_questions?: QuizQuestionEntry[];
    participants?: QuizParticipant[];
    participants_count?: number;
}

export interface QuizParticipant {
    id: string;
    display_name: string | null;
    email: string;
    class_name: string | null;
}

export interface QuizzesResponse {
    data: Quiz[];
    meta: PaginationMeta;
}
