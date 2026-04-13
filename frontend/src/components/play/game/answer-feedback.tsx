import { CheckCircle2, XCircle, Flame, Send } from "lucide-react";

/**
 * Props for the AnswerFeedback component.
 */
interface AnswerFeedbackProps {
    /** Whether the answer was correct, incorrect, or not yet evaluated (null). */
    isCorrect: boolean | null;
    /** The number of points awarded for the answer. */
    scoreAwarded: number;
    /** The current streak of correct answers. */
    answerStreak?: number;
}

/**
 * AnswerFeedback component for displaying feedback after an answer is submitted.
 *
 * @param props - The component props.
 * @returns The AnswerFeedback component.
 */
export function AnswerFeedback({ isCorrect, scoreAwarded, answerStreak = 0 }: AnswerFeedbackProps) {
    return (
        <div className="flex flex-col items-center gap-4 py-8">
            {isCorrect === null ? (
                <>
                    <Send className="size-16 text-primary" />
                    <h2 className="text-2xl font-bold text-primary">Antwort eingereicht</h2>
                    <p className="text-white/40 text-sm">Wird nach der Frage ausgewertet</p>
                </>
            ) : isCorrect ? (
                <>
                    <CheckCircle2 className="size-16 text-emerald-400" />
                    <h2 className="text-2xl font-bold text-emerald-400">Richtig!</h2>
                </>
            ) : (
                <>
                    <XCircle className="size-16 text-red-400" />
                    <h2 className="text-2xl font-bold text-red-400">Falsch</h2>
                </>
            )}
            {isCorrect !== null && (
                <p className="text-white/60 text-lg tabular-nums">
                    +{scoreAwarded} Punkte
                </p>
            )}
            {answerStreak >= 2 && (
                <div className="flex items-center gap-1.5 text-amber-400 text-sm font-semibold">
                    <Flame className="size-4" />
                    {answerStreak}er Serie!
                </div>
            )}
        </div>
    );
}
