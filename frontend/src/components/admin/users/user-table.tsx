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
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { User, Role } from "@/types/auth";

interface UserTableProps {
    users: User[];
    roles: Role[];
    onAssignRole: (userId: string, roleId: string) => Promise<void>;
    onRemoveRole: (userId: string, roleId: string) => Promise<void>;
}

const ROLE_COLORS: Record<string, string> = {
    superadmin: "bg-red-500/10 text-red-600 hover:bg-red-500/10",
    admin: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/10",
    teacher: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/10",
    student: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10",
};

function getRoleColor(name: string): string {
    return ROLE_COLORS[name] ?? "bg-muted text-muted-foreground hover:bg-muted";
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
        <div className="rounded-lg border border-border/60 max-h-[600px] overflow-auto">
            <Table>
                <TableHeader className="sticky top-0 z-10">
                    <TableRow className="bg-muted hover:bg-muted border-b border-border/60">
<TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Name</TableHead>
                        <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground hidden md:table-cell">E-Mail</TableHead>
                        <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Rollen</TableHead>
                        <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground text-center hidden sm:table-cell w-20">Status</TableHead>
                        <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground text-center hidden lg:table-cell w-28">Letzter Login</TableHead>
                        <TableHead className="w-10" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map(user => {
                        const availableRoles = roles.filter(r => !user.roles.some(ur => ur.id === r.id));
                        return (
                            <TableRow key={user.id} className="hover:bg-muted/30">
                                <TableCell className="text-xs font-medium py-2.5">
                                    {user.username ?? user.email.split("@")[0]}
                                </TableCell>
                                <TableCell className="text-[11px] text-muted-foreground hidden md:table-cell py-2.5 truncate max-w-[200px]">
                                    {user.email}
                                </TableCell>
                                <TableCell className="py-2.5">
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles.map(role => (
                                            <Badge
                                                key={role.id}
                                                className={`text-[10px] font-medium border-0 px-1.5 py-0 ${getRoleColor(role.name)}`}
                                            >
                                                {role.name}
                                            </Badge>
                                        ))}
                                        {user.roles.length === 0 && (
                                            <span className="text-[10px] text-muted-foreground/50">Keine Rolle</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center hidden sm:table-cell py-2.5">
                                    <Badge className={`text-[10px] font-medium border-0 px-1.5 py-0 ${
                                        user.is_active
                                            ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10"
                                            : "bg-red-500/10 text-red-600 hover:bg-red-500/10"
                                    }`}>
                                        {user.is_active ? "Aktiv" : "Inaktiv"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-[10px] text-muted-foreground text-center hidden lg:table-cell py-2.5 tabular-nums">
                                    {user.last_login_at
                                        ? new Date(user.last_login_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })
                                        : "\u2014"
                                    }
                                </TableCell>
                                <TableCell className="py-2.5">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="size-7 p-0">
                                                <MoreHorizontal className="size-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            {availableRoles.length > 0 && (
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger className="text-xs">
                                                        <ShieldCheck className="size-3.5 mr-2" />
                                                        Rolle zuweisen
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        {availableRoles.map(role => (
                                                            <DropdownMenuItem
                                                                key={role.id}
                                                                className="text-xs"
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
                                                    <DropdownMenuSubTrigger className="text-xs">
                                                        <ShieldX className="size-3.5 mr-2" />
                                                        Rolle entfernen
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        {user.roles.map(role => (
                                                            <DropdownMenuItem
                                                                key={role.id}
                                                                className="text-xs text-destructive"
                                                                onClick={() => onRemoveRole(user.id, role.id)}
                                                            >
                                                                {role.name}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                            )}
                                            {availableRoles.length === 0 && user.roles.length === 0 && (
                                                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                                                    Keine Aktionen verfügbar
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
