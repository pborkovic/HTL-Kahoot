import { HelpCircle } from "lucide-react";
import { QuestionFilters } from "./question-filters";
import { QuestionTable } from "./question-table";
import { QuestionDetailDialog } from "./question-detail-dialog";
import type { UseQuestionsReturn } from "@/hooks/use-questions";

interface QuestionsPanelProps {
    questions: UseQuestionsReturn;
}

export function QuestionsPanel({ questions: q }: QuestionsPanelProps) {
    return (
        <>
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center">
                                <HelpCircle className="size-3.5 text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold text-foreground">Fragen</h2>
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">
                            {q.selectedIds.size} von {q.displayQuestions.length} ausgewählt
                        </span>
                    </div>
                </div>

                <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
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
            />
        </>
    );
}
