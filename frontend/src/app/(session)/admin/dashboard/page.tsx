"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    MessageSquare,
    Database,
    Server,
    HardDrive,
    ListTodo,
    Loader2,
    AlertCircle,
    CheckCircle2,
    XCircle,
    BookOpen,
    PlayCircle,
    Activity,
    Building2,
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import type { PlatformMetrics, SystemStatus, ServiceStatus } from "@/types/admin";

interface QuickLink {
    href: string;
    label: string;
    description: string;
    icon: ReactNode;
}

const QUICK_LINKS: QuickLink[] = [
    {
        href: "/admin/users",
        label: "Userverwaltung",
        description: "Benutzer, Klassen und Rollen verwalten",
        icon: <Users className="size-5" />,
    },
    {
        href: "/teacher/questions",
        label: "Fragenverwaltung",
        description: "Fragen anlegen, importieren und sortieren",
        icon: <ClipboardList className="size-5" />,
    },
    {
        href: "/admin/feedback",
        label: "Plattform-Feedback",
        description: "Konstruktive Rückmeldungen prüfen",
        icon: <MessageSquare className="size-5" />,
    },
];

function StatusBadge({ status }: { status: ServiceStatus["status"] }): ReactNode {
    const isUp = status === "up";
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                isUp
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    : "bg-red-500/10 text-red-600 border-red-500/30"
            }`}
        >
            {isUp ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
            {isUp ? "Online" : "Offline"}
        </span>
    );
}

function ServiceCard({
    icon,
    label,
    service,
    extra,
}: {
    icon: ReactNode;
    label: string;
    service?: ServiceStatus;
    extra?: ReactNode;
}): ReactNode {
    return (
        <div className="rounded-xl border border-border/40 bg-card/70 backdrop-blur-xl p-4 flex flex-col gap-2 shadow-sm shadow-primary/5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        {icon}
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                </div>
                {service ? <StatusBadge status={service.status} /> : null}
            </div>
            {service && (
                <div className="text-[11px] text-muted-foreground space-y-0.5">
                    {service.latency_ms != null && <p>Latenz: {service.latency_ms} ms</p>}
                    {service.driver && <p>Treiber: {service.driver}</p>}
                    {service.disk && <p>Disk: {service.disk}</p>}
                    {service.pending != null && <p>Wartend: {service.pending}</p>}
                    {service.failed != null && <p>Fehlgeschlagen: {service.failed}</p>}
                    {service.error && (
                        <p className="text-red-600 dark:text-red-400 break-all">{service.error}</p>
                    )}
                    {extra}
                </div>
            )}
        </div>
    );
}

function MetricCard({
    icon,
    label,
    value,
    sub,
}: {
    icon: ReactNode;
    label: string;
    value: number | string;
    sub?: string;
}): ReactNode {
    return (
        <div className="rounded-xl border border-border/40 bg-card/70 backdrop-blur-xl p-4 flex items-center gap-3 shadow-sm shadow-primary/5">
            <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="text-xl font-semibold tabular-nums leading-tight">{value}</p>
                {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
            </div>
        </div>
    );
}

export default function AdminDashboardPage(): ReactNode {
    const [system, setSystem] = useState<SystemStatus | null>(null);
    const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect((): void => {
        let cancelled = false;
        async function load(): Promise<void> {
            setLoading(true);
            setError(null);
            try {
                const [s, m] = await Promise.all([
                    apiFetch<SystemStatus>("/v1/admin/system"),
                    apiFetch<PlatformMetrics>("/v1/admin/metrics"),
                ]);
                if (!cancelled) {
                    setSystem(s);
                    setMetrics(m);
                }
            } catch (err) {
                if (!cancelled) {
                    const reason =
                        err instanceof ApiError
                            ? err.message
                            : "Daten konnten nicht geladen werden.";
                    setError(reason);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        void load();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="flex-1 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/15 blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse [animation-delay:3s]" />
            </div>

            <div className="relative flex flex-col gap-6 p-4 sm:p-6 lg:p-8 mx-auto max-w-[1600px]">
                {/* Header */}
                <header className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                        <LayoutDashboard className="size-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Systemübersicht, Metriken und Schnellzugriff. Nur für Superadmins.
                        </p>
                    </div>
                </header>

                {error && (
                    <div
                        role="alert"
                        className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"
                    >
                        <AlertCircle className="size-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Quick links */}
                <section>
                    <h2 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
                        Schnellzugriff
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {QUICK_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group rounded-xl border border-border/40 bg-card/70 backdrop-blur-xl p-4 flex items-start gap-3 shadow-sm shadow-primary/5 hover:border-primary/40 hover:bg-primary/[0.03] transition-all duration-200"
                            >
                                <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/15 transition-colors">
                                    {link.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold">{link.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {link.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Metrics */}
                <section>
                    <h2 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
                        Metriken
                    </h2>
                    {loading && !metrics ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            <span>Wird geladen...</span>
                        </div>
                    ) : metrics ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            <MetricCard
                                icon={<Users className="size-5" />}
                                label="Benutzer"
                                value={metrics.users.total}
                            />
                            <MetricCard
                                icon={<ClipboardList className="size-5" />}
                                label="Fragen"
                                value={metrics.content.questions}
                            />
                            <MetricCard
                                icon={<BookOpen className="size-5" />}
                                label="Quizze"
                                value={metrics.content.quizzes}
                            />
                            <MetricCard
                                icon={<Building2 className="size-5" />}
                                label="Abteilungen"
                                value={metrics.content.departments}
                            />
                            <MetricCard
                                icon={<PlayCircle className="size-5" />}
                                label="Sessions"
                                value={metrics.sessions.total}
                            />
                            <MetricCard
                                icon={<MessageSquare className="size-5" />}
                                label="Feedback offen"
                                value={metrics.feedback.open}
                                sub={`${metrics.feedback.resolved} erledigt`}
                            />
                            {Object.entries(metrics.users.by_role).map(([role, count]) => (
                                <MetricCard
                                    key={role}
                                    icon={<Activity className="size-5" />}
                                    label={`Rolle: ${role}`}
                                    value={count}
                                />
                            ))}
                        </div>
                    ) : null}
                </section>

                {/* System status */}
                <section>
                    <h2 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
                        Systemstatus
                    </h2>
                    {loading && !system ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            <span>Wird geladen...</span>
                        </div>
                    ) : system ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <ServiceCard
                                    icon={<Database className="size-4" />}
                                    label="Datenbank"
                                    service={system.services.database}
                                />
                                <ServiceCard
                                    icon={<Server className="size-4" />}
                                    label="Redis"
                                    service={system.services.redis}
                                />
                                <ServiceCard
                                    icon={<ListTodo className="size-4" />}
                                    label="Queue"
                                    service={system.services.queue}
                                />
                                <ServiceCard
                                    icon={<HardDrive className="size-4" />}
                                    label="Storage"
                                    service={system.services.storage}
                                />
                            </div>
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-muted-foreground">
                                <span>App: {system.app.name}</span>
                                <span>Env: {system.app.env}</span>
                                <span>PHP: {system.app.php_version}</span>
                                <span>Laravel: {system.app.laravel_version}</span>
                            </div>
                        </>
                    ) : null}
                </section>
            </div>
        </div>
    );
}
