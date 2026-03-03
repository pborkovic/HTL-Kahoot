import { CheckCircle, X, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
            <DialogContent className="max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                {/* Green header */}
                <div className="bg-gradient-to-r from-primary to-primary-hover px-5 sm:px-6 py-4 rounded-t-lg">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                                <HelpCircle className="size-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <DialogTitle className="text-lg text-white">
                                    {version?.title ?? "Frage"}
                                </DialogTitle>
                                <p className="text-white/70 text-xs mt-0.5">
                                    {question.type} &middot; Version {version?.version ?? "?"}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                    {/* Type, difficulty & status */}
                    <div className="flex flex-wrap gap-2">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0">{question.type}</Badge>
                        {version?.difficulty != null && (
                            <Badge
                                className={
                                    version.difficulty <= 2
                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0"
                                        : version.difficulty <= 3
                                            ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-0"
                                            : "bg-red-100 text-red-700 hover:bg-red-100 border-0"
                                }
                            >
                                Schwierigkeit: {version.difficulty}/5
                            </Badge>
                        )}
                        <Badge
                            className={
                                question.is_published
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0"
                                    : "bg-amber-100 text-amber-700 hover:bg-amber-100 border-0"
                            }
                        >
                            {question.is_published ? "Veröffentlicht" : "Entwurf"}
                        </Badge>
                    </div>

                    {/* Explanation */}
                    {version?.explanation && (
                        <>
                            <Separator />
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                    Erklärung
                                </p>
                                <p className="text-sm leading-relaxed">{version.explanation}</p>
                            </div>
                        </>
                    )}

                    {/* Answer options */}
                    {version?.answer_options && version.answer_options.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                                    Antwortoptionen
                                </p>
                                <div className="space-y-2">
                                    {version.answer_options
                                        .sort((a, b) => a.sort_order - b.sort_order)
                                        .map(option => (
                                            <div
                                                key={option.id}
                                                className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm transition-colors ${
                                                    option.is_correct
                                                        ? "bg-emerald-50 border-emerald-200"
                                                        : "bg-muted/30 border-border"
                                                }`}
                                            >
                                                {option.is_correct ? (
                                                    <CheckCircle className="size-4 text-emerald-600 shrink-0" />
                                                ) : (
                                                    <X className="size-4 text-muted-foreground shrink-0" />
                                                )}
                                                <span className={option.is_correct ? "text-emerald-800 font-medium" : ""}>
                                                    {option.text}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Meta */}
                    <Separator />
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {version?.default_points != null && (
                            <span>Punkte: {version.default_points}</span>
                        )}
                        {version?.default_time_limit != null && (
                            <span>Zeitlimit: {version.default_time_limit}s</span>
                        )}
                        <span>Versionen: {question.versions?.length ?? 1}</span>
                    </div>

                    <Button onClick={onClose} className="w-full bg-primary hover:bg-primary-hover">
                        Schließen
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
