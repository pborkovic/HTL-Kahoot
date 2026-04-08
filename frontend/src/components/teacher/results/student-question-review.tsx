import { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import {StudentQuestionReviewProps, FullReviewResponse} from "@/types/review";

export default function StudentQuestionReview({ studentId, gamePin }: StudentQuestionReviewProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [fullReview, setFullReview] = useState<FullReviewResponse | null>(null);

    useEffect(() => {
        if (!gamePin) return;

        setIsLoading(true);
        apiFetch<{ data: FullReviewResponse }>(`/v1/sessions/${gamePin}/full-review`)
            .then((res) => {
                setFullReview(res.data);
            })
            .catch((err) => {
                console.error("Failed to load results:", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [gamePin]);

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!fullReview || !fullReview.questions) {
        return <div className="p-4 text-center text-muted-foreground text-sm">Keine Daten verfügbar.</div>;
    }

    return (
        <div className="space-y-6 p-4 border-t">
            <div className="grid gap-4">
                {fullReview.questions.map((question, index) => {
                    const studentAnswer = question.student_answers.find(
                        (sa) => sa.participant_id === studentId
                    );

                    const isQuestionCorrect = studentAnswer?.is_correct === true;

                    return (
                        <div key={index} className="relative pl-4 border-l-2 border-border/50">
                            <div className={`absolute -left-2.25 top-0 size-4 rounded-full border-2 border-background flex items-center justify-center ${
                                isQuestionCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                            }`}>
                                {isQuestionCorrect ? <Check className="size-2.5" /> : <X className="size-2.5" />}
                            </div>

                            <div className="mb-2">
                                <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded mr-2">
                                    Frage {question.question_index + 1}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {question.question_text}
                                </span>
                            </div>

                            {question.question_type === "free_text" ? (
                                <div className="space-y-2">
                                    <div className={`p-3 rounded-lg border text-sm ${
                                        isQuestionCorrect
                                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20"
                                            : "border-red-500/50 bg-red-500/10 text-red-700 ring-1 ring-red-500/20"
                                    }`}>
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1">Antwort</p>
                                        <p className="font-medium">{studentAnswer?.answer_text ?? "Keine Antwort"}</p>
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
                                        const isSelected = studentAnswer?.selected_option_ids.includes(option.id);
                                        const isCorrect = option.is_correct;

                                        let styleClass = "border-transparent bg-muted/30 text-muted-foreground opacity-70";
                                        let icon = null;

                                        if (isSelected && isCorrect) {
                                            styleClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 font-medium opacity-100 ring-1 ring-emerald-500/20";
                                            icon = <Check className="size-3.5 text-emerald-600" />;
                                        } else if (isSelected && !isCorrect) {
                                            styleClass = "border-red-500/50 bg-red-500/10 text-red-700 font-medium opacity-100 ring-1 ring-red-500/20";
                                            icon = <X className="size-3.5 text-red-600" />;
                                        } else if (!isSelected && isCorrect) {
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
    );
}
