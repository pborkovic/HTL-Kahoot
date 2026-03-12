import type { AnswerOption } from "@/types/session";

const OPTION_COLORS = [
    "bg-red-500/10 border-red-500/30 text-red-500",
    "bg-blue-500/10 border-blue-500/30 text-blue-500",
    "bg-amber-500/10 border-amber-500/30 text-amber-500",
    "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
    "bg-purple-500/10 border-purple-500/30 text-purple-500",
    "bg-pink-500/10 border-pink-500/30 text-pink-500",
];

const OPTION_SHAPES = ["◆", "●", "▲", "■", "★", "⬟"];

interface QuestionCardProps {
    questionText: string;
    answerOptions: AnswerOption[];
}

export function QuestionCard({ questionText, answerOptions }: QuestionCardProps) {
    return (
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
            <div className="px-5 py-6 border-b border-border/40">
                <h2 className="text-xl font-bold text-foreground text-center leading-snug">
                    {questionText}
                </h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {answerOptions.map((opt, i) => {
                    const colorClass = OPTION_COLORS[i % OPTION_COLORS.length];
                    const shape = OPTION_SHAPES[i % OPTION_SHAPES.length];

                    return (
                        <div
                            key={opt.id}
                            className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${colorClass}`}
                        >
                            <span className="opacity-50 text-sm">{shape}</span>
                            <span className="font-medium text-foreground text-sm">{opt.text}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
