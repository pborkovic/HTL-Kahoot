"use client";

import { UsersRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAdminUsers } from "@/hooks/use-admin-users";
import { UserSearch } from "@/components/admin/users/user-search";
import { UserTable } from "@/components/admin/users/user-table";
import { RolesPanel } from "@/components/admin/users/roles-panel";

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const admin = useAdminUsers();

    const isSuperadmin = currentUser?.roles?.some(r => r.name === "superadmin") ?? false;

    return (
        <div className="flex-1">
            <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-8 mx-auto max-w-[1920px]">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-foreground flex items-center justify-center">
                        <UsersRound className="size-4.5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            Benutzerverwaltung
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Benutzerkonten und Rollen verwalten.
                        </p>
                    </div>
                </div>

                {/* Users section */}
                <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                    <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="size-7 rounded-md bg-foreground flex items-center justify-center">
                                <UsersRound className="size-3.5 text-primary-foreground" />
                            </div>
                            <h2 className="text-sm font-semibold text-foreground">Benutzer</h2>
                        </div>
                        <UserSearch
                            searchTerm={admin.searchTerm}
                            onSearchChange={admin.setSearchTerm}
                            resultCount={admin.filteredUsers.length}
                            totalCount={admin.users.length}
                        />
                    </div>
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                        <UserTable
                            users={admin.filteredUsers}
                            roles={admin.roles}
                            onAssignRole={admin.assignRole}
                            onRemoveRole={admin.removeRole}
                        />
                    </div>
                </div>

                {/* Roles & Permissions (Superadmin only) */}
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
        </div>
    );
}
