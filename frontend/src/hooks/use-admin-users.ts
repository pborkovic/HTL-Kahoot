"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { User, Role, Permission } from "@/types/auth";
import type { PaginationMeta } from "@/types/question";

interface UsersResponse {
    data: User[];
    meta: PaginationMeta;
}

interface RolesResponse {
    data: Role[];
}

interface PermissionsResponse {
    data: Permission[];
}

export interface UseAdminUsersReturn {
    users: User[];
    filteredUsers: User[];
    roles: Role[];
    permissions: Permission[];
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    loading: boolean;
    error: string | null;
    meta: PaginationMeta | null;
    page: number;
    setPage: (page: number) => void;
    assignRole: (userId: string, roleId: string) => Promise<void>;
    removeRole: (userId: string, roleId: string) => Promise<void>;
    createRole: (name: string) => Promise<void>;
    deleteRole: (roleId: string) => Promise<void>;
    addPermissionToRole: (roleId: string, permissionId: string) => Promise<void>;
    removePermissionFromRole: (roleId: string, permissionId: string) => Promise<void>;
    createPermission: (name: string) => Promise<void>;
    deletePermission: (permissionId: string) => Promise<void>;
    refetch: () => Promise<void>;
}

export function useAdminUsers(): UseAdminUsersReturn {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [searchTerm, setSearchTermState] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [page, setPageState] = useState<number>(1);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                per_page: "25",
                page: String(page),
            });
            if (searchTerm) {
                params.set("search", searchTerm);
            }

            const [usersRes, rolesRes, permsRes] = await Promise.all([
                apiFetch<UsersResponse>(`/v1/users?${params.toString()}`),
                apiFetch<RolesResponse>("/v1/roles"),
                apiFetch<PermissionsResponse>("/v1/permissions"),
            ]);

            setUsers(usersRes.data);
            setMeta(usersRes.meta);
            setRoles(rolesRes.data);
            setPermissions(permsRes.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Fehler beim Laden der Daten");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, page]);

    useEffect(() => {
        void fetchAll();
    }, [fetchAll]);

    const filteredUsers = users;

    function setSearchTerm(value: string): void {
        setPageState(1);
        setSearchTermState(value);
    }

    function setPage(newPage: number): void {
        setPageState(newPage);
    }

    const assignRole = useCallback(async (userId: string, roleId: string) => {
        await apiFetch(`/v1/users/${userId}/roles`, {
            method: "POST",
            body: JSON.stringify({ role_id: roleId }),
        });
        await fetchAll();
    }, [fetchAll]);

    const removeRole = useCallback(async (userId: string, roleId: string) => {
        await apiFetch(`/v1/users/${userId}/roles`, {
            method: "DELETE",
            body: JSON.stringify({ role_id: roleId }),
        });
        await fetchAll();
    }, [fetchAll]);

    const createRole = useCallback(async (name: string) => {
        await apiFetch("/v1/roles", {
            method: "POST",
            body: JSON.stringify({ name }),
        });
        await fetchAll();
    }, [fetchAll]);

    const deleteRole = useCallback(async (roleId: string) => {
        await apiFetch(`/v1/roles/${roleId}`, {
            method: "DELETE",
        });
        await fetchAll();
    }, [fetchAll]);

    const addPermissionToRole = useCallback(async (roleId: string, permissionId: string) => {
        await apiFetch(`/v1/roles/${roleId}/permissions`, {
            method: "POST",
            body: JSON.stringify({ permission_id: permissionId }),
        });
        await fetchAll();
    }, [fetchAll]);

    const removePermissionFromRole = useCallback(async (roleId: string, permissionId: string) => {
        await apiFetch(`/v1/roles/${roleId}/permissions`, {
            method: "DELETE",
            body: JSON.stringify({ permission_id: permissionId }),
        });
        await fetchAll();
    }, [fetchAll]);

    const createPermission = useCallback(async (name: string) => {
        await apiFetch("/v1/permissions", {
            method: "POST",
            body: JSON.stringify({ name }),
        });
        await fetchAll();
    }, [fetchAll]);

    const deletePermission = useCallback(async (permissionId: string) => {
        await apiFetch(`/v1/permissions/${permissionId}`, {
            method: "DELETE",
        });
        await fetchAll();
    }, [fetchAll]);

    return {
        users,
        filteredUsers,
        roles,
        permissions,
        searchTerm,
        setSearchTerm,
        loading,
        error,
        meta,
        page,
        setPage,
        assignRole,
        removeRole,
        createRole,
        deleteRole,
        addPermissionToRole,
        removePermissionFromRole,
        createPermission,
        deletePermission,
        refetch: fetchAll,
    };
}
