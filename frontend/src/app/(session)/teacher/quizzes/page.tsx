"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { useQuizzes } from "@/hooks/use-quizzes";
import { QuizToolbar } from "@/components/teacher/quizzes/quiz-toolbar";
import { QuizTable } from "@/components/teacher/quizzes/quiz-table";
import { QuizFormDialog } from "@/components/teacher/quizzes/quiz-form-dialog";
import { QuizDetailDialog } from "@/components/teacher/quizzes/quiz-detail-dialog";
import { Pagination } from "@/components/ui/pagination";
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
        <div className="flex-1 relative overflow-hidden">
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/15 blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse [animation-delay:3s]" />
            </div>

            <div className="relative flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-8 mx-auto max-w-[1920px]">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                            <BookOpen className="size-5 text-primary" />
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
                        className="h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover transition-all duration-200 cursor-pointer shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
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

                {/* Pagination */}
                {q.meta && <Pagination meta={q.meta} onPageChange={q.setPage} />}
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
