import { UsersRound } from "lucide-react";
import { StudentFilters } from "./student-filters";
import { StudentTable } from "./student-table";
import type { UseStudentsReturn } from "@/hooks/use-students";

interface StudentsPanelProps {
    students: UseStudentsReturn;
}

export function StudentsPanel({ students: s }: StudentsPanelProps) {
    return (
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
            <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-md bg-foreground flex items-center justify-center">
                            <UsersRound className="size-3.5 text-primary-foreground" />
                        </div>
                        <h2 className="text-sm font-semibold text-foreground">Schüler</h2>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                        {s.selectedIds.size} von {s.displayStudents.length} ausgewählt
                    </span>
                </div>
            </div>

            <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
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
