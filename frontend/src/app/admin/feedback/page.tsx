"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
    MessageSquare,
    Loader2,
    AlertCircle,
    CheckCircle2,
    RotateCcw,
    User as UserIcon,
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import type {
    PlatformFeedback,
    FeedbackListResponse,
    FeedbackSingleResponse,
    FeedbackListMeta,
} from "@/types/feedback";
import { Pagination } from "@/components/ui/pagination";

type StatusFilter = "open" | "solved";

const PER_PAGE = 15;

export default function AdminFeedbackPage(): ReactNode {
    const [status, setStatus] = useState<StatusFilter>("open");
    const [page, setPage] = useState<number>(1);
    const [items, setItems] = useState<PlatformFeedback[]>([]);
    const [meta, setMeta] = useState<FeedbackListMeta | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const load = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                status,
                page: String(page),
                per_page: String(PER_PAGE),
            });
            const response = await apiFetch<FeedbackListResponse>(
                `/v1/feedback?${params.toString()}`,
            );
            setItems(response.data);
            setMeta(response.meta);
        } catch (err) {
            const reason =
                err instanceof ApiError
                    ? err.message
                    : "Feedback konnte nicht geladen werden.";
            setError(reason);
        } finally {
            setLoading(false);
        }
    }, [status, page]);

    useEffect((): void => {
        void load();
    }, [load]);

    const onResolve = async (id: string): Promise<void> => {
        setBusyId(id);
        try {
            await apiFetch<FeedbackSingleResponse>(`/v1/feedback/${id}/resolve`, {
                method: "PATCH",
            });
            setItems((prev) => prev.filter((item) => item.id !== id || status !== "open"));
            if (status === "open") {
                void load();
            } else {
                await load();
            }
        } catch (err) {
            const reason =
                err instanceof ApiError
                    ? err.message
                    : "Status konnte nicht aktualisiert werden.";
            setError(reason);
        } finally {
            setBusyId(null);
        }
    };

    const onReopen = async (id: string): Promise<void> => {
        setBusyId(id);
        try {
            await apiFetch<FeedbackSingleResponse>(`/v1/feedback/${id}/reopen`, {
                method: "PATCH",
            });
            await load();
        } catch (err) {
            const reason =
                err instanceof ApiError
                    ? err.message
                    : "Status konnte nicht aktualisiert werden.";
            setError(reason);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="flex-1 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/15 blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse [animation-delay:3s]" />
            </div>

            <div className="relative flex flex-col gap-5 p-4 sm:p-6 lg:p-8 mx-auto max-w-[1600px]">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center shrink-0">
                            <MessageSquare className="size-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                                Plattform-Feedback
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Vom lokalen KI-Modell als konstruktiv bewertete Einträge.
                            </p>
                        </div>
                    </div>

                    <div
                        role="tablist"
                        aria-label="Status"
                        className="inline-flex rounded-xl border border-border/40 bg-card/60 p-1 text-xs"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={status === "open"}
                            onClick={() => {
                                setStatus("open");
                                setPage(1);
                            }}
                            className={`cursor-pointer rounded-lg px-3 py-1.5 font-medium transition-colors ${
                                status === "open"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Offen
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={status === "solved"}
                            onClick={() => {
                                setStatus("solved");
                                setPage(1);
                            }}
                            className={`cursor-pointer rounded-lg px-3 py-1.5 font-medium transition-colors ${
                                status === "solved"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Erledigt
                        </button>
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

                {loading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        <span>Wird geladen...</span>
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                        {status === "open"
                            ? "Aktuell liegt kein offenes Feedback vor."
                            : "Noch kein Feedback als erledigt markiert."}
                    </p>
                )}

                <ul className="flex flex-col gap-3">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="rounded-xl border border-border/40 bg-card/70 backdrop-blur-xl p-4 sm:p-5 flex flex-col gap-3 shadow-sm shadow-primary/5"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <UserIcon className="size-3.5" />
                                    <span className="font-medium text-foreground">
                                        {item.author?.display_name ?? item.author?.email ?? "Unbekannt"}
                                    </span>
                                    {item.author?.class_name && (
                                        <span className="rounded-full border border-border/50 px-2 py-0.5">
                                            {item.author.class_name}
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span>{item.author?.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>{new Date(item.created_at).toLocaleString("de-AT")}</span>
                                    {item.is_resolved && item.resolver && (
                                        <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5">
                                            Erledigt von {item.resolver.display_name ?? item.resolver.email}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-foreground whitespace-pre-wrap">
                                {item.message}
                            </p>

                            {item.moderation_reason && (
                                <p className="text-[11px] text-muted-foreground italic">
                                    KI-Bewertung: {item.moderation_reason}
                                </p>
                            )}

                            <div className="flex justify-end">
                                {item.is_resolved ? (
                                    <button
                                        type="button"
                                        disabled={busyId === item.id}
                                        onClick={() => onReopen(item.id)}
                                        className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-border/50 bg-background/60 px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50 transition-colors"
                                    >
                                        {busyId === item.id ? (
                                            <Loader2 className="size-3.5 animate-spin" />
                                        ) : (
                                            <RotateCcw className="size-3.5" />
                                        )}
                                        <span>Wieder öffnen</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={busyId === item.id}
                                        onClick={() => onResolve(item.id)}
                                        className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                    >
                                        {busyId === item.id ? (
                                            <Loader2 className="size-3.5 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="size-3.5" />
                                        )}
                                        <span>Als erledigt markieren</span>
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>

                {meta && meta.last_page > 1 && (
                    <Pagination meta={meta} onPageChange={setPage} />
                )}
            </div>
        </div>
    );
}
