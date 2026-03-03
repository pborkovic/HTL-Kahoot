"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { StudentUser, StudentsResponse, ClassesResponse } from "@/types/student";

type StudentSortType =
    | "display_name-asc" | "display_name-desc"
    | "class_name-asc" | "class_name-desc"
    | "email-asc" | "email-desc";

export function useStudents() {
    const [students, setStudents] = useState<StudentUser[]>([]);
    const [displayStudents, setDisplayStudents] = useState<StudentUser[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [activeClassFilters, setActiveClassFilters] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
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

    function toggleClassFilter(className: string) {
        const next = new Set(activeClassFilters);
        if (next.has(className)){
            next.delete(className);
        }
        else{
            next.add(className);
        }
        setActiveClassFilters(next);
    }

    function sort(type: string) {
        const sorted = [...displayStudents];
        const [field, dir] = type.split("-") as [string, string];

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

    function toggleSelect(id: string) {
        const next = new Set(selectedIds);
        if (next.has(id)){
            next.delete(id);
        }
        else{
            next.add(id);
        }
        setSelectedIds(next);
    }

    function toggleSelectAll() {
        if (selectedIds.size === displayStudents.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(displayStudents.map(s => s.id)));
        }
    }

    function selectWholeClass(className: string) {
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

export type UseStudentsReturn = ReturnType<typeof useStudents>;
