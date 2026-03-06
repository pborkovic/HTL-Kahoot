import { GraduationCap, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StudentFilters } from "./student-filters";
import { StudentTable } from "./student-table";
import type { UseStudentsReturn } from "@/hooks/use-students";

interface StudentsPanelProps {
    students: UseStudentsReturn;
}

export function StudentsPanel({ students: s }: StudentsPanelProps) {
    return (
        <Card className="overflow-hidden border-0 shadow-md py-0 gap-0">                {/* Green header */}
            {/* Green header */}
            <div className="bg-gradient-to-r from-primary to-primary-hover px-4 sm:px-6 py-3.5 sm:py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <GraduationCap className="size-4.5 text-white" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Schüler</h2>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium">
                        <UserCheck className="size-3.5" />
                        <span>
                            {s.selectedIds.size}/{s.displayStudents.length} ausgewählt
                        </span>
                    </div>
                </div>
            </div>

            <CardContent className="p-4 sm:p-5 space-y-4">
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
            </CardContent>
        </Card>
    );
}
