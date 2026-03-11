"use client";

import type { AnswerOption } from "@/types/session";

const OPTION_COLORS = [
    "bg-red-500/90 hover:bg-red-500 border-red-400/30",
    "bg-blue-500/90 hover:bg-blue-500 border-blue-400/30",
    "bg-amber-500/90 hover:bg-amber-500 border-amber-400/30",
    "bg-emerald-500/90 hover:bg-emerald-500 border-emerald-400/30",
    "bg-purple-500/90 hover:bg-purple-500 border-purple-400/30",
    "bg-pink-500/90 hover:bg-pink-500 border-pink-400/30",
];

const OPTION_SHAPES = ["◆", "●", "▲", "■", "★", "⬟"];

interface AnswerGridProps {
    options: AnswerOption[];
    selectedId: string | null;
    disabled: boolean;
    onSelect: (optionId: string) => void;
}

export function AnswerGrid({ options, selectedId, disabled, onSelect }: AnswerGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, i) => {
                const isSelected = selectedId === opt.id;
                const colorClass = OPTION_COLORS[i % OPTION_COLORS.length];
                const shape = OPTION_SHAPES[i % OPTION_SHAPES.length];

                return (
                    <button
                        key={opt.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onSelect(opt.id)}
                        className={`relative w-full min-h-20 sm:min-h-24 rounded-xl border-2 px-5 py-4 text-left text-white font-semibold text-base sm:text-lg transition-all ${colorClass} ${
                            isSelected
                                ? "ring-4 ring-white/50 scale-[0.97]"
                                : ""
                        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
                    >
                        <span className="flex items-start gap-3">
                            <span className="text-white/60 text-lg shrink-0 mt-0.5">{shape}</span>
                            <span>{opt.text}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
