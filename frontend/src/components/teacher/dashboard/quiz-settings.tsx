import { Settings, Clock, Weight } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
        <Card className="overflow-hidden border-0 shadow-md">
            {/* Green header */}
            <div className="bg-gradient-to-r from-primary to-primary-hover px-4 sm:px-6 py-3.5 sm:py-4">
                <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Settings className="size-4.5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Quiz-Einstellungen</h2>
                </div>
            </div>

            <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {/* Question weight */}
                    <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Weight className="size-4 text-primary" />
                            </div>
                            <label className="text-sm font-semibold">Gewichtung der Fragen</label>
                        </div>
                        <div className="flex items-center gap-4">
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
                                className="w-16 text-center text-sm font-bold"
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground px-0.5">
                            <span>Niedrig (1)</span>
                            <span>Hoch (10)</span>
                        </div>
                    </div>

                    {/* Max time per question */}
                    <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Clock className="size-4 text-primary" />
                            </div>
                            <label className="text-sm font-semibold">Maximale Zeit pro Frage</label>
                        </div>
                        <div className="flex items-center gap-4">
                            <Slider
                                min={5}
                                max={120}
                                step={5}
                                value={[maxTimePerQuestion]}
                                onValueChange={([v]) => onTimeChange(v)}
                                className="flex-1"
                            />
                            <div className="flex items-center gap-1.5">
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
                                    className="w-16 text-center text-sm font-bold"
                                />
                                <span className="text-xs text-muted-foreground font-medium">Sek.</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground px-0.5">
                            <span>5 Sekunden</span>
                            <span>2 Minuten</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
