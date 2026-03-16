"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { useQuizzes } from "@/hooks/use-quizzes";
import { QuizToolbar } from "@/components/teacher/quizzes/quiz-toolbar";
import { QuizTable } from "@/components/teacher/quizzes/quiz-table";
import { QuizFormDialog } from "@/components/teacher/quizzes/quiz-form-dialog";
import { QuizDetailDialog } from "@/components/teacher/quizzes/quiz-detail-dialog";
import type { Quiz } from "@/types/quiz";

export default function QuizzesPage(): ReactNode {
    const q = useQuizzes();
    const [formOpen, setFormOpen] = useState(false);
    const [editQuiz, setEditQuiz] = useState<Quiz | null>(null);

    const handleCreate = useCallback((): void => {
        setEditQuiz(null);
        setFormOpen(true);
    }, []);

    const handleSaved = useCallback((): void => {
        q.refetch();
    }, [q]);

    return (
        <div className="flex-1">
            <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-8 mx-auto max-w-[1920px]">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-foreground flex items-center justify-center">
                            <BookOpen className="size-4 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-foreground">Quizze</h1>
                            <p className="text-xs text-muted-foreground">
                                Quizze erstellen, verwalten und Ergebnisse ansehen
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-foreground text-background hover:bg-foreground/90 transition-colors cursor-pointer"
                    >
                        <Plus className="size-3.5" />
                        Neues Quiz
                    </button>
                </div>

                {/* Toolbar */}
                <QuizToolbar
                    searchTerm={q.searchTerm}
                    onSearchChange={q.setSearchTerm}
                    onSort={q.sort}
                    totalCount={q.meta?.total ?? q.quizzes.length}
                />

                {/* Quiz table */}
                <QuizTable
                    quizzes={q.quizzes}
                    loading={q.loading}
                    error={q.error}
                    onViewDetail={q.setDetailQuiz}
                />

                {/* Pagination info */}
                {q.meta && q.meta.total > q.quizzes.length && (
                    <p className="text-xs text-muted-foreground text-right">
                        Zeige {q.quizzes.length} von {q.meta.total} Quizze
                    </p>
                )}
            </div>

            {/* Detail dialog */}
            <QuizDetailDialog
                quiz={q.detailQuiz}
                onClose={() => q.setDetailQuiz(null)}
                onDeleted={handleSaved}
            />

            {/* Create/Edit dialog */}
            <QuizFormDialog
                open={formOpen}
                quiz={editQuiz}
                onClose={() => setFormOpen(false)}
                onSaved={handleSaved}
            />
        </div>
    );
}
