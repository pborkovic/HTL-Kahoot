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

function DifficultyIndicator({ difficulty }: { difficulty: number }) {
    return (
        <div className="flex items-center gap-0.5 justify-center" title={`${difficulty}/5`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className={`size-1.5 rounded-full ${
                        i < difficulty
                            ? difficulty <= 2
                                ? "bg-emerald-500"
                                : difficulty <= 3
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                            : "bg-border/40"
                    }`}
                />
            ))}
        </div>
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
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="text-xs">Fragen werden geladen...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12 text-destructive text-xs rounded-xl backdrop-blur-sm bg-destructive/5 border border-destructive/15">
                {error}
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-1">
                <span className="text-xs">Keine Fragen gefunden</span>
                <span className="text-[11px] text-muted-foreground/70">Versuche andere Suchbegriffe oder Filter</span>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/30 max-h-[420px] overflow-auto backdrop-blur-sm bg-background/20">
                <Table>
                    <TableHeader className="sticky top-0 z-10">
                        <TableRow className="bg-muted/60 backdrop-blur-md hover:bg-muted/60 border-b border-border/30">
                            <TableHead className="w-10 pl-3">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={onToggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="w-20 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Typ</TableHead>
                            <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Frage</TableHead>
                            <TableHead className="w-16 text-[10px] font-medium uppercase tracking-widest text-muted-foreground text-center hidden sm:table-cell">Diff.</TableHead>
                            <TableHead className="w-20 text-[10px] font-medium uppercase tracking-widest text-muted-foreground text-center hidden sm:table-cell">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {questions.map(q => {
                            const isSelected = selectedIds.has(q.id);
                            return (
                                <TableRow
                                    key={q.id}
                                    className={`cursor-pointer transition-colors duration-150 border-b border-border/20 ${isSelected ? "bg-primary/[0.04] hover:bg-primary/[0.07]" : "hover:bg-primary/[0.03]"}`}
                                >
                                    <TableCell className="pl-3 py-3" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onToggleSelect(q.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="py-3" onClick={() => onViewDetail(q)}>
                                        <span className="text-[11px] font-medium text-muted-foreground">
                                            {q.type}
                                        </span>
                                    </TableCell>
                                    <TableCell
                                        className="text-xs font-medium truncate max-w-[200px] lg:max-w-none py-3"
                                        onClick={() => onViewDetail(q)}
                                    >
                                        {q.current_version?.title ?? "\u2014"}
                                    </TableCell>
                                    <TableCell className="text-center hidden sm:table-cell py-3" onClick={() => onViewDetail(q)}>
                                        {q.current_version?.difficulty != null
                                            ? <DifficultyIndicator difficulty={q.current_version.difficulty} />
                                            : <span className="text-muted-foreground text-xs">\u2014</span>
                                        }
                                    </TableCell>
                                    <TableCell className="text-center hidden sm:table-cell py-3" onClick={() => onViewDetail(q)}>
                                        {q.is_published ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium px-1.5 py-0">
                                                Live
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40 font-normal px-1.5 py-0">
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
    );
}
