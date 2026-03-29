"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Plus, Trash2, GripVertical, Check, X, Loader2, ImagePlus, Film } from "lucide-react";
import { apiFetch, apiUpload } from "@/lib/api";
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
import type { Question, QuestionMedia } from "@/types/question";

interface AnswerOptionForm {
    readonly id: string;
    text: string;
    is_correct: boolean;
}

interface QuestionFormDialogProps {
    readonly open: boolean;
    readonly question: Question | null;
    readonly onClose: () => void;
    readonly onSaved: () => void;
}

function createEmptyOption(): AnswerOptionForm {
    return { id: crypto.randomUUID(), text: "", is_correct: false };
}

function inferMediaType(file: File): "image" | "video" | "code_snippet" {
    if (file.type.startsWith("video/")) return "video";
    return "image";
}

export function QuestionFormDialog({ open, question, onClose, onSaved }: QuestionFormDialogProps) {
    const isEdit = !!question;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [type, setType] = useState("multiple_choice");
    const [difficulty, setDifficulty] = useState<string>("3");
    const [timeLimit, setTimeLimit] = useState<string>("30");
    const [points, setPoints] = useState<string>("1000");
    const [explanation, setExplanation] = useState("");
    const [options, setOptions] = useState<AnswerOptionForm[]>([
        { ...createEmptyOption(), is_correct: true },
        createEmptyOption(),
        createEmptyOption(),
        createEmptyOption(),
    ]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [existingMedia, setExistingMedia] = useState<QuestionMedia[]>([]);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [mediaToDelete, setMediaToDelete] = useState<string[]>([]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (question?.current_version) {
            const v = question.current_version;
            setTitle(v.title);
            setType(question.type);
            setDifficulty(String(v.difficulty ?? 3));
            setTimeLimit(String(v.default_time_limit ?? 30));
            setPoints(String(v.default_points ?? 1000));
            setExplanation(v.explanation ?? "");
            setOptions(
                v.answer_options?.length > 0
                    ? v.answer_options
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((o) => ({ id: o.id, text: o.text, is_correct: o.is_correct }))
                    : [{ ...createEmptyOption(), is_correct: true }, createEmptyOption()]
            );
            setExistingMedia(question.media ?? []);
        } else {
            setTitle("");
            setType("multiple_choice");
            setDifficulty("3");
            setTimeLimit("30");
            setPoints("1000");
            setExplanation("");
            setOptions([
                { ...createEmptyOption(), is_correct: true },
                createEmptyOption(),
                createEmptyOption(),
                createEmptyOption(),
            ]);
            setExistingMedia([]);
        }
        setPendingFiles([]);
        setMediaToDelete([]);
        setError(null);
    }, [open, question]);

    const addOption = useCallback(() => {
        setOptions((prev) => [...prev, createEmptyOption()]);
    }, []);

    const removeOption = useCallback((id: string) => {
        setOptions((prev) => prev.filter((o) => o.id !== id));
    }, []);

    const updateOptionText = useCallback((id: string, text: string) => {
        setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
    }, []);

    const toggleCorrect = useCallback((id: string) => {
        setOptions((prev) =>
            prev.map((o) => (o.id === id ? { ...o, is_correct: !o.is_correct } : o))
        );
    }, []);

    const moveOption = useCallback((index: number, direction: -1 | 1) => {
        setOptions((prev) => {
            const next = [...prev];
            const target = index + direction;
            if (target < 0 || target >= next.length) {
                return prev;
            }
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length > 0) {
            setPendingFiles((prev) => [...prev, ...files]);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    const removePendingFile = useCallback((index: number) => {
        setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const markMediaForDeletion = useCallback((mediaId: string) => {
        setMediaToDelete((prev) => [...prev, mediaId]);
    }, []);

    const handleSave = useCallback(async () => {
        setError(null);

        if (!title.trim()) {
            setError("Bitte gib einen Fragetitel ein.");
            return;
        }

        const filledOptions = options.filter((o) => o.text.trim());

        if (filledOptions.length < 2) {
            setError("Mindestens 2 Antwortoptionen sind erforderlich.");
            return;
        }
        if (!filledOptions.some((o) => o.is_correct)) {
            setError("Mindestens eine Antwort muss als korrekt markiert sein.");
            return;
        }

        setSaving(true);

        const body = {
            type,
            title: title.trim(),
            explanation: explanation.trim() || null,
            difficulty: Number(difficulty),
            default_points: Number(points),
            default_time_limit: Number(timeLimit),
            randomize_options: false,
            answer_options: filledOptions.map((o, i) => ({
                text: o.text.trim(),
                is_correct: o.is_correct,
                sort_order: i,
            })),
        };

        try {
            let questionId: string;

            if (isEdit) {
                await apiFetch(`/v1/questions/${question.id}`, {
                    method: "PUT",
                    body: JSON.stringify(body),
                });
                questionId = question.id;
            } else {
                const res = await apiFetch<{ id: string }>("/v1/questions", {
                    method: "POST",
                    body: JSON.stringify(body),
                });
                questionId = res.id;
            }

            for (const mediaId of mediaToDelete) {
                await apiFetch(`/v1/questions/${questionId}/media/${mediaId}`, {
                    method: "DELETE",
                }).catch(() => {});
            }

            for (let i = 0; i < pendingFiles.length; i++) {
                const file = pendingFiles[i];
                const formData = new FormData();
                formData.append("file", file);
                formData.append("type", inferMediaType(file));
                formData.append("sort_order", String(existingMedia.length + i));
                await apiUpload(`/v1/questions/${questionId}/media`, formData);
            }

            onSaved();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Fehler beim Speichern");
        } finally {
            setSaving(false);
        }
    }, [
        title,
        type,
        difficulty,
        timeLimit,
        points,
        explanation,
        options,
        isEdit,
        question,
        mediaToDelete,
        pendingFiles,
        existingMedia.length,
        onSaved,
        onClose
    ]);

    const hasCorrect = options.some((o) => o.is_correct);
    const visibleMedia = existingMedia.filter((m) => !mediaToDelete.includes(m.id));

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {isEdit ? "Frage bearbeiten" : "Neue Frage erstellen"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        {isEdit
                            ? "Änderungen erstellen eine neue Version der Frage."
                            : "Erstelle eine neue Frage mit Antwortoptionen."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                            Frage *
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Wie heißt die Hauptstadt von Österreich?"
                            className="text-sm"
                        />
                    </div>

                    {/* Type + Difficulty row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                                Typ
                            </label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="w-full text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                    <SelectItem value="true_false">Wahr / Falsch</SelectItem>
                                    <SelectItem value="single_choice">Single Choice</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                                Schwierigkeit
                            </label>
                            <Select value={difficulty} onValueChange={setDifficulty}>
                                <SelectTrigger className="w-full text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 — Sehr leicht</SelectItem>
                                    <SelectItem value="2">2 — Leicht</SelectItem>
                                    <SelectItem value="3">3 — Mittel</SelectItem>
                                    <SelectItem value="4">4 — Schwer</SelectItem>
                                    <SelectItem value="5">5 — Sehr schwer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Time + Points row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                                Zeitlimit (Sek.)
                            </label>
                            <Input
                                type="number"
                                min="5"
                                max="300"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(e.target.value)}
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                                Punkte
                            </label>
                            <Input
                                type="number"
                                min="0"
                                max="10000"
                                value={points}
                                onChange={(e) => setPoints(e.target.value)}
                                className="text-sm"
                            />
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                            Erklärung (optional)
                        </label>
                        <textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="Wird nach der Auflösung angezeigt..."
                            rows={2}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground resize-none"
                        />
                    </div>

                    {/* Media Upload */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                            Medien (optional)
                        </label>
                        <p className="text-[10px] text-muted-foreground -mt-1">
                            Bilder, Code-Screenshots oder Videos zur Frage hinzufügen
                        </p>

                        {(visibleMedia.length > 0 || pendingFiles.length > 0) && (
                            <div className="flex flex-wrap gap-2">
                                {visibleMedia.map((m) => (
                                    <div key={m.id} className="relative w-24 h-20 rounded-lg border border-border/60 overflow-hidden group">
                                        {m.type === "video" ? (
                                            <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                                                <Film className="size-6 text-muted-foreground" />
                                            </div>
                                        ) : (
                                            <img
                                                src={m.url}
                                                alt={m.alt_text ?? ""}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => markMediaForDeletion(m.id)}
                                            className="absolute top-1 right-1 size-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="size-3" />
                                        </button>
                                        <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] text-center py-0.5 truncate px-1">
                                            {m.type}
                                        </span>
                                    </div>
                                ))}
                                {pendingFiles.map((file, i) => (
                                    <div key={`pending-${i}`} className="relative w-24 h-20 rounded-lg border border-dashed border-border overflow-hidden group">
                                        {file.type.startsWith("video/") ? (
                                            <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                                                <Film className="size-6 text-muted-foreground" />
                                            </div>
                                        ) : (
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removePendingFile(i)}
                                            className="absolute top-1 right-1 size-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="size-3" />
                                        </button>
                                        <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] text-center py-0.5 truncate px-1">
                                            Neu
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                        >
                            <ImagePlus className="size-3" />
                            Bild oder Video hinzufügen
                        </button>
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                                Antwortoptionen *
                            </label>
                            <span className="text-[10px] text-muted-foreground">
                                {!hasCorrect && (
                                    <span className="text-destructive">Keine korrekte Antwort markiert</span>
                                )}
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            {options.map((option, index) => (
                                <div
                                    key={option.id}
                                    className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors ${
                                        option.is_correct
                                            ? "bg-emerald-500/5 border-emerald-200"
                                            : "border-border/60"
                                    }`}
                                >
                                    {/* Reorder buttons */}
                                    <div className="flex flex-col -my-0.5">
                                        <button
                                            type="button"
                                            onClick={() => moveOption(index, -1)}
                                            disabled={index === 0}
                                            className="text-muted-foreground/40 hover:text-foreground disabled:opacity-20 p-0 leading-none"
                                            tabIndex={-1}
                                        >
                                            <GripVertical className="size-3" />
                                        </button>
                                    </div>

                                    {/* Correct toggle */}
                                    <button
                                        type="button"
                                        onClick={() => toggleCorrect(option.id)}
                                        className={`size-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                            option.is_correct
                                                ? "bg-emerald-500 border-emerald-500 text-white"
                                                : "border-border hover:border-emerald-300"
                                        }`}
                                        title={option.is_correct ? "Als falsch markieren" : "Als korrekt markieren"}
                                    >
                                        {option.is_correct && <Check className="size-3" />}
                                    </button>

                                    {/* Text input */}
                                    <Input
                                        value={option.text}
                                        onChange={(e) => updateOptionText(option.id, e.target.value)}
                                        placeholder={`Antwort ${index + 1}`}
                                        className="h-7 text-xs border-0 shadow-none focus-visible:ring-0 bg-transparent"
                                    />

                                    {/* Remove */}
                                    <button
                                        type="button"
                                        onClick={() => removeOption(option.id)}
                                        disabled={options.length <= 2}
                                        className="text-muted-foreground/40 hover:text-destructive disabled:opacity-20 p-0.5 shrink-0"
                                        tabIndex={-1}
                                    >
                                        <Trash2 className="size-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {options.length < 8 && (
                            <button
                                type="button"
                                onClick={addOption}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                            >
                                <Plus className="size-3" />
                                Antwortoption hinzufügen
                            </button>
                        )}
                    </div>

                    {/* Error */}
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
