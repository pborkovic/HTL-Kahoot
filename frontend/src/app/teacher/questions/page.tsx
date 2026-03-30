"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { useQuestions } from "@/hooks/use-questions";
import { QuestionsToolbar } from "@/components/teacher/questions/questions-toolbar";
import { QuestionsGrid } from "@/components/teacher/questions/questions-grid";
import { MassManagementDialog } from "@/components/teacher/questions/mass-management-dialog";
import { QuestionDetailDialog } from "@/components/teacher/dashboard/question-detail-dialog";
import { QuestionFormDialog } from "@/components/teacher/questions/question-form-dialog";
import { Pagination } from "@/components/ui/pagination";
import type { Question } from "@/types/question";

export default function QuestionsPage(): ReactNode {
  const q = useQuestions();
  const [massOpen, setMassOpen] = useState<boolean>(false);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);

  const handleImportComplete = useCallback((): void => {
    q.refetch();
  }, [q]);

  const handleCreate = useCallback((): void => {
    setEditQuestion(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((question: Question): void => {
    setEditQuestion(question);
    setFormOpen(true);
    q.setDetailQuestion(null);
  }, [q]);

  const handleFormSaved = useCallback((): void => {
    q.refetch();
  }, [q]);

  return (
    <div className="flex-1">
      <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-8 mx-auto max-w-[1920px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-foreground flex items-center justify-center">
              <ClipboardList className="size-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Fragen</h1>
              <p className="text-xs text-muted-foreground">
                Alle Fragen verwalten, filtern und importieren
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-foreground text-background hover:bg-foreground/90 transition-colors cursor-pointer"
          >
            <Plus className="size-3.5" />
            Neue Frage
          </button>
        </div>

        {/* Toolbar */}
        <QuestionsToolbar
          searchTerm={q.searchTerm}
          onSearchChange={q.setSearchTerm}
          uniqueTypes={q.uniqueTypes}
          activeFilters={q.activeFilters}
          onToggleFilter={q.toggleFilter}
          onSort={q.sort}
          totalCount={q.meta?.total ?? q.displayQuestions.length}
          selectedCount={q.selectedIds.size}
          onOpenMassManagement={(): void => setMassOpen(true)}
        />

        {/* Questions table */}
        <QuestionsGrid
          questions={q.displayQuestions}
          selectedIds={q.selectedIds}
          allSelected={q.allSelected}
          loading={q.loading}
          error={q.error}
          onToggleSelect={q.toggleSelect}
          onToggleSelectAll={q.toggleSelectAll}
          onViewDetail={q.setDetailQuestion}
        />

        {/* Pagination */}
        {q.meta && <Pagination meta={q.meta} onPageChange={q.setPage} />}
      </div>

      {/* Detail dialog */}
      <QuestionDetailDialog
        question={q.detailQuestion}
        onClose={(): void => q.setDetailQuestion(null)}
        onEdit={handleEdit}
        onDeleted={handleFormSaved}
      />

      {/* Create/Edit dialog */}
      <QuestionFormDialog
        open={formOpen}
        question={editQuestion}
        onClose={(): void => setFormOpen(false)}
        onSaved={handleFormSaved}
      />

      {/* Mass management dialog */}
      <MassManagementDialog
        open={massOpen}
        onClose={(): void => setMassOpen(false)}
        questions={q.questions}
        selectedIds={q.selectedIds}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}
