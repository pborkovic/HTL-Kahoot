import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Question } from "@/types/question";

interface QuestionDetailDialogProps {
    question: Question | null;
    onClose: () => void;
}

export function QuestionDetailDialog({ question, onClose }: QuestionDetailDialogProps) {
    if (!question) return null;

    const version = question.current_version;

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
                    </div>

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

                    <Button onClick={onClose} variant="outline" className="w-full h-9 text-xs">
                        Schließen
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
