"use client";

import { Check, X, Clock, Trophy, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import type { ReportParticipant } from "@/types/report";

/**
 * Props for the StudentDetailDialog component.
 */
interface StudentDetailDialogProps {
    /** The participant whose details are being displayed. If null, the dialog is closed. */
    readonly participant: ReportParticipant | null;
    /** The total number of questions in the quiz session. */
    readonly totalQuestions: number;
    /** Callback function to close the dialog. */
    readonly onClose: () => void;
}

/**
 * Formats a duration in milliseconds into a human-readable string.
 *
 * @param ms - The duration in milliseconds, or null if not available.
 * @returns A formatted string (e.g., "1.5s" or "500ms") or a placeholder if null.
 */
function formatTime(ms: number | null): string {
    if (ms === null) {
        return "—";
    }
    if (ms < 1000) {
        return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * A dialog component that displays detailed results for a specific student in a report.
 * 
 * Shows overall statistics (score, correct answers, average time) and a
 * breakdown of the student's response for every question in the session.
 *
 * @param props - The component props.
 * @returns The rendered student detail dialog.
 */
export function StudentDetailDialog({ participant, totalQuestions, onClose }: StudentDetailDialogProps) {
    if (!participant) {
        return null;
    }

    return (
        <Dialog open={!!participant} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {participant.nickname}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Detaillierte Antworten und Statistiken
                    </DialogDescription>
                </DialogHeader>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-border/60 px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <Trophy className="size-3" />
                        </div>
                        <span className="text-lg font-semibold tabular-nums">{participant.total_score.toLocaleString()}</span>
                        <p className="text-[10px] text-muted-foreground">Punkte</p>
                    </div>
                    <div className="rounded-lg border border-border/60 px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <Check className="size-3" />
                        </div>
                        <span className="text-lg font-semibold tabular-nums">{participant.correct_count}/{totalQuestions}</span>
                        <p className="text-[10px] text-muted-foreground">Richtig</p>
                    </div>
                    <div className="rounded-lg border border-border/60 px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <Clock className="size-3" />
                        </div>
                        <span className="text-lg font-semibold tabular-nums">{formatTime(participant.avg_time_ms)}</span>
                        <p className="text-[10px] text-muted-foreground">Ø Zeit</p>
                    </div>
                </div>

                {/* Per-question answers */}
                <div className="space-y-4">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                        Antworten
                    </p>
                    <div className="grid gap-4">
                        {participant.questions.map((question) => {
                            const isCorrect = question.is_correct === true;
                            const notAnswered = question.is_correct === null;
                            const isPending = question.question_type === "free_text" && notAnswered;

                            return (
                                <div key={question.question_index} className="relative pl-4 border-l-2 border-border/50">
                                    <div className={`absolute -left-2.25 top-0 size-4 rounded-full border-2 border-background flex items-center justify-center ${
                                        isPending ? "bg-amber-500 text-white" :
                                        notAnswered ? "bg-muted text-muted-foreground" :
                                        isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                                    }`}>
                                        {isPending ? (
                                            <Loader2 className="size-2.5 animate-spin" />
                                        ) : notAnswered ? (
                                            <span className="text-[8px] font-bold">—</span>
                                        ) : isCorrect ? (
                                            <Check className="size-2.5" />
                                        ) : (
                                            <X className="size-2.5" />
                                        )}
                                    </div>

                                    <div className="mb-2 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded mr-2">
                                                Frage {question.question_index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-foreground">
                                                {question.question_text}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            {question.time_taken_ms !== null && (
                                                <span className="text-[10px] tabular-nums text-muted-foreground flex items-center gap-0.5">
                                                    <Clock className="size-2.5" />
                                                    {formatTime(question.time_taken_ms)}
                                                </span>
                                            )}
                                            <span className="text-[10px] tabular-nums font-medium text-muted-foreground">
                                                {question.score_awarded} Pkt.
                                            </span>
                                        </div>
                                    </div>

                                    {question.question_type === "free_text" ? (
                                        <div className="space-y-2">
                                            <div className={`p-3 rounded-lg border text-sm ${
                                                isPending
                                                    ? "border-amber-500/50 bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20"
                                                    : isCorrect
                                                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20"
                                                        : "border-red-500/50 bg-red-500/10 text-red-700 ring-1 ring-red-500/20"
                                            }`}>
                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1">
                                                    {isPending ? "Antwort — wird ausgewertet…" : "Antwort"}
                                                </p>
                                                <p className="font-medium">{question.answer_text || "Keine Antwort"}</p>
                                            </div>
                                            {question.answer_options.filter(o => o.is_correct).length > 0 && (
                                                <div className="p-3 rounded-lg border border-emerald-500/30 bg-transparent text-emerald-600/80 border-dashed text-sm">
                                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1">Erwartete Antwort</p>
                                                    <p>{question.answer_options.filter(o => o.is_correct).map(o => o.text).join(", ")}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            {question.answer_options.map((option) => {
                                                const isSelected = question.selected_option_ids.includes(option.id);
                                                const optionCorrect = option.is_correct;

                                                let styleClass = "border-transparent bg-muted/30 text-muted-foreground opacity-70";
                                                let icon = null;

                                                if (isSelected && optionCorrect) {
                                                    styleClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 font-medium opacity-100 ring-1 ring-emerald-500/20";
                                                    icon = <Check className="size-3.5 text-emerald-600" />;
                                                } else if (isSelected && !optionCorrect) {
                                                    styleClass = "border-red-500/50 bg-red-500/10 text-red-700 font-medium opacity-100 ring-1 ring-red-500/20";
                                                    icon = <X className="size-3.5 text-red-600" />;
                                                } else if (!isSelected && optionCorrect) {
                                                    styleClass = "border-emerald-500/30 bg-transparent text-emerald-600/80 border-dashed opacity-100";
                                                    icon = <Check className="size-3.5 text-emerald-600/50" />;
                                                }

                                                return (
                                                    <div
                                                        key={option.id}
                                                        className={`relative flex items-center justify-between p-2.5 rounded-lg border text-sm transition-all ${styleClass}`}
                                                    >
                                                        <span>{option.text}</span>
                                                        {icon}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
