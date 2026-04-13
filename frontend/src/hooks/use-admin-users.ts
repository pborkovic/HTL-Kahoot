"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { User, Role, Permission } from "@/types/auth";
import type { PaginationMeta } from "@/types/question";

/**
 * Interface for the response containing user data and pagination metadata.
 */
interface UsersResponse {
    /** The list of users. */
    data: User[];
    /** The pagination metadata. */
    meta: PaginationMeta;
}

/**
 * Interface for the response containing role data.
 */
interface RolesResponse {
    /** The list of roles. */
    data: Role[];
}

/**
 * Interface for the response containing permission data.
 */
interface PermissionsResponse {
    /** The list of permissions. */
    data: Permission[];
}

/**
 * Return type for the useAdminUsers hook.
 */
export interface UseAdminUsersReturn {
    /** The list of all users. */
    users: User[];
    /** The list of users filtered by the search term. */
    filteredUsers: User[];
    /** The list of all available roles. */
    roles: Role[];
    /** The list of all available permissions. */
    permissions: Permission[];
    /** The current search term for filtering users. */
    searchTerm: string;
    /**
     * Sets the search term and resets the page to 1.
     * @param value - The new search term.
     */
    setSearchTerm: (value: string) => void;
    /** Indicates if the data is currently being loaded. */
    loading: boolean;
    /** The error message if an error occurred during fetching. */
    error: string | null;
    /** Pagination metadata for the users list. */
    meta: PaginationMeta | null;
    /** The current page number for pagination. */
    page: number;
    /**
     * Sets the current page number.
     * @param page - The new page number.
     */
    setPage: (page: number) => void;
    /**
     * Assigns a role to a user.
     * @param userId - The ID of the user.
     * @param roleId - The ID of the role to assign.
     */
    assignRole: (userId: string, roleId: string) => Promise<void>;
    /**
     * Removes a role from a user.
     * @param userId - The ID of the user.
     * @param roleId - The ID of the role to remove.
     */
    removeRole: (userId: string, roleId: string) => Promise<void>;
    /**
     * Deletes a user.
     * @param userId - The ID of the user to delete.
     */
    deleteUser: (userId: string) => Promise<void>;
    /**
     * Creates a new role.
     * @param name - The name of the new role.
     */
    createRole: (name: string) => Promise<void>;
    /**
     * Deletes a role.
     * @param roleId - The ID of the role to delete.
     */
    deleteRole: (roleId: string) => Promise<void>;
    /**
     * Adds a permission to a role.
     * @param roleId - The ID of the role.
     * @param permissionId - The ID of the permission to add.
     */
    addPermissionToRole: (roleId: string, permissionId: string) => Promise<void>;
    /**
     * Removes a permission from a role.
     * @param roleId - The ID of the role.
     * @param permissionId - The ID of the permission to remove.
     */
    removePermissionFromRole: (roleId: string, permissionId: string) => Promise<void>;
    /**
     * Creates a new permission.
     * @param name - The name of the new permission.
     */
    createPermission: (name: string) => Promise<void>;
    /**
     * Deletes a permission.
     * @param permissionId - The ID of the permission to delete.
     */
    deletePermission: (permissionId: string) => Promise<void>;
    /** Manually refetches all data. */
    refetch: () => Promise<void>;
}

/**
 * Hook for managing users, roles, and permissions in the admin interface.
 * 
 * @returns An object containing user data, search state, and management functions.
 */
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

    const deleteUser = useCallback(async (userId: string) => {
        await apiFetch(`/v1/users/${userId}`, { method: "DELETE" });
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
        deleteUser,
        createRole,
        deleteRole,
        addPermissionToRole,
        removePermissionFromRole,
        createPermission,
        deletePermission,
        refetch: fetchAll,
    };
}
