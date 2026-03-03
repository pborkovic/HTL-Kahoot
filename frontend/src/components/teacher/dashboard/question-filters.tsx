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
                        variant={activeFilters.size > 0 ? "default" : "outline"}
                        size="sm"
                        className={`gap-1.5 ${activeFilters.size > 0 ? "bg-primary hover:bg-primary-hover" : ""}`}
                    >
                        <Filter className="size-3.5" />
                        <span className="hidden sm:inline">Filtern</span>
                        {activeFilters.size > 0 && (
                            <Badge variant="secondary" className="ml-0.5 size-5 p-0 justify-center text-xs bg-white/20 text-white hover:bg-white/20">
                                {activeFilters.size}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3" align="start">
                    <p className="text-sm font-semibold mb-2.5 text-foreground">Filter nach Typ</p>
                    <div className="space-y-1 max-h-52 overflow-y-auto">
                        {uniqueTypes.map(type => (
                            <label
                                key={type}
                                className="flex items-center gap-2.5 cursor-pointer hover:bg-primary/5 p-2 rounded-lg transition-colors text-sm"
                            >
                                <Checkbox
                                    checked={activeFilters.has(type)}
                                    onCheckedChange={() => onToggleFilter(type)}
                                />
                                <span className="font-medium">{type}</span>
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
                    <Button variant="outline" size="sm" className="gap-1.5">
                        <ArrowUpDown className="size-3.5" />
                        <span className="hidden sm:inline">Sortieren</span>
                        <ChevronDown className="size-3 opacity-50" />
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Suchen..."
                        className="pl-9 h-8 text-sm"
                    />
                </div>
            </div>
        </div>
    );
}
