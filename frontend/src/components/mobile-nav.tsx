"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ClipboardList,
    BookOpen,
    Shield,
    Users,
    LogOut,
    Palette,
    Settings,
    type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme, THEMES } from "@/components/ThemeProvider";

interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
    match?: (pathname: string) => boolean;
}

const teacherItems: NavItem[] = [
    {
        title: "Dashboard",
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

const adminItems: NavItem[] = [
    {
        title: "Admin",
        href: "/admin/dashboard",
        icon: Shield,
        match: (p) => p.startsWith("/admin/dashboard"),
    },
    {
        title: "Benutzer",
        href: "/admin/users",
        icon: Users,
        match: (p) => p.startsWith("/admin/users"),
    },
];

export function MobileNav(): ReactNode {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [showMore, setShowMore] = useState(false);

    if (!user) {
        return null;
    }

    const userRoles = user.roles?.map((r) => r.name) ?? [];
    const isAdmin = userRoles.some((r) => r === "admin" || r === "superadmin");

    const items: NavItem[] = [...teacherItems, ...(isAdmin ? adminItems : [])];

    const showMoreButton = items.length > 4;
    const visibleItems = showMoreButton ? items.slice(0, 4) : items;

    return (
        <>
            {/* More menu overlay */}
            {showMore && (
                <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMore(false)}>
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
                    <div
                        className="absolute bottom-[calc(4rem+env(safe-area-inset-bottom))] left-2 right-2 bg-card/95 backdrop-blur-xl border border-border/30 rounded-2xl shadow-2xl shadow-primary/10 p-3 space-y-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Overflow nav items */}
                        {items.slice(4).map((item) => {
                            const isActive = item.match
                                ? item.match(pathname)
                                : pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setShowMore(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                                        isActive
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    <item.icon className="size-4.5" />
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}

                        {/* Divider */}
                        <div className="border-t border-border/30 my-1.5" />

                        {/* Theme selector */}
                        <div className="px-3 py-1.5">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-2">
                                Design
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {THEMES.map((t) => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => {
                                            setTheme(t.value);
                                            setShowMore(false);
                                        }}
                                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                                            theme === t.value
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                    >
                                        <Palette className="size-3.5" />
                                        <span className="truncate">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-border/30 my-1.5" />

                        {/* Settings */}
                        <Link
                            href="/settings"
                            onClick={() => setShowMore(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                                pathname === "/settings"
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            <Settings className="size-4.5" />
                            <span>Einstellungen</span>
                        </Link>

                        {/* Divider */}
                        <div className="border-t border-border/30 my-1.5" />

                        {/* Logout */}
                        <button
                            type="button"
                            onClick={() => {
                                setShowMore(false);
                                logout();
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors w-full cursor-pointer"
                        >
                            <LogOut className="size-4.5" />
                            <span>Abmelden</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom tab bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/30 bg-card/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-stretch justify-around h-16">
                    {visibleItems.map((item) => {
                        const isActive = item.match
                            ? item.match(pathname)
                            : pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                }`}
                            >
                                <item.icon
                                    className={`size-5 transition-transform ${isActive ? "scale-110" : ""}`}
                                />
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}

                    {showMoreButton && (
                        <button
                            type="button"
                            onClick={() => setShowMore(!showMore)}
                            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
                                showMore ? "text-primary" : "text-muted-foreground"
                            }`}
                        >
                            <div className="flex gap-0.5">
                                <span className="size-1.5 rounded-full bg-current" />
                                <span className="size-1.5 rounded-full bg-current" />
                                <span className="size-1.5 rounded-full bg-current" />
                            </div>
                            <span>Mehr</span>
                        </button>
                    )}
                </div>
            </nav>
        </>
    );
}
