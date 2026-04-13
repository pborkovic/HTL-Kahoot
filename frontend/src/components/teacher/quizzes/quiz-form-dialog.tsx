"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
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

/**
 * Props for the QuizFormDialog component.
 */
interface QuizFormDialogProps {
    /** Whether the dialog is currently open. */
    readonly open: boolean;
    /** The quiz object to edit, or null to create a new quiz. */
    readonly quiz: Quiz | null;
    /** Callback function to close the dialog. */
    readonly onClose: () => void;
    /** Callback function called after the quiz is successfully saved. */
    readonly onSaved: () => void;
}

/**
 * A dialog component providing a form to create or edit a quiz.
 * 
 * Handles quiz metadata such as title, description, timing modes,
 * scoring preferences, and question randomization.
 *
 * @param props - The component props.
 * @returns The rendered quiz form dialog.
 */
export function QuizFormDialog({ open, quiz, onClose, onSaved }: QuizFormDialogProps) {
    const router = useRouter();
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
                onSaved();
                onClose();
            } else {
                const res = await apiFetch<{ id: string }>("/v1/quizzes", {
                    method: "POST",
                    body: JSON.stringify(body),
                });
                onSaved();
                onClose();
                router.push(`/teacher/dashboard?quiz=${res.id}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Fehler beim Speichern");
        } finally {
            setSaving(false);
        }
    }, [title, description, timeMode, totalTimeLimit, speedScoring, randomizeQuestions, isEdit, quiz, onSaved, onClose]);

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); } }}>
            <DialogContent className="max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-popover/90 dark:bg-popover/80 border-border/30 rounded-2xl shadow-2xl shadow-primary/5">
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
                            className="text-sm rounded-xl bg-background/50 backdrop-blur-sm border-border/40 focus:border-primary/50 focus:ring-primary/30"
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
                            className="w-full rounded-xl bg-background/50 backdrop-blur-sm border border-border/40 px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-primary/30 placeholder:text-muted-foreground resize-none transition-all duration-200"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                                Zeitmodus
                            </label>
                            <Select value={timeMode} onValueChange={setTimeMode}>
                                <SelectTrigger className="w-full text-sm rounded-xl bg-background/50 backdrop-blur-sm border-border/40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                                    <SelectItem value="per_question" className="cursor-pointer">Pro Frage</SelectItem>
                                    <SelectItem value="total" className="cursor-pointer">Gesamtzeit</SelectItem>
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
                                    className="text-sm rounded-xl bg-background/50 backdrop-blur-sm border-border/40 focus:border-primary/50 focus:ring-primary/30"
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
                        <div className="text-xs text-destructive rounded-xl backdrop-blur-sm bg-destructive/5 border border-destructive/15 px-3 py-2">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={saving} className="text-xs h-9 rounded-xl backdrop-blur-sm bg-background/40 border-border/40 hover:border-primary/30 hover:bg-background/60 transition-all duration-200 cursor-pointer">
                        Abbrechen
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="text-xs h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md shadow-primary/20 cursor-pointer">
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
