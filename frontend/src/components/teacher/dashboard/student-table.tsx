import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="text-sm">Schüler werden geladen...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-16 text-destructive text-sm rounded-lg bg-destructive/5 border border-destructive/10">
                {error}
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <span className="text-sm">Keine Schüler gefunden</span>
                <span className="text-xs">Versuche andere Suchbegriffe oder Filter</span>
            </div>
        );
    }

    return (
        <div className="rounded-xl border overflow-hidden bg-card">
            <div className="max-h-[400px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/60 hover:bg-muted/60">
                            <TableHead className="w-10 pl-4">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={onToggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
                            <TableHead className="w-24 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Klasse</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">E-Mail</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map(s => {
                            const isSelected = selectedIds.has(s.id);
                            return (
                                <TableRow
                                    key={s.id}
                                    className={`transition-colors ${isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/40"}`}
                                >
                                    <TableCell className="pl-4">
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onToggleSelect(s.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {s.display_name ?? s.username ?? s.email}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        {s.class_name ? (
                                            <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0 text-xs font-medium">
                                                {s.class_name}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell truncate max-w-[200px]">
                                        {s.email}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
