"use client";

import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from "react";
import { apiFetch } from "@/lib/api";
import type { Question, QuestionsResponse, PaginationMeta } from "@/types/question";

type SortDirection = "asc" | "desc";

type QuestionSortField = "created_at" | "updated_at" | "type";

export interface UseQuestionsReturn {
    questions: Question[];
    displayQuestions: Question[];
    selectedIds: Set<string>;
    detailQuestion: Question | null;
    setDetailQuestion: Dispatch<SetStateAction<Question | null>>;
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    activeFilters: Set<string>;
    toggleFilter: (type: string) => void;
    sortField: QuestionSortField;
    sortDirection: SortDirection;
    sort: (field: QuestionSortField, direction: SortDirection) => void;
    loading: boolean;
    error: string | null;
    meta: PaginationMeta | null;
    uniqueTypes: string[];
    toggleSelect: (id: string) => void;
    toggleSelectAll: () => void;
    allSelected: boolean;
}

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

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();

            params.set("per_page", "100");
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
    }, [searchTerm, sortField, sortDirection, activeFilters]);

    useEffect(() => {
        void fetchQuestions();
    }, [fetchQuestions]);

    const uniqueTypes = Array.from(new Set(questions.map(q => q.type)));

    function toggleFilter(type: string): void {
        const next = new Set(activeFilters);
        if (next.has(type)){
            next.delete(type);
        }
        else{
            next.add(type);
        }
        setActiveFilters(next);
    }

    function sort(field: QuestionSortField, direction: SortDirection): void {
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

    return {
        questions,
        displayQuestions,
        selectedIds,
        detailQuestion,
        setDetailQuestion,
        searchTerm,
        setSearchTerm,
        activeFilters,
        toggleFilter,
        sortField,
        sortDirection,
        sort,
        loading,
        error,
        meta,
        uniqueTypes,
        toggleSelect,
        toggleSelectAll,
        allSelected,
    };
}

