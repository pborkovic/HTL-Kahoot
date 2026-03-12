import { CheckCircle2, XCircle } from "lucide-react";

interface AnswerFeedbackProps {
    isCorrect: boolean;
    scoreAwarded: number;
}

export function AnswerFeedback({ isCorrect, scoreAwarded }: AnswerFeedbackProps) {
    return (
        <div className="flex flex-col items-center gap-4 py-8">
            {isCorrect ? (
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
            <p className="text-white/60 text-lg tabular-nums">
                +{scoreAwarded} Punkte
            </p>
        </div>
    );
}
