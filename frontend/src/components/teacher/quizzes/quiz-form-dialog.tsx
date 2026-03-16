"use client";

import { useState, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Quiz } from "@/types/quiz";

interface QuizFormDialogProps {
    readonly open: boolean;
    readonly quiz: Quiz | null;
    readonly onClose: () => void;
    readonly onSaved: () => void;
}

export function QuizFormDialog({ open, quiz, onClose, onSaved }: QuizFormDialogProps) {
    const isEdit = !!quiz;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [timeMode, setTimeMode] = useState("per_question");
    const [totalTimeLimit, setTotalTimeLimit] = useState("600");
    const [speedScoring, setSpeedScoring] = useState(true);
    const [randomizeQuestions, setRandomizeQuestions] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (quiz) {
            setTitle(quiz.title);
            setDescription(quiz.description ?? "");
            setTimeMode(quiz.time_mode);
            setTotalTimeLimit(String(quiz.total_time_limit ?? 600));
            setSpeedScoring(quiz.speed_scoring);
            setRandomizeQuestions(quiz.randomize_questions);
        } else {
            setTitle("");
            setDescription("");
            setTimeMode("per_question");
            setTotalTimeLimit("600");
            setSpeedScoring(true);
            setRandomizeQuestions(false);
        }
        setError(null);
    }, [open, quiz]);

    const handleSave = useCallback(async () => {
        setError(null);

        if (!title.trim()) {
            setError("Bitte gib einen Titel ein.");
            return;
        }

        setSaving(true);

        const body = {
            title: title.trim(),
            description: description.trim() || null,
            time_mode: timeMode,
            total_time_limit: timeMode === "total" ? Number(totalTimeLimit) : null,
            speed_scoring: speedScoring,
            randomize_questions: randomizeQuestions,
        };

        try {
            if (isEdit) {
                await apiFetch(`/v1/quizzes/${quiz.id}`, {
                    method: "PUT",
                    body: JSON.stringify(body),
                });
            } else {
                await apiFetch("/v1/quizzes", {
                    method: "POST",
                    body: JSON.stringify(body),
                });
            }
            onSaved();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Fehler beim Speichern");
        } finally {
            setSaving(false);
        }
    }, [title, description, timeMode, totalTimeLimit, speedScoring, randomizeQuestions, isEdit, quiz, onSaved, onClose]);

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); } }}>
            <DialogContent className="max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {isEdit ? "Quiz bearbeiten" : "Neues Quiz erstellen"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        {isEdit
                            ? "Einstellungen des Quizzes anpassen."
                            : "Erstelle ein neues Quiz, das du später mit Fragen füllen und spielen kannst."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                            Titel *
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="z.B. Geografie Quiz Europa"
                            className="text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                            Beschreibung (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Worum geht es in diesem Quiz?"
                            rows={2}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                                Zeitmodus
                            </label>
                            <Select value={timeMode} onValueChange={setTimeMode}>
                                <SelectTrigger className="w-full text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="per_question">Pro Frage</SelectItem>
                                    <SelectItem value="total">Gesamtzeit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {timeMode === "total" && (
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                                    Gesamtzeit (Sek.)
                                </label>
                                <Input
                                    type="number"
                                    min="60"
                                    max="3600"
                                    value={totalTimeLimit}
                                    onChange={(e) => setTotalTimeLimit(e.target.value)}
                                    className="text-sm"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <Checkbox
                                checked={speedScoring}
                                onCheckedChange={(v) => setSpeedScoring(v === true)}
                            />
                            <div>
                                <span className="text-xs font-medium">Speed-Scoring</span>
                                <p className="text-[10px] text-muted-foreground">Schnellere Antworten erhalten mehr Punkte</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <Checkbox
                                checked={randomizeQuestions}
                                onCheckedChange={(v) => setRandomizeQuestions(v === true)}
                            />
                            <div>
                                <span className="text-xs font-medium">Fragen mischen</span>
                                <p className="text-[10px] text-muted-foreground">Reihenfolge bei jedem Spiel zufällig</p>
                            </div>
                        </label>
                    </div>

                    {error && (
                        <div className="text-xs text-destructive bg-destructive/5 border border-destructive/10 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={saving} className="text-xs h-9">
                        Abbrechen
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="text-xs h-9">
                        {saving ? (
                            <Loader2 className="size-3.5 animate-spin" />
                        ) : isEdit ? (
                            "Speichern"
                        ) : (
                            "Erstellen"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
