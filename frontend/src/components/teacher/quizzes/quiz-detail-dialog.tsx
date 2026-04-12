"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Pencil,
    Trash2,
    Loader2,
    Play,
    Trophy,
    Users,
    Clock,
    FileText,
    Eye,
    Rocket,
    FileBarChart,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Quiz, QuizSession, QuizQuestionEntry } from "@/types/quiz";

interface SessionData {
    id: string;
    game_pin: string;
    qr_code_url: string;
}

/**
 * Props for the QuizDetailDialog component.
 */
interface QuizDetailDialogProps {
    /** The quiz to display details for. If null, the dialog is closed. */
    readonly quiz: Quiz | null;
    /** Callback function to close the dialog. */
    readonly onClose: () => void;
    /** Callback function called after the quiz is successfully deleted. */
    readonly onDeleted: () => void;
}

/**
 * Formats an ISO date string into a localized German date/time string.
 *
 * @param dateStr - The date string to format.
 * @returns A formatted string (e.g., "01.01.2023, 14:30").
 */
function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Returns a human-readable label for a session status.
 *
 * @param status - The session status identifier.
 * @returns A German label for the status.
 */
function statusLabel(status: string): string {
    switch (status) {
        case "lobby": return "Lobby";
        case "active": return "Aktiv";
        case "finished": return "Beendet";
        default: return status;
    }
}

/**
 * Returns CSS class names for status-specific styling.
 *
 * @param status - The session status identifier.
 * @returns A string of Tailwind CSS classes.
 */
function statusColor(status: string): string {
    switch (status) {
        case "finished": return "border-emerald-300/60 text-emerald-600 bg-emerald-500/5";
        case "active": return "border-amber-300/60 text-amber-600 bg-amber-500/5";
        case "lobby": return "border-blue-300/60 text-blue-600 bg-blue-500/5";
        default: return "text-muted-foreground border-border/40";
    }
}

/**
 * Returns a human-readable label for question difficulty.
 *
 * @param d - The difficulty level (1-5), or null.
 * @returns A descriptive label (e.g., "Mittel") or a placeholder.
 */
function difficultyLabel(d: number | null): string {
    if (d === null) { return "—"; }
    const labels = ["", "Sehr leicht", "Leicht", "Mittel", "Schwer", "Sehr schwer"];
    return labels[d] ?? String(d);
}

/**
 * Returns CSS class names for difficulty-specific styling.
 *
 * @param d - The difficulty level (1-5), or null.
 * @returns A string of Tailwind CSS classes.
 */
function difficultyColor(d: number | null): string {
    if (d === null) { return "text-muted-foreground border-border/40"; }
    if (d <= 2) { return "border-emerald-300/60 text-emerald-600 bg-emerald-500/5"; }
    if (d <= 3) { return "border-amber-300/60 text-amber-600 bg-amber-500/5"; }
    return "border-red-300/60 text-red-600 bg-red-500/5";
}

/**
 * A dialog component that displays comprehensive details for a specific quiz.
 * 
 * Shows summary statistics, quiz settings, the list of questions included in
 * the quiz, and a history of previous game sessions. Provides actions for
 * starting a new session, editing, or deleting the quiz.
 *
 * @param props - The component props.
 * @returns The rendered quiz detail dialog.
 */
