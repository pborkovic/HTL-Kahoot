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
import type { Question } from "@/types/question";

interface QuestionTableProps {
    questions: Question[];
    selectedIds: Set<string>;
    allSelected: boolean;
    loading: boolean;
    error: string | null;
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
    onViewDetail: (question: Question) => void;
}

function DifficultyBadge({ difficulty }: { difficulty: number }) {
    const variant = difficulty <= 2 ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
        difficulty <= 3 ? "bg-amber-100 text-amber-700 border-amber-200" :
            "bg-red-100 text-red-700 border-red-200";

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${variant}`}>
            {difficulty}/5
        </span>
    );
}

export function QuestionTable({
    questions,
    selectedIds,
    allSelected,
    loading,
    error,
    onToggleSelect,
    onToggleSelectAll,
    onViewDetail,
}: QuestionTableProps) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="text-sm">Fragen werden geladen...</span>
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

    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <span className="text-sm">Keine Fragen gefunden</span>
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
                            <TableHead className="w-24 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Typ</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frage</TableHead>
                            <TableHead className="w-16 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center hidden sm:table-cell">Diff.</TableHead>
                            <TableHead className="w-24 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center hidden sm:table-cell">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {questions.map(q => {
                            const isSelected = selectedIds.has(q.id);
                            return (
                                <TableRow
                                    key={q.id}
                                    className={`cursor-pointer transition-colors ${isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/40"}`}
                                >
                                    <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onToggleSelect(q.id)}
                                        />
                                    </TableCell>
                                    <TableCell onClick={() => onViewDetail(q)}>
                                        <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0 text-xs font-medium">
                                            {q.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell
                                        className="text-sm font-medium truncate max-w-[200px] lg:max-w-none"
                                        onClick={() => onViewDetail(q)}
                                    >
                                        {q.current_version?.title ?? "—"}
                                    </TableCell>
                                    <TableCell className="text-center hidden sm:table-cell" onClick={() => onViewDetail(q)}>
                                        {q.current_version?.difficulty != null
                                            ? <DifficultyBadge difficulty={q.current_version.difficulty} />
                                            : <span className="text-muted-foreground">—</span>
                                        }
                                    </TableCell>
                                    <TableCell className="text-center hidden sm:table-cell" onClick={() => onViewDetail(q)}>
                                        {q.is_published ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs">
                                                Live
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                                Entwurf
                                            </Badge>
                                        )}
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
