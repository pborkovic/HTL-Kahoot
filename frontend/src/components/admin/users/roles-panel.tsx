"use client";

import { useState } from "react";
import { Plus, Trash2, X, Shield, Lock, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Role, Permission } from "@/types/auth";

interface RolesPanelProps {
    roles: Role[];
    permissions: Permission[];
    isSuperadmin: boolean;
    onCreateRole: (name: string) => Promise<void>;
    onDeleteRole: (roleId: string) => Promise<void>;
    onAddPermission: (roleId: string, permissionId: string) => Promise<void>;
    onRemovePermission: (roleId: string, permissionId: string) => Promise<void>;
    onCreatePermission: (name: string) => Promise<void>;
    onDeletePermission: (permissionId: string) => Promise<void>;
}

type Tab = "roles" | "permissions";

export function RolesPanel({
    roles,
    permissions,
    isSuperadmin,
    onCreateRole,
    onDeleteRole,
    onAddPermission,
    onRemovePermission,
    onCreatePermission,
    onDeletePermission,
}: RolesPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>("roles");
    const [newRoleName, setNewRoleName] = useState("");
    const [newPermName, setNewPermName] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");

    const selectedRole = roles.find(r => r.id === selectedRoleId);
    const availablePerms = selectedRole
        ? permissions.filter(p => !selectedRole.permissions?.some(rp => rp.id === p.id))
        : [];

    function handleCreateRole() {
        const trimmed = newRoleName.trim();
        if (!trimmed) {
            return;
        }
        onCreateRole(trimmed);
        setNewRoleName("");
    }

    function handleCreatePermission() {
        const trimmed = newPermName.trim();
        if (!trimmed) {
            return;
        }
        onCreatePermission(trimmed);
        setNewPermName("");
    }

    if (!isSuperadmin) {
        return null;
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 text-xs w-full sm:w-auto rounded-xl backdrop-blur-sm bg-background/40 border-border/40 hover:border-primary/30 hover:bg-background/60 transition-all duration-200 cursor-pointer"
                >
                    <Settings2 className="size-3.5" />
                    Rollen & Berechtigungen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col gap-0 p-0 text-popover-foreground backdrop-blur-xl bg-popover/90 dark:bg-popover/80 border-border/30 rounded-2xl shadow-2xl shadow-primary/5">
                <DialogHeader className="px-4 sm:px-6 pt-5 sm:pt-6 pb-0">
                    <DialogTitle className="flex items-center gap-2.5 text-base">
                        <div className="size-8 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                            <Settings2 className="size-4 text-primary" />
                        </div>
                        Rollen & Berechtigungen
                    </DialogTitle>
                </DialogHeader>

                {/* Tab bar */}
                <div className="flex gap-1.5 px-4 sm:px-6 pt-4 pb-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab("roles")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                            activeTab === "roles"
                                ? "bg-primary/15 text-primary border border-primary/20"
                                : "text-muted-foreground hover:text-popover-foreground hover:bg-muted/40"
                        }`}
                    >
                        <Shield className="size-3" />
                        Rollen
                        <span className="text-[10px] opacity-60 tabular-nums">{roles.length}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("permissions")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                            activeTab === "permissions"
                                ? "bg-primary/15 text-primary border border-primary/20"
                                : "text-muted-foreground hover:text-popover-foreground hover:bg-muted/40"
                        }`}
                    >
                        <Lock className="size-3" />
                        Berechtigungen
                        <span className="text-[10px] opacity-60 tabular-nums">{permissions.length}</span>
                    </button>
                </div>

                <div className="border-t border-border/20 mx-4 sm:mx-6 mt-2" />

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                    {activeTab === "roles" ? (
                        <div className="space-y-3">
                            {/* Create role */}
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder="Neue Rolle erstellen..."
                                    className="h-8 text-xs flex-1 rounded-lg bg-background/50 backdrop-blur-sm border-border/40 focus:border-primary/50 focus:ring-primary/30"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleCreateRole();
                                        }
                                    }}
                                />
                                <Button
                                    size="sm"
                                    onClick={handleCreateRole}
                                    disabled={newRoleName.trim().length === 0}
                                    className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg shadow-md shadow-primary/20 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none cursor-pointer"
                                >
                                    <Plus className="size-3.5" />
                                </Button>
                            </div>

                            {/* Role list */}
                            <div className="space-y-1.5">
                                {roles.length === 0 && (
                                    <p className="text-[11px] text-muted-foreground py-6 text-center">
                                        Keine Rollen vorhanden
                                    </p>
                                )}
                                {roles.map(role => (
                                    <div
                                        key={role.id}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-200 ${
                                            selectedRoleId === role.id
                                                ? "backdrop-blur-sm bg-primary/[0.08] border border-primary/20 shadow-sm shadow-primary/5"
                                                : "hover:bg-muted/30 border border-transparent"
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRoleId(role.id)}
                                            className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                                        >
                                            <Shield className="size-3 text-muted-foreground shrink-0" />
                                            <span className="font-medium text-popover-foreground truncate">{role.name}</span>
                                            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                                                {role.permissions?.length ?? 0} Rechte
                                            </span>
                                        </button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDeleteRole(role.id)}
                                            className="size-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0 cursor-pointer"
                                        >
                                            <Trash2 className="size-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Selected role permissions */}
                            {selectedRole && (
                                <div className="border-t border-border/20 pt-3 space-y-2.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest truncate">
                                            Berechtigungen für {selectedRole.name}
                                        </p>
                                        <Badge variant="outline" className="text-[10px] font-medium shrink-0 rounded-lg border-border/40">
                                            {selectedRole.permissions?.length ?? 0} zugewiesen
                                        </Badge>
                                    </div>

                                    {availablePerms.length > 0 && (
                                        <Select onValueChange={(val) => onAddPermission(selectedRole.id, val)}>
                                            <SelectTrigger className="h-8 text-xs rounded-lg bg-background/50 backdrop-blur-sm border-border/40">
                                                <SelectValue placeholder="Berechtigung hinzufügen..." />
                                            </SelectTrigger>
                                            <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                                                {availablePerms.map(p => (
                                                    <SelectItem key={p.id} value={p.id} className="text-xs cursor-pointer">
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    <div className="flex flex-wrap gap-1.5">
                                        {(selectedRole.permissions ?? []).length === 0 && (
                                            <p className="text-[11px] text-muted-foreground py-2 w-full text-center">
                                                Keine Berechtigungen zugewiesen
                                            </p>
                                        )}
                                        {(selectedRole.permissions ?? []).map(perm => (
                                            <Badge
                                                key={perm.id}
                                                variant="secondary"
                                                className="text-[10px] gap-1 pr-1 rounded-lg bg-secondary/60 backdrop-blur-sm border border-border/30"
                                            >
                                                {perm.name}
                                                <button
                                                    type="button"
                                                    onClick={() => onRemovePermission(selectedRole.id, perm.id)}
                                                    className="text-muted-foreground/50 hover:text-destructive transition-colors cursor-pointer"
                                                >
                                                    <X className="size-2.5" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Create permission */}
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={newPermName}
                                    onChange={(e) => setNewPermName(e.target.value)}
                                    placeholder="Neue Berechtigung erstellen..."
                                    className="h-8 text-xs flex-1 rounded-lg bg-background/50 backdrop-blur-sm border-border/40 focus:border-primary/50 focus:ring-primary/30"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleCreatePermission();
                                        }
                                    }}
                                />
                                <Button
                                    size="sm"
                                    onClick={handleCreatePermission}
                                    disabled={newPermName.trim().length === 0}
                                    className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg shadow-md shadow-primary/20 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none cursor-pointer"
                                >
                                    <Plus className="size-3.5" />
                                </Button>
                            </div>

                            {/* Permissions list */}
                            <div className="space-y-1.5">
                                {permissions.length === 0 && (
                                    <p className="text-[11px] text-muted-foreground py-6 text-center">
                                        Keine Berechtigungen vorhanden
                                    </p>
                                )}
                                {permissions.map(p => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/30 transition-all duration-200 border border-transparent hover:border-border/20"
                                    >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <Lock className="size-3 text-muted-foreground shrink-0" />
                                            <span className="text-xs text-popover-foreground truncate">{p.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDeletePermission(p.id)}
                                            className="size-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0 cursor-pointer"
                                        >
                                            <Trash2 className="size-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
