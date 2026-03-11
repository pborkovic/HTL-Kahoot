interface QuestionHeaderProps {
    questionIndex: number;
    totalQuestions: number;
    timeLimit: number;
    timeRemaining: number;
}

export function QuestionHeader({ questionIndex, totalQuestions, timeLimit, timeRemaining }: QuestionHeaderProps) {
    const fraction = timeRemaining / timeLimit;
    const isUrgent = timeRemaining <= 5;

    return (
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
                Frage {questionIndex + 1} von {totalQuestions}
            </span>
            <div className="flex items-center gap-3">
                <div className="w-32 h-2 rounded-full bg-muted/40 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-200 ${isUrgent ? "bg-red-500" : "bg-primary"}`}
                        style={{ width: `${fraction * 100}%` }}
                    />
                </div>
                <span className={`text-sm font-bold tabular-nums ${isUrgent ? "text-red-500" : "text-foreground"}`}>
                    {Math.ceil(timeRemaining)}s
                </span>
            </div>
        </div>
    );
}
