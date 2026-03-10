"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { ClipboardList } from "lucide-react";
import { useQuestions } from "@/hooks/use-questions";
import { QuestionsToolbar } from "@/components/teacher/questions/questions-toolbar";
import { QuestionsGrid } from "@/components/teacher/questions/questions-grid";
import { MassManagementDialog } from "@/components/teacher/questions/mass-management-dialog";
import { QuestionDetailDialog } from "@/components/teacher/dashboard/question-detail-dialog";

export default function QuestionsPage(): ReactNode {
  const q = useQuestions();
  const [massOpen, setMassOpen] = useState<boolean>(false);

  const handleImportComplete = useCallback((): void => {
    q.refetch();
  }, [q]);

  return (
    <div className="flex-1">
      <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-8 mx-auto max-w-[1920px]">
        {/* Header */}
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

        {/* Pagination info */}
        {q.meta && q.meta.total > q.displayQuestions.length && (
          <p className="text-xs text-muted-foreground text-right">
            Zeige {q.displayQuestions.length} von {q.meta.total} Fragen
          </p>
        )}
      </div>

      {/* Detail dialog */}
      <QuestionDetailDialog
        question={q.detailQuestion}
        onClose={(): void => q.setDetailQuestion(null)}
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
