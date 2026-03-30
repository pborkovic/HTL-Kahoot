"use client";

import { MoreHorizontal, ShieldCheck, ShieldX, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User, Role } from "@/types/auth";

interface UserTableProps {
    users: User[];
    roles: Role[];
    onAssignRole: (userId: string, roleId: string) => Promise<void>;
    onRemoveRole: (userId: string, roleId: string) => Promise<void>;
}

const ROLE_COLORS: Record<string, string> = {
    superadmin: "bg-red-500/10 text-red-600 hover:bg-red-500/10 border border-red-500/20",
    admin: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 border border-amber-500/20",
    teacher: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/10 border border-blue-500/20",
    student: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border border-emerald-500/20",
};

function getRoleColor(name: string): string {
    return ROLE_COLORS[name] ?? "bg-muted text-muted-foreground hover:bg-muted border border-border/40";
}

function UserActions({ user, roles, onAssignRole, onRemoveRole }: {
    user: User;
    roles: Role[];
    onAssignRole: (userId: string, roleId: string) => Promise<void>;
    onRemoveRole: (userId: string, roleId: string) => Promise<void>;
}) {
    const availableRoles = roles.filter(r => !user.roles.some(ur => ur.id === r.id));

    if (availableRoles.length === 0 && user.roles.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="size-7 p-0 rounded-lg hover:bg-primary/10 cursor-pointer">
                    <MoreHorizontal className="size-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                {availableRoles.length > 0 && (
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="text-xs cursor-pointer">
                            <ShieldCheck className="size-3.5 mr-2" />
                            Rolle zuweisen
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                            {availableRoles.map(role => (
                                <DropdownMenuItem
                                    key={role.id}
                                    className="text-xs cursor-pointer"
                                    onClick={() => onAssignRole(user.id, role.id)}
                                >
                                    {role.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                )}
                {user.roles.length > 0 && (
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="text-xs cursor-pointer">
                            <ShieldX className="size-3.5 mr-2" />
                            Rolle entfernen
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                            {user.roles.map(role => (
                                <DropdownMenuItem
                                    key={role.id}
                                    className="text-xs text-destructive cursor-pointer"
                                    onClick={() => onRemoveRole(user.id, role.id)}
                                >
                                    {role.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/* ── Mobile card view ── */
function UserCard({ user, roles, onAssignRole, onRemoveRole }: {
    user: User;
    roles: Role[];
    onAssignRole: (userId: string, roleId: string) => Promise<void>;
    onRemoveRole: (userId: string, roleId: string) => Promise<void>;
}) {
    return (
        <div className="backdrop-blur-sm bg-background/40 dark:bg-background/20 border border-border/30 rounded-xl p-3.5 space-y-2.5 transition-all duration-200 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5">
            <div className="flex items-start justify-between">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">
                        {user.display_name ?? user.username ?? user.email.split("@")[0]}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <Badge className={`text-[10px] font-medium border px-1.5 py-0 ${
                        user.is_active
                            ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/20"
                            : "bg-red-500/10 text-red-600 hover:bg-red-500/10 border-red-500/20"
                    }`}>
                        {user.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                    <UserActions user={user} roles={roles} onAssignRole={onAssignRole} onRemoveRole={onRemoveRole} />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                    {user.roles.map(role => (
                        <Badge
                            key={role.id}
                            className={`text-[10px] font-medium px-1.5 py-0 ${getRoleColor(role.name)}`}
                        >
                            {role.name}
                        </Badge>
                    ))}
                    {user.roles.length === 0 && (
                        <span className="text-[10px] text-muted-foreground/50">Keine Rolle</span>
                    )}
                </div>
                {user.last_login_at && (
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                        {new Date(user.last_login_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                    </span>
                )}
            </div>
        </div>
    );
}

export function UserTable({ users, roles, onAssignRole, onRemoveRole }: UserTableProps) {
    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-1">
                <UserX className="size-5 mb-1" />
                <span className="text-xs">Keine Benutzer gefunden</span>
            </div>
        );
    }

    return (
        <>
            {/* Mobile: card list */}
            <div className="space-y-2.5 md:hidden">
                {users.map(user => (
                    <UserCard
                        key={user.id}
                        user={user}
                        roles={roles}
                        onAssignRole={onAssignRole}
                        onRemoveRole={onRemoveRole}
                    />
                ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block rounded-xl border border-border/30 max-h-[600px] overflow-auto backdrop-blur-sm bg-background/20">
                <Table>
                    <TableHeader className="sticky top-0 z-10">
                        <TableRow className="bg-muted/60 backdrop-blur-md hover:bg-muted/60 border-b border-border/30">
                            <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Name</TableHead>
                            <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">E-Mail</TableHead>
                            <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Rollen</TableHead>
                            <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground text-center w-20">Status</TableHead>
                            <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground text-center hidden lg:table-cell w-28">Letzter Login</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id} className="hover:bg-primary/[0.03] transition-colors duration-150 border-b border-border/20">
                                <TableCell className="text-xs font-medium text-card-foreground py-3">
                                    {user.display_name ?? user.username ?? user.email.split("@")[0]}
                                </TableCell>
                                <TableCell className="text-[11px] text-muted-foreground py-3 truncate max-w-[200px]">
                                    {user.email}
                                </TableCell>
                                <TableCell className="py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles.map(role => (
                                            <Badge
                                                key={role.id}
                                                className={`text-[10px] font-medium px-1.5 py-0 ${getRoleColor(role.name)}`}
                                            >
                                                {role.name}
                                            </Badge>
                                        ))}
                                        {user.roles.length === 0 && (
                                            <span className="text-[10px] text-muted-foreground/50">Keine Rolle</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center py-3">
                                    <Badge className={`text-[10px] font-medium px-1.5 py-0 ${
                                        user.is_active
                                            ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border border-emerald-500/20"
                                            : "bg-red-500/10 text-red-600 hover:bg-red-500/10 border border-red-500/20"
                                    }`}>
                                        {user.is_active ? "Aktiv" : "Inaktiv"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-[10px] text-muted-foreground text-center hidden lg:table-cell py-3 tabular-nums">
                                    {user.last_login_at
                                        ? new Date(user.last_login_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })
                                        : "\u2014"
                                    }
                                </TableCell>
                                <TableCell className="py-3">
                                    <UserActions user={user} roles={roles} onAssignRole={onAssignRole} onRemoveRole={onRemoveRole} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
