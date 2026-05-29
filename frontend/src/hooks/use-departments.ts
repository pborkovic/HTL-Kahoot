"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Department, DepartmentsResponse } from "@/types/department";

interface UseDepartmentsReturn {
    departments: Department[];
    loading: boolean;
    error: string | null;
}

/**
 * Module-level cache so the departments list is fetched at most once per page load.
 */
let cache: Department[] | null = null;
let inflight: Promise<Department[]> | null = null;

function loadDepartments(): Promise<Department[]> {
    if (cache) return Promise.resolve(cache);
    if (inflight) return inflight;

    inflight = apiFetch<DepartmentsResponse>("/v1/departments")
        .then((res) => {
            cache = res.data;
            return cache;
        })
        .finally(() => {
            inflight = null;
        });

    return inflight;
}

/**
 * Hook that returns the cached list of departments, fetching once if needed.
 */
export function useDepartments(): UseDepartmentsReturn {
    const [departments, setDepartments] = useState<Department[]>(cache ?? []);
    const [loading, setLoading] = useState<boolean>(cache === null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (cache) {
            setDepartments(cache);
            setLoading(false);
            return;
        }

        let cancelled = false;
        loadDepartments()
            .then((data) => {
                if (!cancelled) setDepartments(data);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Fehler beim Laden der Abteilungen");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return { departments, loading, error };
}
