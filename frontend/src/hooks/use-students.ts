"use client";

import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from "react";
import { apiFetch } from "@/lib/api";
import type { StudentUser, StudentsResponse, ClassesResponse } from "@/types/student";

/**
 * Available fields for sorting students.
 */
type StudentSortField = "display_name" | "class_name" | "email";

/**
 * Possible directions for sorting.
 */
type SortDirection = "asc" | "desc";

/**
 * Combined type for student sorting, format: "field-direction".
 */
type StudentSortType =
    | `${StudentSortField}-${SortDirection}`;

/**
 * Return type for the useStudents hook.
 */
export interface UseStudentsReturn {
    /** The list of all students fetched from the API. */
    students: StudentUser[];
    /** The list of students currently being displayed. */
    displayStudents: StudentUser[];
    /** A set of IDs of the currently selected students. */
    selectedIds: Set<string>;
    /** Function to update the set of selected IDs. */
    setSelectedIds: Dispatch<SetStateAction<Set<string>>>;
    /** The current search term for filtering students. */
    searchTerm: string;
    /** Function to set the current search term. */
    setSearchTerm: Dispatch<SetStateAction<string>>;
    /** A set of active class filters. */
    activeClassFilters: Set<string>;
    /**
     * Toggles a class filter on or off.
     * @param className - The name of the class to toggle.
     */
    toggleClassFilter: (className: string) => void;
    /**
     * Sorts the displayed students list.
     * @param type - The sort field and direction.
     */
    sort: (type: StudentSortType) => void;
    /**
     * Toggles the selection of a single student by its ID.
     * @param id - The ID of the student to toggle.
     */
    toggleSelect: (id: string) => void;
    /** Toggles the selection of all currently displayed students. */
    toggleSelectAll: () => void;
    /**
     * Toggles the selection of all students in a specific class.
     * @param className - The name of the class to select/deselect.
     */
    selectWholeClass: (className: string) => void;
    /** A list of all unique class names. */
    uniqueClasses: string[];
    /** Indicates if all currently displayed students are selected. */
    allSelected: boolean;
    /** Indicates if the data is currently being loaded. */
    loading: boolean;
    /** The error message if an error occurred during fetching. */
    error: string | null;
}

/**
 * Hook for managing a list of students with filtering, sorting, and class-based selection.
 * 
 * @returns An object containing student data, filter/sort state, and management functions.
 */
export function useStudents(): UseStudentsReturn {
    const [students, setStudents] = useState<StudentUser[]>([]);
    const [displayStudents, setDisplayStudents] = useState<StudentUser[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [activeClassFilters, setActiveClassFilters] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [uniqueClasses, setUniqueClasses] = useState<string[]>([]);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();

            params.set("role", "student");
            params.set("per_page", "100");
            params.set("sort", "display_name");
            params.set("direction", "asc");

            if (searchTerm){
                params.set("search", searchTerm);
            }
            if (activeClassFilters.size > 0) {
                const className = Array.from(activeClassFilters)[0];
                if (className){
                    params.set("class", className);
                }
            }

            const [studentsRes, classesRes] = await Promise.all([
                apiFetch<StudentsResponse>(`/v1/users?${params.toString()}`),
                apiFetch<ClassesResponse>("/v1/users/classes"),
            ]);

            setStudents(studentsRes.data);
            setDisplayStudents(studentsRes.data);
            setUniqueClasses(classesRes.data.map(c => c.class_name).sort());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Fehler beim Laden der Schüler");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, activeClassFilters]);

    useEffect(() => {
        void fetchStudents();
    }, [fetchStudents]);

    function toggleClassFilter(className: string): void {
        const next = new Set(activeClassFilters);
        if (next.has(className)){
            next.delete(className);
        }
        else{
            next.add(className);
        }
        setActiveClassFilters(next);
    }

    function sort(type: StudentSortType): void {
        const sorted = [...displayStudents];
        const [field, dir] = type.split("-") as [StudentSortField, SortDirection];

        sorted.sort((a, b) => {
            let aVal = "";
            let bVal = "";
            if (field === "display_name") {
                aVal = a.display_name ?? a.email;
                bVal = b.display_name ?? b.email;
            } else if (field === "class_name") {
                aVal = a.class_name ?? "";
                bVal = b.class_name ?? "";
            } else if (field === "email") {
                aVal = a.email;
                bVal = b.email;
            }
            return dir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
        setDisplayStudents(sorted);
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
        if (selectedIds.size === displayStudents.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(displayStudents.map(s => s.id)));
        }
    }

    function selectWholeClass(className: string): void {
        const classStudents = students.filter(s => s.class_name === className);
        const next = new Set(selectedIds);
        const allSelected = classStudents.every(s => next.has(s.id));

        if (allSelected) {
            classStudents.forEach(s => next.delete(s.id));
        } else {
            classStudents.forEach(s => next.add(s.id));
        }

        setSelectedIds(next);
    }

    const allSelected = displayStudents.length > 0 && selectedIds.size === displayStudents.length;

    return {
        students,
        displayStudents,
        selectedIds,
        setSelectedIds,
        searchTerm,
        setSearchTerm,
        activeClassFilters,
        toggleClassFilter,
        sort,
        toggleSelect,
        toggleSelectAll,
        selectWholeClass,
        uniqueClasses,
        allSelected,
        loading,
        error,
    };
}

