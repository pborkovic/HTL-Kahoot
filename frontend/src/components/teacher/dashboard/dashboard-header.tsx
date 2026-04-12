"use client";

import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, Pencil, Check } from "lucide-react";

/**
 * Props for the DashboardHeader component.
 */
interface DashboardHeaderProps {
    /** The current title of the quiz. */
    readonly quizTitle?: string | null;
    /**
     * Optional callback function when the quiz title is changed.
     * @param title - The new title.
     */
    readonly onTitleChange?: (title: string) => void;
}

/**
 * Header component for the teacher dashboard.
 * 
 * Displays the quiz title with an inline editing capability if `onTitleChange`
 * is provided. Shows context-sensitive instructions based on whether the
 * quiz is new or existing.
 *
 * @param props - The component props.
 * @returns The rendered dashboard header.
 */
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
            <div className="size-10 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                <LayoutDashboard className="size-5 text-primary" />
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
                            className="text-xl font-semibold tracking-tight text-foreground bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none py-0.5 w-full max-w-md"
                            placeholder="Quiz-Titel eingeben..."
                        />
                        <button type="button" onClick={commit} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
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
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary cursor-pointer"
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
