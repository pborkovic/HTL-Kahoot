import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortDirection = "asc" | "desc";
type QuizSortField = "created_at" | "title" | "is_published";

interface QuizToolbarProps {
    readonly searchTerm: string;
    readonly onSearchChange: (value: string) => void;
    readonly onSort: (field: QuizSortField, direction: SortDirection) => void;
    readonly totalCount: number;
}

export function QuizToolbar({ searchTerm, onSearchChange, onSort, totalCount }: QuizToolbarProps) {
    return (
        <div className="flex items-center gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Quizze durchsuchen..."
                    className="pl-8 h-8 text-xs"
                />
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="h-8 px-2.5 rounded-md border border-border/60 text-[11px] font-medium flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowUpDown className="size-3" />
                        Sortieren
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSort("created_at", "desc")}>
                        Neueste zuerst
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSort("created_at", "asc")}>
                        Älteste zuerst
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSort("title", "asc")}>
                        A → Z
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSort("title", "desc")}>
                        Z → A
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-[10px] tabular-nums text-muted-foreground whitespace-nowrap">
                {totalCount} {totalCount === 1 ? "Quiz" : "Quizze"}
            </span>
        </div>
    );
}
