import { useState, useEffect, useCallback, useRef } from "react";
import { Check, X, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { StudentQuestionReviewProps, FullReviewResponse } from "@/types/review";

/**
 * A component that allows teachers to review a student's performance in a game session.
 * 
 * Displays each question, the student's answer, and whether it was correct.
 * For free-text questions, it provides a mechanism for teachers to manually
 * override the evaluation result.
 *
 * @param props - The component props (studentId and gamePin).
 * @returns The rendered student question review panel.
 */
export default function StudentQuestionReview({ studentId, gamePin }: StudentQuestionReviewProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [fullReview, setFullReview] = useState<FullReviewResponse | null>(null);
    const [overriding, setOverriding] = useState<string | null>(null);
    const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const hasPendingEvaluation = useCallback((data: FullReviewResponse | null): boolean => {
        if (!data) return false;
        return data.questions.some((q) =>
            q.question_type === "free_text" &&
            q.student_answers.some((sa) => sa.is_correct === null)
        );
    }, []);

    const fetchReview = useCallback(() => {
        return apiFetch<{ data: FullReviewResponse }>(`/v1/sessions/${gamePin}/full-review`)
            .then((res) => {
                setFullReview(res.data);
                return res.data;
            })
            .catch((err) => {
                console.error("Failed to load results:", err);
                return null;
            });
    }, [gamePin]);

    useEffect(() => {
        if (!gamePin) return;

        setIsLoading(true);
        fetchReview().then((data) => {
            setIsLoading(false);
            if (hasPendingEvaluation(data)) {
                pollRef.current = setTimeout(function poll() {
                    fetchReview().then((updated) => {
                        if (hasPendingEvaluation(updated)) {
                            pollRef.current = setTimeout(poll, 3000);
                        }
                    });
                }, 3000);
            }
        });

        return () => {
            if (pollRef.current) clearTimeout(pollRef.current);
        };
    }, [gamePin, fetchReview, hasPendingEvaluation]);

    const handleOverride = useCallback(async (responseId: string, isCorrect: boolean) => {
        setOverriding(responseId);
        try {
            await apiFetch(`/v1/sessions/${gamePin}/responses/${responseId}/override`, {
                method: "PATCH",
                body: JSON.stringify({ is_correct: isCorrect }),
            });
            await fetchReview();
        } catch (err) {
            console.error("Override failed:", err);
        } finally {
            setOverriding(null);
        }
    }, [gamePin, fetchReview]);

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
                    const isPending = question.question_type === "free_text" && studentAnswer?.is_correct === null;
                    const isFreeText = question.question_type === "free_text";

                    return (
                        <div key={index} className="relative pl-4 border-l-2 border-border/50">
                            <div className={`absolute -left-2.25 top-0 size-4 rounded-full border-2 border-background flex items-center justify-center ${
                                isPending ? "bg-amber-500 text-white" :
                                isQuestionCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                            }`}>
                                {isPending ? <Loader2 className="size-2.5 animate-spin" /> :
                                isQuestionCorrect ? <Check className="size-2.5" /> : <X className="size-2.5" />}
                            </div>

                            <div className="mb-2">
                                <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded mr-2">
                                    Frage {question.question_index + 1}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {question.question_text}
                                </span>
                            </div>

                            {isFreeText ? (
                                <div className="space-y-2">
                                    <div className={`p-3 rounded-lg border text-sm ${
                                        isPending
                                            ? "border-amber-500/50 bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20"
                                            : isQuestionCorrect
                                                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20"
                                                : "border-red-500/50 bg-red-500/10 text-red-700 ring-1 ring-red-500/20"
                                    }`}>
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1">
                                            {isPending ? "Antwort — wird ausgewertet\u2026" : "Antwort"}
                                        </p>
                                        <p className="font-medium">{studentAnswer?.answer_text ?? "Keine Antwort"}</p>
                                    </div>
                                    {question.answer_options.filter(o => o.is_correct).length > 0 && (
                                        <div className="p-3 rounded-lg border border-emerald-500/30 bg-transparent text-emerald-600/80 border-dashed text-sm">
                                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1">Erwartete Antwort</p>
                                            <p>{question.answer_options.filter(o => o.is_correct).map(o => o.text).join(", ")}</p>
                                        </div>
                                    )}

                                    {/* Teacher override buttons */}
                                    {studentAnswer && !isPending && (
                                        <div className="flex items-center gap-2 pt-1">
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mr-1">Bewertung:</span>
                                            <button
                                                type="button"
                                                disabled={overriding === studentAnswer.response_id}
                                                onClick={() => handleOverride(studentAnswer.response_id, true)}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                                                    isQuestionCorrect
                                                        ? "bg-emerald-500 text-white"
                                                        : "bg-muted text-muted-foreground hover:bg-emerald-500/20 hover:text-emerald-600"
                                                }`}
                                            >
                                                <ThumbsUp className="size-3" />
                                                Richtig
                                            </button>
                                            <button
                                                type="button"
                                                disabled={overriding === studentAnswer.response_id}
                                                onClick={() => handleOverride(studentAnswer.response_id, false)}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                                                    !isQuestionCorrect
                                                        ? "bg-red-500 text-white"
                                                        : "bg-muted text-muted-foreground hover:bg-red-500/20 hover:text-red-600"
                                                }`}
                                            >
                                                <ThumbsDown className="size-3" />
                                                Falsch
                                            </button>
                                            {overriding === studentAnswer.response_id && (
                                                <Loader2 className="size-3 animate-spin text-muted-foreground" />
                                            )}
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
