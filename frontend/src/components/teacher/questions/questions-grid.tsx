"use client";

import type { ReactNode } from "react";
import { Loader2, Eye } from "lucide-react";
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

interface QuestionsGridProps {
  questions: Question[];
  selectedIds: Set<string>;
  allSelected: boolean;
  loading: boolean;
  error: string | null;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewDetail: (question: Question) => void;
}

function DifficultyDots({ difficulty }: { difficulty: number }): ReactNode {
  return (
    <div
      className="flex items-center gap-0.5 justify-center"
      title={`${difficulty}/5`}
    >
      {Array.from({ length: 5 }).map(
        (_: unknown, i: number): ReactNode => (
          <div
            key={i}
            className={`size-1.5 rounded-full ${
              i < difficulty
                ? difficulty <= 2
                  ? "bg-emerald-500"
                  : difficulty <= 3
                    ? "bg-amber-500"
                    : "bg-red-500"
                : "bg-border"
            }`}
          />
        )
      )}
    </div>
  );
}

export function QuestionsGrid({
  questions,
  selectedIds,
  allSelected,
  loading,
  error,
  onToggleSelect,
  onToggleSelectAll,
  onViewDetail,
}: QuestionsGridProps): ReactNode {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="text-xs">Fragen werden geladen...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-destructive text-xs rounded-lg bg-destructive/5 border border-destructive/10">
        {error}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-1">
        <span className="text-sm font-medium">Keine Fragen gefunden</span>
        <span className="text-xs text-muted-foreground/70">
          Versuche andere Suchbegriffe oder Filter
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/60 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 z-10">
          <TableRow className="bg-muted hover:bg-muted border-b border-border/60">
            <TableHead className="w-10 pl-3">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleSelectAll}
              />
            </TableHead>
            <TableHead className="w-24 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Typ
            </TableHead>
            <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Frage
            </TableHead>
            <TableHead className="w-20 text-[10px] font-medium uppercase tracking-widest text-muted-foreground text-center hidden md:table-cell">
              Diff.
            </TableHead>
            <TableHead className="w-20 text-[10px] font-medium uppercase tracking-widest text-muted-foreground text-center hidden md:table-cell">
              Punkte
            </TableHead>
            <TableHead className="w-20 text-[10px] font-medium uppercase tracking-widest text-muted-foreground text-center hidden sm:table-cell">
              Status
            </TableHead>
            <TableHead className="w-24 text-[10px] font-medium uppercase tracking-widest text-muted-foreground text-center hidden lg:table-cell">
              Erstellt
            </TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map(
            (q: Question): ReactNode => {
              const isSelected: boolean = selectedIds.has(q.id);
              const version = q.current_version;
              return (
                <TableRow
                  key={q.id}
                  onDoubleClick={(): void => onViewDetail(q)}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-primary/[0.04] hover:bg-primary/[0.07]"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <TableCell
                    className="pl-3 py-2.5"
                    onClick={(e: React.MouseEvent): void => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(): void => onToggleSelect(q.id)}
                    />
                  </TableCell>
                  <TableCell className="py-2.5">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium border-border/60 text-muted-foreground"
                    >
                      {q.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-medium truncate max-w-[250px] xl:max-w-none py-2.5">
                    {version?.title ?? "\u2014"}
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell py-2.5">
                    {version?.difficulty != null ? (
                      <DifficultyDots difficulty={version.difficulty} />
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        \u2014
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell py-2.5">
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {version?.default_points ?? "\u2014"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell py-2.5">
                    {q.is_published ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-0 text-[10px] font-medium px-1.5 py-0">
                        Live
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] text-muted-foreground border-border/60 font-normal px-1.5 py-0"
                      >
                        Entwurf
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center hidden lg:table-cell py-2.5">
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {new Date(q.created_at).toLocaleDateString("de-AT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <button
                      type="button"
                      onClick={(): void => onViewDetail(q)}
                      className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Eye className="size-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            }
          )}
        </TableBody>
      </Table>
    </div>
  );
}
