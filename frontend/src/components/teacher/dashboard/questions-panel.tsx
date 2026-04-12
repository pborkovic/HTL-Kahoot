import { ClipboardList, Plus } from "lucide-react";
import { QuestionFilters } from "./question-filters";
import { QuestionTable } from "./question-table";
import { QuestionDetailDialog } from "./question-detail-dialog";
import type { UseQuestionsReturn } from "@/hooks/use-questions";
import type { Question } from "@/types/question";

/**
 * Props for the QuestionsPanel component.
 */
interface QuestionsPanelProps {
    /** The state and methods returned from the useQuestions hook. */
    questions: UseQuestionsReturn;
    /** Optional callback function to create a new question. */
    onCreateQuestion?: () => void;
    /** Optional callback function to edit an existing question. */
    onEditQuestion?: (question: Question) => void;
    /** Optional callback function called when a question is deleted. */
    onQuestionDeleted?: () => void;
}

/**
 * A comprehensive panel for managing questions in a quiz session.
 * 
 * Orchestrates question filtering, selection, and table display. Also
 * handles the display of question details and provides an entry point for
 * creating new questions.
 *
 * @param props - The component props.
 * @returns The rendered questions panel.
 */
export function QuestionsPanel({ questions: q, onCreateQuestion, onEditQuestion, onQuestionDeleted }: QuestionsPanelProps) {
    return (
        <>
            <div className="backdrop-blur-xl bg-card/60 dark:bg-card/40 border border-primary/15 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
                <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="size-7 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                                <ClipboardList className="size-3.5 text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold text-foreground">Fragen</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs tabular-nums text-muted-foreground backdrop-blur-sm bg-background/30 px-2.5 py-1 rounded-lg">
                                {q.selectedIds.size} von {q.displayQuestions.length} ausgewählt
                            </span>
                            {onCreateQuestion && (
                                <button
                                    type="button"
                                    onClick={onCreateQuestion}
                                    className="h-7 px-2.5 rounded-lg text-[11px] font-medium flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary-hover transition-colors cursor-pointer shadow-md shadow-primary/20"
                                >
                                    <Plus className="size-3" />
                                    Neu
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 pb-5 sm:pb-6 space-y-3">
                    <QuestionFilters
                        searchTerm={q.searchTerm}
                        onSearchChange={q.setSearchTerm}
                        uniqueTypes={q.uniqueTypes}
                        activeFilters={q.activeFilters}
                        onToggleFilter={q.toggleFilter}
                        onSort={q.sort}
                    />
                    <QuestionTable
                        questions={q.displayQuestions}
                        selectedIds={q.selectedIds}
                        allSelected={q.allSelected}
                        loading={q.loading}
                        error={q.error}
                        onToggleSelect={q.toggleSelect}
                        onToggleSelectAll={q.toggleSelectAll}
                        onViewDetail={q.setDetailQuestion}
                    />
                    {q.meta && q.meta.total !== q.displayQuestions.length && (
                        <p className="text-xs text-muted-foreground text-right">
                            {q.meta.total} Fragen insgesamt
                        </p>
                    )}
                </div>
            </div>

            <QuestionDetailDialog
                question={q.detailQuestion}
                onClose={() => q.setDetailQuestion(null)}
                onEdit={onEditQuestion}
                onDeleted={onQuestionDeleted}
            />
        </>
    );
}