export function QuizDetailDialog({ quiz, onClose, onDeleted }: QuizDetailDialogProps) {
    const router = useRouter();
    const [sessions, setSessions] = useState<QuizSession[]>([]);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestionEntry[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [starting, setStarting] = useState(false);
    const [participantsCount, setParticipantsCount] = useState(0);

    const fetchSessions = useCallback(async (quizId: string) => {
        setLoadingSessions(true);
        try {
            const res = await apiFetch<{ data: QuizSession[] }>(`/v1/quizzes/${quizId}/sessions`);
            setSessions(res.data);
        } catch {
            setSessions([]);
        } finally {
            setLoadingSessions(false);
        }
    }, []);

    const fetchQuizDetail = useCallback(async (quizId: string) => {
        setLoadingQuestions(true);
        try {
            const res = await apiFetch<{ data: Quiz }>(`/v1/quizzes/${quizId}`);
            setQuizQuestions(res.data.quiz_questions ?? []);
            setParticipantsCount(res.data.participants?.length ?? 0);
        } catch {
            setQuizQuestions([]);
            setParticipantsCount(0);
        } finally {
            setLoadingQuestions(false);
        }
    }, []);

    useEffect(() => {
        if (quiz) {
            void fetchSessions(quiz.id);
            void fetchQuizDetail(quiz.id);
        } else {
            setSessions([]);
            setQuizQuestions([]);
        }
    }, [quiz, fetchSessions, fetchQuizDetail]);

    function handleEdit() {
        if (!quiz) { return; }
        onClose();
        router.push(`/teacher/dashboard?quiz=${quiz.id}`);
    }

    const isReady = quizQuestions.length > 0 && participantsCount > 0;

    async function handleStart() {
        if (!quiz || starting) { return; }
        setStarting(true);
        try {
            const sessionRes = await apiFetch<{ session: SessionData }>("/v1/sessions", {
                method: "POST",
                body: JSON.stringify({ quiz_id: quiz.id }),
            });
            const gamePin = sessionRes.session?.game_pin;
            if (!gamePin) {
                throw new Error("Session konnte nicht erstellt werden.");
            }
            onClose();
            router.push(`/teacher/session/${gamePin}/lobby`);
        } catch {
            // fall back to edit mode on error
            handleEdit();
        } finally {
            setStarting(false);
        }
    }

    async function handleDelete() {
        if (!quiz) { return; }
        setDeleting(true);
        try {
            await apiFetch(`/v1/quizzes/${quiz.id}`, { method: "DELETE" });
            onClose();
            onDeleted();
        } catch {
        } finally {
            setDeleting(false);
        }
    }

    if (!quiz) { return null; }

    const finishedSessions = sessions.filter((s) => s.status === "finished");
    const totalParticipants = finishedSessions.reduce((sum, s) => sum + s.participants_count, 0);
    const sortedQuestions = [...quizQuestions].sort((a, b) => a.sort_order - b.sort_order);

    return (
        <Dialog open={!!quiz} onOpenChange={(open) => { if (!open) { onClose(); } }}>
            <DialogContent className="max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-popover/90 dark:bg-popover/80 border-border/30 rounded-2xl shadow-2xl shadow-primary/5">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {quiz.title}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Erstellt am {formatDate(quiz.created_at)}
                    </p>
                </DialogHeader>

                <div className="space-y-4 pt-1">
                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-3">
                        <div className="rounded-xl backdrop-blur-sm bg-background/30 border border-border/30 px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                <FileText className="size-3" />
                                <span className="text-[10px] font-medium uppercase tracking-widest">Fragen</span>
                            </div>
                            <span className="text-lg font-semibold tabular-nums">
                                {quizQuestions.length}
                            </span>
                        </div>
                        <div className="rounded-xl backdrop-blur-sm bg-background/30 border border-border/30 px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                <Users className="size-3" />
                                <span className="text-[10px] font-medium uppercase tracking-widest">Schüler</span>
                            </div>
                            <span className="text-lg font-semibold tabular-nums">
                                {participantsCount}
                            </span>
                        </div>
                        <div className="rounded-xl backdrop-blur-sm bg-background/30 border border-border/30 px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                <Play className="size-3" />
                                <span className="text-[10px] font-medium uppercase tracking-widest">Gespielt</span>
                            </div>
                            <span className="text-lg font-semibold tabular-nums">
                                {finishedSessions.length}
                            </span>
                        </div>
                        <div className="rounded-xl backdrop-blur-sm bg-background/30 border border-border/30 px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                <Trophy className="size-3" />
                                <span className="text-[10px] font-medium uppercase tracking-widest">Teilnehmer</span>
                            </div>
                            <span className="text-lg font-semibold tabular-nums">
                                {totalParticipants}
                            </span>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5">
                        {quiz.is_published ? (
                            <Badge variant="outline" className="text-[10px] border-emerald-300/60 text-emerald-600 bg-emerald-500/5 rounded-lg">
                                Veröffentlicht
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40 rounded-lg">
                                Entwurf
                            </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40 rounded-lg">
                            {quiz.time_mode === "per_question" ? "Zeit pro Frage" : "Gesamtzeit"}
                        </Badge>
                        {quiz.speed_scoring && (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40 rounded-lg">
                                Speed-Scoring
                            </Badge>
                        )}
                        {quiz.randomize_questions && (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40 rounded-lg">
                                Zufällige Reihenfolge
                            </Badge>
                        )}
                    </div>

                    {quiz.description && (
                        <p className="text-xs leading-relaxed text-foreground/80">{quiz.description}</p>
                    )}

                    {/* Questions in quiz */}
                    <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
                            Fragen im Quiz
                        </p>
                        {loadingQuestions ? (
                            <div className="flex items-center gap-2 py-4 justify-center text-muted-foreground">
                                <Loader2 className="size-3 animate-spin" />
                                <span className="text-xs">Laden...</span>
                            </div>
                        ) : sortedQuestions.length === 0 ? (
                            <p className="text-xs text-muted-foreground/60 py-3 text-center">
                                Noch keine Fragen hinzugefügt.
                            </p>
                        ) : (
                            <div className="space-y-1 max-h-[200px] overflow-y-auto">
                                {sortedQuestions.map((qq, idx) => (
                                    <div
                                        key={qq.id}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl backdrop-blur-sm bg-background/20 border border-border/30"
                                    >
                                        <span className="text-[10px] tabular-nums text-muted-foreground/60 w-4 text-right shrink-0">
                                            {idx + 1}
                                        </span>
                                        <span className="text-xs text-foreground truncate flex-1">
                                            {qq.question_version?.title ?? "Unbekannte Frage"}
                                        </span>
                                        {qq.question_version?.difficulty != null && (
                                            <Badge variant="outline" className={`text-[9px] rounded-lg ${difficultyColor(qq.question_version.difficulty)}`}>
                                                {difficultyLabel(qq.question_version.difficulty)}
                                            </Badge>
                                        )}
                                        <span className="text-[10px] tabular-nums text-muted-foreground shrink-0">
                                            {qq.question_version?.default_points ?? 1000} Pkt.
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sessions history */}
                    <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
                            Spiel-Verlauf
                        </p>
                        {loadingSessions ? (
                            <div className="flex items-center gap-2 py-4 justify-center text-muted-foreground">
                                <Loader2 className="size-3 animate-spin" />
                                <span className="text-xs">Laden...</span>
                            </div>
                        ) : sessions.length === 0 ? (
                            <p className="text-xs text-muted-foreground/60 py-3 text-center">
                                Dieses Quiz wurde noch nie gespielt.
                            </p>
                        ) : (
                            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center gap-3 px-3 py-2 rounded-xl backdrop-blur-sm bg-background/20 border border-border/30 hover:border-primary/20 hover:bg-background/30 transition-all duration-200 group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`text-[9px] rounded-lg ${statusColor(session.status)}`}>
                                                    {statusLabel(session.status)}
                                                </Badge>
                                                <span className="text-[10px] tabular-nums text-muted-foreground">
                                                    PIN: {session.game_pin}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <Users className="size-2.5" />
                                                    {session.participants_count}
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <Clock className="size-2.5" />
                                                    {formatDate(session.created_at)}
                                                </span>
                                                {session.top_participants.length > 0 && (
                                                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                        <Trophy className="size-2.5 text-amber-500" />
                                                        {session.top_participants[0].nickname}
                                                        {" "}({session.top_participants[0].total_score})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {session.status === "finished" && (
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={() => router.push(`/teacher/session/${session.game_pin}/report`)}
                                                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer transition-colors"
                                                >
                                                    <FileBarChart className="size-3" />
                                                    Report
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => router.push(`/teacher/session/${session.game_pin}/results`)}
                                                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer transition-colors"
                                                >
                                                    <Eye className="size-3" />
                                                    Ergebnis
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        {isReady && (
                            <Button
                                onClick={handleStart}
                                disabled={starting}
                                className="w-full h-10 text-sm font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 cursor-pointer"
                            >
                                {starting ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Rocket className="size-4" />
                                )}
                                Sofort starten
                            </Button>
                        )}
                        {!isReady && !loadingQuestions && (
                            <p className="text-[11px] text-muted-foreground text-center py-1">
                                {quizQuestions.length === 0 && participantsCount === 0
                                    ? "Fragen und Schüler hinzufügen, um direkt starten zu können"
                                    : quizQuestions.length === 0
                                        ? "Fragen hinzufügen, um direkt starten zu können"
                                        : "Schüler hinzufügen, um direkt starten zu können"}
                            </p>
                        )}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleEdit}
                                variant="outline"
                                className="flex-1 h-9 text-xs gap-1.5 rounded-xl backdrop-blur-sm bg-background/40 border-border/40 hover:border-primary/30 hover:bg-background/60 transition-all duration-200 cursor-pointer"
                            >
                                <Pencil className="size-3" />
                                Bearbeiten
                            </Button>
                            <Button
                                onClick={handleDelete}
                                variant="outline"
                                disabled={deleting}
                                className="h-9 text-xs gap-1.5 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20 cursor-pointer"
                            >
                                {deleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                                Löschen
                            </Button>
                            <Button onClick={onClose} variant="outline" className="flex-1 h-9 text-xs rounded-xl backdrop-blur-sm bg-background/40 border-border/40 hover:border-primary/30 hover:bg-background/60 transition-all duration-200 cursor-pointer">
                                Schließen
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
