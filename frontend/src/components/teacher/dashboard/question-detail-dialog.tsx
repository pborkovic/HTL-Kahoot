import { useState } from "react";
import { Check, X, Pencil, Trash2, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Question } from "@/types/question";

/**
 * Props for the QuestionDetailDialog component.
 */
interface QuestionDetailDialogProps {
    /** The question to display details for. If null, the dialog is closed. */
    question: Question | null;
    /** Callback function to close the dialog. */
    onClose: () => void;
    /** Optional callback function to initiate editing the question. */
    onEdit?: (question: Question) => void;
    /** Optional callback function called after the question is successfully deleted. */
    onDeleted?: () => void;
}

/**
 * A dialog component that displays comprehensive details for a specific question.
 * 
 * Shows version information, difficulty, media, explanation, and answer options.
 * Provides actions for editing or deleting the question.
 *
 * @param props - The component props.
 * @returns The rendered question detail dialog.
 */
export function QuestionDetailDialog({ question, onClose, onEdit, onDeleted }: QuestionDetailDialogProps) {
    const [deleting, setDeleting] = useState(false);

    if (!question) {
        return null;
    }

    const version = question.current_version;

    async function handleDelete() {
        if (!question) {
            return;
        }

        setDeleting(true);

        try {
            await apiFetch(`/v1/questions/${question.id}`, { method: "DELETE" });
            onClose();
            onDeleted?.();
        } catch {
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Dialog open={!!question} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {version?.title ?? "Frage"}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {question.type} &middot; Version {version?.version ?? "?"}
                    </p>
                </DialogHeader>

                <div className="space-y-4 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-[10px] font-medium">{question.type}</Badge>
                        {version?.difficulty != null && (
                            <Badge
                                variant="outline"
                                className={`text-[10px] font-medium ${
                                    version.difficulty <= 2
                                        ? "border-emerald-300 text-emerald-600"
                                        : version.difficulty <= 3
                                            ? "border-amber-300 text-amber-600"
                                            : "border-red-300 text-red-600"
                                }`}
                            >
                                Schwierigkeit {version.difficulty}/5
                            </Badge>
                        )}
                        <Badge
                            variant="outline"
                            className={`text-[10px] font-medium ${
                                question.is_published
                                    ? "border-emerald-300 text-emerald-600"
                                    : "text-muted-foreground"
                            }`}
                        >
                            {question.is_published ? "Veröffentlicht" : "Entwurf"}
                        </Badge>
                        {question.departments?.map((d) => (
                            <Badge
                                key={d.id}
                                variant="outline"
                                className="text-[10px] font-medium border-primary/30 text-primary"
                            >
                                {d.name}
                            </Badge>
                        ))}
                    </div>

                    {question.media && question.media.length > 0 && (
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
                                Medien
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {question.media.map((m) => (
                                    <div key={m.id} className="w-28 h-20 rounded-lg border border-border/60 overflow-hidden">
                                        {m.type === "video" ? (
                                            <video src={m.url} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={m.url} alt={m.alt_text ?? ""} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {version?.explanation && (
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">
                                Erklärung
                            </p>
                            <p className="text-xs leading-relaxed text-foreground/80">{version.explanation}</p>
                        </div>
                    )}

                    {version?.answer_options && version.answer_options.length > 0 && (
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
                                Antwortoptionen
                            </p>
                            <div className="space-y-1.5">
                                {version.answer_options
                                    .sort((a, b) => a.sort_order - b.sort_order)
                                    .map(option => (
                                        <div
                                            key={option.id}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors ${
                                                option.is_correct
                                                    ? "bg-emerald-500/5 border-emerald-200"
                                                    : "border-border/60"
                                            }`}
                                        >
                                            {option.is_correct ? (
                                                <Check className="size-3 text-emerald-600 shrink-0" />
                                            ) : (
                                                <X className="size-3 text-muted-foreground/40 shrink-0" />
                                            )}
                                            <span className={option.is_correct ? "text-emerald-700 font-medium" : "text-foreground/70"}>
                                                {option.text}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                        {version?.default_points != null && (
                            <span>Punkte: {version.default_points}</span>
                        )}
                        {version?.default_time_limit != null && (
                            <span>Zeitlimit: {version.default_time_limit}s</span>
                        )}
                        <span>Versionen: {question.versions?.length ?? 1}</span>
                    </div>

                    <div className="flex gap-2">
                        {onEdit && (
                            <Button
                                onClick={() => onEdit(question)}
                                variant="outline"
                                className="flex-1 h-9 text-xs gap-1.5"
                            >
                                <Pencil className="size-3" />
                                Bearbeiten
                            </Button>
                        )}
                        {onDeleted && (
                            <Button
                                onClick={handleDelete}
                                variant="outline"
                                disabled={deleting}
                                className="h-9 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20"
                            >
                                {deleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                                Löschen
                            </Button>
                        )}
                        <Button onClick={onClose} variant="outline" className="flex-1 h-9 text-xs">
                            Schließen
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
