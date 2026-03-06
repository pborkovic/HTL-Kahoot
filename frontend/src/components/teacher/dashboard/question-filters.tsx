import { Search, Filter, ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuestionFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    uniqueTypes: string[];
    activeFilters: Set<string>;
    onToggleFilter: (type: string) => void;
    onSort: (field: "created_at" | "updated_at" | "type", direction: "asc" | "desc") => void;
}

export function QuestionFilters({
    searchTerm,
    onSearchChange,
    uniqueTypes,
    activeFilters,
    onToggleFilter,
    onSort,
}: QuestionFiltersProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={`gap-1.5 h-8 text-xs ${activeFilters.size > 0 ? "border-primary/40 bg-primary/5 text-primary" : ""}`}
                    >
                        <Filter className="size-3" />
                        <span className="hidden sm:inline">Filtern</span>
                        {activeFilters.size > 0 && (
                            <Badge variant="secondary" className="ml-0.5 size-4 p-0 justify-center text-[10px] bg-primary/15 text-primary hover:bg-primary/15">
                                {activeFilters.size}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-2.5" align="start">
                    <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Typ filtern</p>
                    <div className="space-y-0.5 max-h-52 overflow-y-auto">
                        {uniqueTypes.map(type => (
                            <label
                                key={type}
                                className="flex items-center gap-2.5 cursor-pointer hover:bg-muted/60 p-2 rounded-lg transition-colors text-sm"
                            >
                                <Checkbox
                                    checked={activeFilters.has(type)}
                                    onCheckedChange={() => onToggleFilter(type)}
                                />
                                <span className="text-xs font-medium">{type}</span>
                            </label>
                        ))}
                        {uniqueTypes.length === 0 && (
                            <p className="text-xs text-muted-foreground p-2">Keine Typen verfügbar</p>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                        <ArrowUpDown className="size-3" />
                        <span className="hidden sm:inline">Sortieren</span>
                        <ChevronDown className="size-3 opacity-40" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => onSort("created_at", "desc")}>Neueste zuerst</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSort("created_at", "asc")}>Älteste zuerst</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSort("type", "asc")}>Typ A-Z</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSort("type", "desc")}>Typ Z-A</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex-1 min-w-[120px]">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Suchen..."
                        className="pl-8 h-8 text-xs"
                    />
                </div>
            </div>
        </div>
    );
}
