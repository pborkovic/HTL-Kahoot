"use client";

import type { AnswerOption, QuestionType } from "@/types/session";

const OPTION_COLORS = [
    "bg-red-500/90 hover:bg-red-500 border-red-400/30",
    "bg-blue-500/90 hover:bg-blue-500 border-blue-400/30",
    "bg-amber-500/90 hover:bg-amber-500 border-amber-400/30",
    "bg-emerald-500/90 hover:bg-emerald-500 border-emerald-400/30",
    "bg-purple-500/90 hover:bg-purple-500 border-purple-400/30",
    "bg-pink-500/90 hover:bg-pink-500 border-pink-400/30",
];

const OPTION_SHAPES = ["◆", "●", "▲", "■", "★", "⬟"];

/**
 * Props for the AnswerGrid component.
 */
interface AnswerGridProps {
    /** The list of answer options to display. */
    options: AnswerOption[];
    /** The type of question (e.g., "multiple_choice", "single_choice"). */
    questionType: QuestionType;
    /** The IDs of the currently selected options. */
    selectedIds: string[];
    /** Whether the grid is disabled (e.g., after submission). */
    disabled: boolean;
    /**
     * Callback function when an option is selected.
     * @param optionId - The ID of the selected option.
     */
    onSelect: (optionId: string) => void;
}

/**
 * Displays a grid of interactive answer options for a game session.
 * 
 * Supports both single and multiple choice question types with visual feedback
 * for selection and distinct colors/shapes for each option.
 *
 * @param props - The component props.
 * @returns The rendered answer grid.
 */
export function AnswerGrid({ options, questionType, selectedIds, disabled, onSelect }: AnswerGridProps) {
    const isMultiSelect = questionType === "multiple_choice";

    return (
        <div className="flex flex-col gap-3">
            {isMultiSelect && (
                <p className="text-xs text-white/40 text-center uppercase tracking-wider">
                    Mehrere Antworten auswählen
                </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((opt, i) => {
                    const isSelected = selectedIds.includes(opt.id);
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
        </div>
    );
}
