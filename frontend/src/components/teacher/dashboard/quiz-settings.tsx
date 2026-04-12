import { SlidersHorizontal, Clock, Weight } from "lucide-react";
import type { ReactNode } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

/**
 * Props for the QuizSettings component.
 */
interface QuizSettingsProps {
    /** The importance or weight assigned to questions in this quiz. */
    questionWeight: number;
    /** The maximum time allowed to answer each question (in seconds). */
    maxTimePerQuestion: number;
    /**
     * Callback function when the question weight is changed.
     * @param value - The new weight value.
     */
    onWeightChange: (value: number) => void;
    /**
     * Callback function when the time per question is changed.
     * @param value - The new time limit in seconds.
     */
    onTimeChange: (value: number) => void;
    /** Optional child components. */
    children?: ReactNode;
}

/**
 * A panel for configuring quiz-level settings.
 * 
 * Allows the teacher to adjust global question weighting and time limits using
 * sliders and numeric inputs.
 *
 * @param props - The component props.
 * @returns The rendered quiz settings panel.
 */
export function QuizSettings({
    questionWeight,
    maxTimePerQuestion,
    onWeightChange,
    onTimeChange,
}: QuizSettingsProps) {
    return (
        <div className="backdrop-blur-xl bg-card/60 dark:bg-card/40 border border-primary/15 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
            <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-4">
                <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                        <SlidersHorizontal className="size-3.5 text-primary" />
                    </div>
                    <h2 className="text-sm font-semibold text-foreground">Einstellungen</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Weight className="size-3.5 text-primary" />
                            <label className="text-xs font-medium text-foreground">Gewichtung</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[questionWeight]}
                                onValueChange={([v]) => onWeightChange(v)}
                                className="flex-1"
                            />
                            <Input
                                type="number"
                                min={1}
                                max={10}
                                value={questionWeight}
                                onChange={(e) => {
                                    const val = Math.min(10, Math.max(1, Number(e.target.value)));
                                    onWeightChange(val);
                                }}
                                className="w-14 text-center text-xs font-semibold h-8 rounded-lg bg-background/50 backdrop-blur-sm border-border/40"
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground/70">
                            <span>Niedrig</span>
                            <span>Hoch</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="size-3.5 text-primary" />
                            <label className="text-xs font-medium text-foreground">Zeit pro Frage</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Slider
                                min={5}
                                max={120}
                                step={5}
                                value={[maxTimePerQuestion]}
                                onValueChange={([v]) => onTimeChange(v)}
                                className="flex-1"
                            />
                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    min={5}
                                    max={120}
                                    step={5}
                                    value={maxTimePerQuestion}
                                    onChange={(e) => {
                                        const val = Math.min(120, Math.max(5, Number(e.target.value)));
                                        onTimeChange(val);
                                    }}
                                    className="w-14 text-center text-xs font-semibold h-8 rounded-lg bg-background/50 backdrop-blur-sm border-border/40"
                                />
                                <span className="text-[10px] text-muted-foreground">s</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground/70">
                            <span>5s</span>
                            <span>2min</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
