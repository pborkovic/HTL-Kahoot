"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    ClipboardList,
    BookOpen,
    MonitorPlay,
    Users,
    LogOut,
    Settings,
    ChevronsUpDown,
    ChevronsLeft,
    ChevronsRight,
    Shield,
    Sun,
    Moon,
    Contrast,
    Eye,
} from "lucide-react";
import { useTheme, THEMES, type Theme } from "@/components/ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function UserAvatar({
    avatarUrl,
    initials,
    displayName,
}: {
    avatarUrl: string | null | undefined;
    initials: string;
    displayName: string;
}): ReactNode {
    const [hasError, setHasError] = useState<boolean>(false);

    if (avatarUrl && !hasError) {
        return (
            <div className="size-8 rounded-xl overflow-hidden border border-primary/20 shrink-0 bg-primary/10">
                <img
                    src={avatarUrl}
                    alt={displayName}
                    className="size-full object-cover"
                    onError={() => setHasError(true)}
                />
            </div>
        );
    }

    return (
        <div
            className="size-8 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0"
            aria-label={displayName}
        >
            {initials}
        </div>
    );
}

function ThemeIcon({ theme }: { theme: Theme }): ReactNode {
    if (theme === "dark")                    return <Moon className="size-4" />;
    if (theme === "high-contrast")           return <Contrast className="size-4" />;
    if (theme === "dark-high-contrast")      return <Contrast className="size-4" />;
    if (theme === "colorblind-friendly")     return <Eye className="size-4" />;
    if (theme === "dark-colorblind-friendly")return <Eye className="size-4" />;
    return <Sun className="size-4" />;
}

const navItems = [
    {
        title: "Lehrer Dashboard",
        href: "/teacher/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Fragen",
        href: "/teacher/questions",
        icon: ClipboardList,
    },
    {
        title: "Quizze",
        href: "/teacher/quizzes",
        icon: BookOpen,
    },
];

const studentItems = [
    {
        title: "Mein Dashboard",
        href: "/student/dashboard",
        icon: LayoutDashboard,
    },
];

const adminItems = [
    {
        title: "Admin Dashboard",
        href: "/admin/dashboard",
        icon: Shield,
    },
    {
        title: "Benutzer",
        href: "/admin/users",
        icon: Users,
    },
];

export function AppSidebar(): ReactNode {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { toggleSidebar, state } = useSidebar();
    const { theme, setTheme } = useTheme();

    const userRoles = user?.roles?.map(r => r.name) ?? [];
    const isAdmin = userRoles.some(r => r === "admin" || r === "superadmin");
    const isTeacher = userRoles.some(r => r === "teacher");
    const isStudent = userRoles.some(r => r === "student");
    const primaryRole = userRoles[0] ?? "Benutzer";

    const displayName = user?.username ?? user?.email ?? "Unbekannt";
    const initials = displayName
        .split(/[\s.@]+/)
        .slice(0, 2)
        .map(s => s[0]?.toUpperCase() ?? "")
        .join("");

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={isTeacher ? "/teacher/dashboard" : isStudent ? "/student/dashboard" : "/home"}>
                                <div className="size-8 rounded-xl bg-primary/15 backdrop-blur-sm border border-primary/20 flex items-center justify-center shrink-0">
                                    <MonitorPlay className="size-4 text-primary" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold text-sm">gamquiz</span>
                                    <span className="text-[11px] text-muted-foreground capitalize">{primaryRole}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {isStudent && (
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
                            Schüler
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {studentItems.map(item => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.href}
                                        tooltip={item.title}
                                        className="cursor-pointer"
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}

                {isTeacher && (
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {navItems.map(item => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === item.href}
                                    tooltip={item.title}
                                    className="cursor-pointer"
                                >
                                    <Link href={item.href}>
                                        <item.icon className="size-4" />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
                )}

                {isAdmin && (
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
                            Administration
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {adminItems.map(item => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname.startsWith(item.href)}
                                        tooltip={item.title}
                                        className="cursor-pointer"
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <div className="px-2 py-1.5 flex flex-col gap-0.5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors cursor-pointer"
                        >
                            <ThemeIcon theme={theme} />
                            {state === "expanded" && (
                                <span>{THEMES.find(t => t.value === theme)?.label}</span>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="top"
                        align="start"
                        className="backdrop-blur-xl bg-popover/90 dark:bg-popover/80 border-border/30 rounded-xl shadow-xl shadow-primary/5"
                    >
                        {THEMES.map(t => (
                            <DropdownMenuItem
                                key={t.value}
                                onClick={() => setTheme(t.value)}
                                className={`cursor-pointer rounded-lg ${theme === t.value ? "bg-primary/10 text-primary" : ""}`}
                            >
                                <ThemeIcon theme={t.value} />
                                <span>{t.label}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors cursor-pointer"
                >
                    {state === "expanded" ? (
                        <ChevronsLeft className="size-4" />
                    ) : (
                        <ChevronsRight className="size-4" />
                    )}
                    {state === "expanded" && <span>Einklappen</span>}
                </button>
            </div>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-primary/10 cursor-pointer"
                                >
                                    <UserAvatar
                                        avatarUrl={user?.avatar_url}
                                        initials={initials}
                                        displayName={displayName}
                                    />
                                    <div className="flex flex-col gap-0.5 leading-none min-w-0">
                                        <span className="text-sm font-medium truncate">{displayName}</span>
                                        <span className="text-[11px] text-muted-foreground capitalize">{primaryRole}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                align="start"
                                className="w-[--radix-dropdown-menu-trigger-width] backdrop-blur-xl bg-popover/90 dark:bg-popover/80 border-border/30 rounded-xl shadow-xl shadow-primary/5"
                            >
                                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                                    <Link href="/settings">
                                        <Settings className="size-4 mr-2" />
                                        Einstellungen
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => logout()}
                                    className="cursor-pointer rounded-lg text-red-500 hover:text-red-600 focus:text-red-600"
                                >
                                    <LogOut className="size-4 mr-2" />
                                    Abmelden
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
