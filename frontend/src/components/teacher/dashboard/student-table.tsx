import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { StudentUser } from "@/types/student";

interface StudentTableProps {
    students: StudentUser[];
    selectedIds: Set<string>;
    allSelected: boolean;
    loading: boolean;
    error: string | null;
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
}

export function StudentTable({
    students,
    selectedIds,
    allSelected,
    loading,
    error,
    onToggleSelect,
    onToggleSelectAll,
}: StudentTableProps) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="text-xs">Schüler werden geladen...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12 text-destructive text-xs rounded-lg bg-destructive/5 border border-destructive/10">
                {error}
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-1">
                <span className="text-xs">Keine Schüler gefunden</span>
                <span className="text-[11px] text-muted-foreground/70">Versuche andere Suchbegriffe oder Filter</span>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border/60 max-h-[400px] overflow-auto">
                <Table>
                    <TableHeader className="sticky top-0 z-10">
                        <TableRow className="bg-muted hover:bg-muted border-b border-border/60">
                            <TableHead className="w-10 pl-3">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={onToggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Name</TableHead>
                            <TableHead className="w-20 text-[10px] font-medium uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Klasse</TableHead>
                            <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground hidden md:table-cell">E-Mail</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map(s => {
                            const isSelected = selectedIds.has(s.id);
                            return (
                                <TableRow
                                    key={s.id}
                                    className={`transition-colors ${isSelected ? "bg-primary/[0.04] hover:bg-primary/[0.07]" : "hover:bg-muted/30"}`}
                                >
                                    <TableCell className="pl-3 py-2.5">
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onToggleSelect(s.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-xs font-medium py-2.5">
                                        {s.display_name ?? s.username ?? s.email}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell py-2.5">
                                        {s.class_name ? (
                                            <span className="text-[11px] font-medium text-muted-foreground">
                                                {s.class_name}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground/50 text-xs">\u2014</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-[11px] text-muted-foreground hidden md:table-cell truncate max-w-[200px] py-2.5">
                                        {s.email}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
        </div>
    );
}
