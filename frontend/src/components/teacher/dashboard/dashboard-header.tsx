"use client";

import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, Pencil, Check } from "lucide-react";

interface DashboardHeaderProps {
    readonly quizTitle?: string | null;
    readonly onTitleChange?: (title: string) => void;
}

export function DashboardHeader({ quizTitle, onTitleChange }: DashboardHeaderProps) {
    const isNew = !quizTitle;
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(quizTitle ?? "");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTitle(quizTitle ?? "");
    }, [quizTitle]);

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [editing]);

    function commit() {
        const trimmed = title.trim();
        if (trimmed && trimmed !== quizTitle) {
            onTitleChange?.(trimmed);
        }
        setEditing(false);
    }

    return (
        <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-foreground flex items-center justify-center">
                <LayoutDashboard className="size-4.5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                {editing ? (
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={commit}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") commit();
                                if (e.key === "Escape") { setTitle(quizTitle ?? ""); setEditing(false); }
                            }}
                            className="text-xl font-semibold tracking-tight text-foreground bg-transparent border-b-2 border-foreground/20 focus:border-foreground outline-none py-0.5 w-full max-w-md"
                            placeholder="Quiz-Titel eingeben..."
                        />
                        <button type="button" onClick={commit} className="text-muted-foreground hover:text-foreground">
                            <Check className="size-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 group">
                        <h1 className="text-xl font-semibold tracking-tight text-foreground truncate">
                            {quizTitle || "Neues Quiz"}
                        </h1>
                        {onTitleChange && (
                            <button
                                type="button"
                                onClick={() => setEditing(true)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                            >
                                <Pencil className="size-3.5" />
                            </button>
                        )}
                    </div>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                    {isNew
                        ? "Titel vergeben, Fragen und Teilnehmer auswählen, dann Quiz speichern oder starten."
                        : "Fragen und Teilnehmer anpassen, dann Quiz starten."}
                </p>
            </div>
        </div>
    );
}
