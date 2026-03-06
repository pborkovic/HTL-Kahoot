import { Clock, Weight } from "lucide-react";
import type { ReactNode } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface QuizSettingsProps {
    questionWeight: number;
    maxTimePerQuestion: number;
    onWeightChange: (value: number) => void;
    onTimeChange: (value: number) => void;
    children?: ReactNode;
}

export function QuizSettings({
    questionWeight,
    maxTimePerQuestion,
    onWeightChange,
    onTimeChange,
}: QuizSettingsProps) {
    return (
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
            <div className="px-4 sm:px-5 py-4 sm:py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Weight className="size-3.5 text-muted-foreground" />
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
                                className="w-14 text-center text-xs font-semibold h-8"
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground/70">
                            <span>Niedrig</span>
                            <span>Hoch</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="size-3.5 text-muted-foreground" />
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
                                    className="w-14 text-center text-xs font-semibold h-8"
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
