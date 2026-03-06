import { HelpCircle, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
            <Card className="overflow-hidden border-0 shadow-md py-0 gap-0">                {/* Green header */}
                <div className="bg-gradient-to-r from-primary to-primary-hover px-4 sm:px-6 py-3.5 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <HelpCircle className="size-4.5 text-white" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">Fragen</h2>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium">
                            <ClipboardList className="size-3.5" />
                            <span>
                                {q.selectedIds.size}/{q.displayQuestions.length} ausgewählt
                            </span>
                        </div>
                    </div>
                </div>

                <CardContent className="p-4 sm:p-5 space-y-4">
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
                </CardContent>
            </Card>

            <QuestionDetailDialog
                question={q.detailQuestion}
                onClose={() => q.setDetailQuestion(null)}
            />
        </>
    );
}
