import { UsersRound } from "lucide-react";
import { StudentFilters } from "./student-filters";
import { StudentTable } from "./student-table";
import type { UseStudentsReturn } from "@/hooks/use-students";

interface StudentsPanelProps {
    students: UseStudentsReturn;
}

export function StudentsPanel({ students: s }: StudentsPanelProps) {
    return (
        <div className="backdrop-blur-xl bg-card/60 dark:bg-card/40 border border-primary/15 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
            <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                            <UsersRound className="size-3.5 text-primary" />
                        </div>
                        <h2 className="text-sm font-semibold text-foreground">Schüler</h2>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground backdrop-blur-sm bg-background/30 px-2.5 py-1 rounded-lg">
                        {s.selectedIds.size} von {s.displayStudents.length} ausgewählt
                    </span>
                </div>
            </div>

            <div className="px-4 sm:px-6 pb-5 sm:pb-6 space-y-3">
                <StudentFilters
                    searchTerm={s.searchTerm}
                    onSearchChange={s.setSearchTerm}
                    uniqueClasses={s.uniqueClasses}
                    selectedStudentIds={s.selectedIds}
                    students={s.students}
                    onSort={s.sort}
                    onSelectWholeClass={s.selectWholeClass}
                />
                <StudentTable
                    students={s.displayStudents}
                    selectedIds={s.selectedIds}
                    allSelected={s.allSelected}
                    loading={s.loading}
                    error={s.error}
                    onToggleSelect={s.toggleSelect}
                    onToggleSelectAll={s.toggleSelectAll}
                />
                {!s.loading && s.displayStudents.length !== s.students.length && (
                    <p className="text-xs text-muted-foreground text-right">
                        {s.students.length} Schüler insgesamt
                    </p>
                )}
            </div>
        </div>
    );
}
