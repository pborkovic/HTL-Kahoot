"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { MessageSquare, Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import type {
    PlatformFeedback,
    FeedbackSingleResponse,
} from "@/types/feedback";

interface MineResponse {
    data: PlatformFeedback[];
}

export default function FeedbackPage(): ReactNode {
    const [message, setMessage] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [successId, setSuccessId] = useState<string | null>(null);

    const [items, setItems] = useState<PlatformFeedback[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const loadMine = useCallback(async (): Promise<void> => {
        setLoading(true);
        setLoadError(null);
        try {
            const response = await apiFetch<MineResponse>("/v1/feedback/me");
            setItems(response.data);
        } catch (err) {
            const reason =
                err instanceof ApiError
                    ? err.message
                    : "Feedback konnte nicht geladen werden.";
            setLoadError(reason);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect((): void => {
        void loadMine();
    }, [loadMine]);

    const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        setSubmitError(null);
        setSuccessId(null);

        if (message.trim().length < 5) {
            setSubmitError("Bitte mindestens 5 Zeichen eingeben.");
            return;
        }

        setSubmitting(true);
        try {
            const response = await apiFetch<FeedbackSingleResponse>("/v1/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message.trim() }),
            });
            setMessage("");
            setSuccessId(response.data.id);
            setItems((prev) => [response.data, ...prev]);
        } catch (err) {
            const reason =
                err instanceof ApiError
                    ? err.message
                    : "Feedback konnte nicht gesendet werden.";
            setSubmitError(reason);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex-1 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/15 blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse [animation-delay:3s]" />
            </div>

            <div className="relative flex flex-col gap-6 p-4 sm:p-6 lg:p-8 mx-auto max-w-4xl">
                <header className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center shrink-0">
                        <MessageSquare className="size-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                            Feedback
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Teile uns mit, was du verbessern würdest. Dein Feedback wird von
                            einem lokalen KI-Modell auf Konstruktivität geprüft, bevor es einem
                            Administrator angezeigt wird.
                        </p>
                    </div>
                </header>

                <section className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl p-5 sm:p-6 shadow-sm shadow-primary/5">
                    <form onSubmit={onSubmit} className="flex flex-col gap-4">
                        <label htmlFor="feedback-message" className="text-sm font-medium">
                            Deine Nachricht
                        </label>
                        <textarea
                            id="feedback-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            maxLength={4000}
                            placeholder="Was könnten wir besser machen?"
                            className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 resize-y"
                            disabled={submitting}
                            required
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{message.length} / 4000</span>
                            <span>Mindestens 5 Zeichen</span>
                        </div>

                        {submitError && (
                            <div
                                role="alert"
                                className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"
                            >
                                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                                <span>{submitError}</span>
                            </div>
                        )}

                        {successId && (
                            <div
                                role="status"
                                className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2"
                            >
                                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                                <span>
                                    Danke! Dein Feedback wurde übermittelt und wird geprüft.
                                </span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || message.trim().length < 5}
                            className="cursor-pointer self-start inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Send className="size-4" />
                            )}
                            <span>Senden</span>
                        </button>
                    </form>
                </section>

                <section className="flex flex-col gap-3">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                        Meine Einträge
                    </h2>

                    {loading && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            <span>Wird geladen...</span>
                        </div>
                    )}

                    {loadError && (
                        <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                            <AlertCircle className="size-4 shrink-0 mt-0.5" />
                            <span>{loadError}</span>
                        </div>
                    )}

                    {!loading && !loadError && items.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">
                            Du hast noch kein Feedback abgegeben.
                        </p>
                    )}

                    <ul className="flex flex-col gap-3">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 flex flex-col gap-2"
                            >
                                <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                                    <span>{new Date(item.created_at).toLocaleString("de-AT")}</span>
                                    <StatusBadge feedback={item} />
                                </div>
                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                    {item.message}
                                </p>
                                {item.moderation_reason && (
                                    <p className="text-[11px] text-muted-foreground italic">
                                        KI-Prüfung: {item.moderation_reason}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}

function StatusBadge({ feedback }: { feedback: PlatformFeedback }): ReactNode {
    if (!feedback.is_constructive) {
        return (
            <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5">
                Nicht freigegeben
            </span>
        );
    }
    if (feedback.is_resolved) {
        return (
            <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5">
                Erledigt
            </span>
        );
    }
    return (
        <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-2 py-0.5">
            In Prüfung
        </span>
    );
}
