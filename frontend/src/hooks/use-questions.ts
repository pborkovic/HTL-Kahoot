"use client";

import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from "react";
import { apiFetch } from "@/lib/api";
import type { Question, QuestionsResponse, PaginationMeta } from "@/types/question";

/**
 * Possible directions for sorting.
 */
type SortDirection = "asc" | "desc";

/**
 * Available fields for sorting questions.
 */
type QuestionSortField = "created_at" | "updated_at" | "type";

/**
 * Return type for the useQuestions hook.
 */
export interface UseQuestionsReturn {
    /** The list of questions fetched from the API. */
    questions: Question[];
    /** The list of questions currently being displayed (after local filtering/sorting if any). */
    displayQuestions: Question[];
    /** A set of IDs of the currently selected questions. */
    selectedIds: Set<string>;
    /** Function to update the set of selected IDs. */
    setSelectedIds: Dispatch<SetStateAction<Set<string>>>;
    /** The question currently being viewed in detail. */
    detailQuestion: Question | null;
    /** Function to set the question currently being viewed in detail. */
    setDetailQuestion: Dispatch<SetStateAction<Question | null>>;
    /** The current search term for filtering questions. */
    searchTerm: string;
    /**
     * Sets the search term and resets the page to 1.
     * @param value - The new search term.
     */
    setSearchTerm: (value: string) => void;
    /** A set of active filter types. */
    activeFilters: Set<string>;
    /**
     * Toggles a filter type on or off and resets the page to 1.
     * @param type - The question type to toggle.
     */
    toggleFilter: (type: string) => void;
    /** The field currently used for sorting. */
    sortField: QuestionSortField;
    /** The direction of the sort. */
    sortDirection: SortDirection;
    /**
     * Sets the sort field and direction, and resets the page to 1.
     * @param field - The field to sort by.
     * @param direction - The direction to sort in.
     */
    sort: (field: QuestionSortField, direction: SortDirection) => void;
    /** Indicates if the questions are currently being loaded. */
    loading: boolean;
    /** The error message if an error occurred during fetching. */
    error: string | null;
    /** Pagination metadata for the questions list. */
    meta: PaginationMeta | null;
    /** The current page number for pagination. */
    page: number;
    /**
     * Sets the current page number and clears selection.
     * @param page - The new page number.
     */
    setPage: (page: number) => void;
    /** A list of unique question types present in the current questions list. */
    uniqueTypes: string[];
    /**
     * Toggles the selection of a single question by its ID.
     * @param id - The ID of the question to toggle.
     */
    toggleSelect: (id: string) => void;
    /** Toggles the selection of all currently displayed questions. */
    toggleSelectAll: () => void;
    /** Indicates if all currently displayed questions are selected. */
    allSelected: boolean;
    /** Manually refetches the questions from the API. */
    refetch: () => void;
}

/**
 * Hook for managing a list of questions with filtering, sorting, and pagination.
 * 
 * @returns An object containing question data, filter/sort state, and management functions.
 */
export function useQuestions(): UseQuestionsReturn {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [displayQuestions, setDisplayQuestions] = useState<Question[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [detailQuestion, setDetailQuestion] = useState<Question | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
    const [sortField, setSortField] = useState<QuestionSortField>("created_at");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [page, setPageState] = useState<number>(1);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();

            params.set("per_page", "20");
            params.set("page", String(page));
            params.set("sort", sortField);
            params.set("direction", sortDirection);

            if (searchTerm){
                params.set("search", searchTerm);
            }
            if (activeFilters.size > 0) {
                const filterType = Array.from(activeFilters)[0];
                if (filterType){
                    params.set("type", filterType);
                }
            }

            const response = await apiFetch<QuestionsResponse>(`/v1/questions?${params.toString()}`);
            setQuestions(response.data);
            setDisplayQuestions(response.data);
            setMeta(response.meta);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Fehler beim Laden der Fragen");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, sortField, sortDirection, activeFilters, page]);

    useEffect(() => {
        void fetchQuestions();
    }, [fetchQuestions]);

    const uniqueTypes = Array.from(new Set(questions.map(q => q.type)));

    function setPage(newPage: number): void {
        setSelectedIds(new Set());
        setPageState(newPage);
    }

    function handleSearchChange(value: string): void {
        setPageState(1);
        setSearchTerm(value);
    }

    function toggleFilter(type: string): void {
        const next = new Set(activeFilters);
        if (next.has(type)){
            next.delete(type);
        }
        else{
            next.add(type);
        }
        setPageState(1);
        setActiveFilters(next);
    }

    function sort(field: QuestionSortField, direction: SortDirection): void {
        setPageState(1);
        setSortField(field);
        setSortDirection(direction);
    }

    function toggleSelect(id: string): void {
        const next = new Set(selectedIds);
        if (next.has(id)){
            next.delete(id);
        }
        else{
            next.add(id);
        }
        setSelectedIds(next);
    }

    function toggleSelectAll(): void {
        if (selectedIds.size === displayQuestions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(displayQuestions.map(q => q.id)));
        }
    }

    const allSelected = displayQuestions.length > 0 && selectedIds.size === displayQuestions.length;

    function refetch(): void {
        void fetchQuestions();
    }

    return {
        questions,
        displayQuestions,
        selectedIds,
        setSelectedIds,
        detailQuestion,
        setDetailQuestion,
        searchTerm,
        setSearchTerm: handleSearchChange,
        activeFilters,
        toggleFilter,
        sortField,
        sortDirection,
        sort,
        loading,
        error,
        meta,
        page,
        setPage,
        uniqueTypes,
        toggleSelect,
        toggleSelectAll,
        allSelected,
        refetch,
    };
}
