"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    ClipboardList,
    BookOpen,
    MonitorPlay,
    Users,
    LogOut,
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

function ThemeIcon({ theme }: { theme: Theme }) {
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

export function AppSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { toggleSidebar, state } = useSidebar();
    const { theme, setTheme } = useTheme();

    const userRoles = user?.roles?.map(r => r.name) ?? [];
    const isAdmin = userRoles.some(r => r === "admin" || r === "superadmin");
    const primaryRole = userRoles[0] ?? "Benutzer";

    const displayName = user?.username ?? user?.email ?? "Unbekannt";
    const initials = displayName
        .split(/[\s.@]+/)
        .slice(0, 2)
        .map(s => s[0]?.toUpperCase() ?? "")
        .join("");

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/teacher/dashboard">
                                <div className="size-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
                                    <MonitorPlay className="size-4 text-primary-foreground" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold text-sm">gamquiz</span>
                                    <span className="text-[11px] text-muted-foreground">Lehrer</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarMenu>
                        {navItems.map(item => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === item.href}
                                    tooltip={item.title}
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

                {isAdmin && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Administration</SidebarGroupLabel>
                        <SidebarMenu>
                            {adminItems.map(item => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname.startsWith(item.href)}
                                        tooltip={item.title}
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
                            className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent transition-colors"
                        >
                            <ThemeIcon theme={theme} />
                            {state === "expanded" && (
                                <span>{THEMES.find(t => t.value === theme)?.label}</span>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="start">
                        {THEMES.map(t => (
                            <DropdownMenuItem
                                key={t.value}
                                onClick={() => setTheme(t.value)}
                                className={theme === t.value ? "bg-sidebar-accent" : ""}
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
                    className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent transition-colors"
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
                                    className="data-[state=open]:bg-sidebar-accent"
                                >
                                    <div className="size-8 rounded-lg bg-foreground/10 flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
                                        {initials}
                                    </div>
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
                                className="w-[--radix-dropdown-menu-trigger-width]"
                            >
                                <DropdownMenuItem onClick={() => logout()}>
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
