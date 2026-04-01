"use client";

import { UsersRound, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAdminUsers } from "@/hooks/use-admin-users";
import { UserSearch } from "@/components/admin/users/user-search";
import { UserTable } from "@/components/admin/users/user-table";
import { RolesPanel } from "@/components/admin/users/roles-panel";
import { Pagination } from "@/components/ui/pagination";

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const admin = useAdminUsers();

    const isSuperadmin = currentUser?.roles?.some(r => r.name === "superadmin" || r.name === "admin") ?? false;

    return (
        <div className="flex-1 relative overflow-hidden">
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/15 blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse [animation-delay:3s]" />
            </div>

            <div className="relative flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-8 mx-auto max-w-[1920px]">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center shrink-0">
                            <UsersRound className="size-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                                Benutzerverwaltung
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Benutzerkonten und Rollen verwalten.
                            </p>
                        </div>
                    </div>
                    <RolesPanel
                        roles={admin.roles}
                        permissions={admin.permissions}
                        isSuperadmin={isSuperadmin}
                        onCreateRole={admin.createRole}
                        onDeleteRole={admin.deleteRole}
                        onAddPermission={admin.addPermissionToRole}
                        onRemovePermission={admin.removePermissionFromRole}
                        onCreatePermission={admin.createPermission}
                        onDeletePermission={admin.deletePermission}
                    />
                </div>

                {/* Error */}
                {admin.error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl backdrop-blur-sm bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{admin.error}</span>
                    </div>
                )}

                {/* Users section — glass card */}
                <div className="backdrop-blur-xl bg-card/60 dark:bg-card/40 border border-primary/15 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
                    <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="size-7 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                                <UsersRound className="size-3.5 text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold text-foreground">Benutzer</h2>
                        </div>
                        <UserSearch
                            searchTerm={admin.searchTerm}
                            onSearchChange={admin.setSearchTerm}
                            resultCount={admin.filteredUsers.length}
                            totalCount={admin.meta?.total ?? admin.users.length}
                        />
                    </div>
                    <div className="px-4 sm:px-6 pb-5 sm:pb-6">
                        {admin.loading ? (
                            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                                <Loader2 className="size-4 animate-spin" />
                                <span className="text-xs">Laden...</span>
                            </div>
                        ) : (
                            <>
                                <UserTable
                                    users={admin.filteredUsers}
                                    roles={admin.roles}
                                    onAssignRole={admin.assignRole}
                                    onRemoveRole={admin.removeRole}
                                    onDeleteUser={admin.deleteUser}
                                />
                                {admin.meta && (
                                    <div className="mt-4">
                                        <Pagination meta={admin.meta} onPageChange={admin.setPage} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
