import { Check } from "lucide-react";
import type { QuestionResultOption } from "@/types/session";

const BAR_COLORS = [
    "bg-red-500",
    "bg-blue-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-purple-500",
    "bg-pink-500",
];

/**
 * Props for the AnswerDistribution component.
 */
interface AnswerDistributionProps {
    /** The distribution of responses across different answer options. */
    distribution: QuestionResultOption[];
    /** The total number of responses received. */
    totalResponses: number;
}

/**
 * A component that visualizes the distribution of answers for a question.
 * 
 * Displays horizontal bars representing the number of participants who chose
 * each option, with correct answers highlighted.
 *
 * @param props - The component props.
 * @returns The rendered answer distribution panel.
 */
export function AnswerDistribution({ distribution, totalResponses }: AnswerDistributionProps) {
    const maxCount = Math.max(1, ...distribution.map((d) => d.count));

    return (
        <div className="bg-card border border-border/60 rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Antwortverteilung</h3>
            <div className="space-y-2.5">
                {distribution.map((item, i) => {
                    const width = totalResponses > 0 ? (item.count / maxCount) * 100 : 0;
                    const barColor = BAR_COLORS[i % BAR_COLORS.length];

                    return (
                        <div key={item.option_id} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-foreground font-medium">
                                    {item.option_text}
                                    {item.is_correct && (
                                        <Check className="size-3.5 text-emerald-500" />
                                    )}
                                </span>
                                <span className="text-muted-foreground tabular-nums">
                                    {item.count}
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                                    style={{ width: `${width}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
