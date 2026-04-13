"use client";

import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from "react";
import { apiFetch } from "@/lib/api";
import type { Quiz, QuizzesResponse } from "@/types/quiz";
import type { PaginationMeta } from "@/types/question";

/**
 * Possible directions for sorting.
 */
type SortDirection = "asc" | "desc";

/**
 * Available fields for sorting quizzes.
 */
type QuizSortField = "created_at" | "title" | "is_published";

/**
 * Return type for the useQuizzes hook.
 */
export interface UseQuizzesReturn {
    /** The list of quizzes fetched from the API. */
    quizzes: Quiz[];
    /** The current search term for filtering quizzes. */
    searchTerm: string;
    /**
     * Sets the search term and resets the page to 1.
     * @param value - The new search term.
     */
    setSearchTerm: (value: string) => void;
    /** The field currently used for sorting. */
    sortField: QuizSortField;
    /** The direction of the sort. */
    sortDirection: SortDirection;
    /**
     * Sets the sort field and direction, and resets the page to 1.
     * @param field - The field to sort by.
     * @param direction - The direction to sort in.
     */
    sort: (field: QuizSortField, direction: SortDirection) => void;
    /** Indicates if the quizzes are currently being loaded. */
    loading: boolean;
    /** The error message if an error occurred during fetching. */
    error: string | null;
    /** Pagination metadata for the quizzes list. */
    meta: PaginationMeta | null;
    /** The current page number for pagination. */
    page: number;
    /**
     * Sets the current page number.
     * @param page - The new page number.
     */
    setPage: (page: number) => void;
    /** The quiz currently being viewed in detail. */
    detailQuiz: Quiz | null;
    /** Function to set the quiz currently being viewed in detail. */
    setDetailQuiz: Dispatch<SetStateAction<Quiz | null>>;
    /** Manually refetches the quizzes from the API. */
    refetch: () => void;
}

/**
 * Hook for managing a list of quizzes with filtering, sorting, and pagination.
 * 
 * @returns An object containing quiz data, filter/sort state, and management functions.
 */
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
