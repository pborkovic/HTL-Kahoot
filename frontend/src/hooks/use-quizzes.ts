"use client";

import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from "react";
import { apiFetch } from "@/lib/api";
import type { Quiz, QuizzesResponse } from "@/types/quiz";
import type { PaginationMeta } from "@/types/question";

type SortDirection = "asc" | "desc";
type QuizSortField = "created_at" | "title" | "is_published";

export interface UseQuizzesReturn {
    quizzes: Quiz[];
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    sortField: QuizSortField;
    sortDirection: SortDirection;
    sort: (field: QuizSortField, direction: SortDirection) => void;
    loading: boolean;
    error: string | null;
    meta: PaginationMeta | null;
    page: number;
    setPage: (page: number) => void;
    detailQuiz: Quiz | null;
    setDetailQuiz: Dispatch<SetStateAction<Quiz | null>>;
    refetch: () => void;
}

export function useQuizzes(): UseQuizzesReturn {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [searchTerm, setSearchTermState] = useState<string>("");
    const [sortField, setSortField] = useState<QuizSortField>("created_at");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [page, setPageState] = useState<number>(1);
    const [detailQuiz, setDetailQuiz] = useState<Quiz | null>(null);

    const fetchQuizzes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.set("per_page", "20");
            params.set("page", String(page));
            params.set("sort", sortField);
            params.set("direction", sortDirection);

            if (searchTerm) {
                params.set("search", searchTerm);
            }

            const response = await apiFetch<QuizzesResponse>(`/v1/quizzes?${params.toString()}`);
            setQuizzes(response.data);
            setMeta(response.meta);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Fehler beim Laden der Quizze");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, sortField, sortDirection, page]);

    useEffect(() => {
        void fetchQuizzes();
    }, [fetchQuizzes]);

    function setSearchTerm(value: string): void {
        setPageState(1);
        setSearchTermState(value);
    }

    function sort(field: QuizSortField, direction: SortDirection): void {
        setPageState(1);
        setSortField(field);
        setSortDirection(direction);
    }

    function setPage(newPage: number): void {
        setPageState(newPage);
    }

    function refetch(): void {
        void fetchQuizzes();
    }

    return {
        quizzes,
        searchTerm,
        setSearchTerm,
        sortField,
        sortDirection,
        sort,
        loading,
        error,
        meta,
        page,
        setPage,
        detailQuiz,
        setDetailQuiz,
        refetch,
    };
}
