import { Search, ArrowUpDown, ChevronDown, School, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { StudentUser } from "@/types/student";

interface StudentFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    uniqueClasses: string[];
    selectedStudentIds: Set<string>;
    students: StudentUser[];
    onSort: (type: `${"display_name" | "class_name" | "email"}-${"asc" | "desc"}`) => void;
    onSelectWholeClass: (className: string) => void;
}

export function StudentFilters({
    searchTerm,
    onSearchChange,
    uniqueClasses,
    selectedStudentIds,
    students,
    onSort,
    onSelectWholeClass,
}: StudentFiltersProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs rounded-lg backdrop-blur-sm bg-background/40 border-border/40 hover:border-primary/30 hover:bg-background/60 transition-all duration-200 cursor-pointer">
                        <School className="size-3" />
                        <span className="hidden sm:inline">Klasse</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl" align="start">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5 px-2">Klasse auswählen</p>
                    <div className="space-y-0.5 max-h-52 overflow-y-auto">
                        {uniqueClasses.map(className => {
                            const classStudents = students.filter(s => s.class_name === className);
                            const allSelected = classStudents.length > 0 && classStudents.every(s => selectedStudentIds.has(s.id));
                            return (
                                <button
                                    type="button"
                                    key={className}
                                    onClick={() => onSelectWholeClass(className)}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex justify-between items-center cursor-pointer ${
                                        allSelected ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-muted/40 border border-transparent"
                                    }`}
                                >
                                    <span className="flex items-center gap-1.5">
                                        {allSelected && <Check className="size-3" />}
                                        {className}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground tabular-nums">
                                        {classStudents.length}
                                    </span>
                                </button>
                            );
                        })}
                        {uniqueClasses.length === 0 && (
                            <p className="text-xs text-muted-foreground p-2">Keine Klassen verfügbar</p>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs rounded-lg backdrop-blur-sm bg-background/40 border-border/40 hover:border-primary/30 hover:bg-background/60 transition-all duration-200 cursor-pointer">
                        <ArrowUpDown className="size-3" />
                        <span className="hidden sm:inline">Sortieren</span>
                        <ChevronDown className="size-3 opacity-40" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onSort("display_name-asc")}>Name A-Z</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onSort("display_name-desc")}>Name Z-A</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onSort("class_name-asc")}>Klasse A-Z</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onSort("class_name-desc")}>Klasse Z-A</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onSort("email-asc")}>E-Mail A-Z</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onSort("email-desc")}>E-Mail Z-A</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex-1 min-w-[120px]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Schüler suchen..."
                        className="pl-8 h-8 text-xs rounded-lg bg-background/50 backdrop-blur-sm border-border/40 focus:border-primary/50 focus:ring-primary/30 transition-all duration-200"
                    />
                </div>
            </div>
        </div>
    );
}
