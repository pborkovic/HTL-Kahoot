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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Quizze durchsuchen..."
                    className="pl-9 h-8 text-xs rounded-xl bg-background/50 backdrop-blur-sm border-border/40 focus:border-primary/50 focus:ring-primary/30 transition-all duration-200"
                />
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="h-8 px-2.5 rounded-lg backdrop-blur-sm bg-background/40 border border-border/40 text-[11px] font-medium flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-background/60 transition-all duration-200 cursor-pointer"
                    >
                        <ArrowUpDown className="size-3" />
                        Sortieren
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onSort("created_at", "desc")}>
                        Neueste zuerst
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onSort("created_at", "asc")}>
                        Älteste zuerst
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onSort("title", "asc")}>
                        A → Z
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onSort("title", "desc")}>
                        Z → A
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-[10px] tabular-nums text-muted-foreground whitespace-nowrap backdrop-blur-sm bg-background/30 px-2.5 py-1 rounded-lg">
                {totalCount} {totalCount === 1 ? "Quiz" : "Quizze"}
            </span>
        </div>
    );
}
