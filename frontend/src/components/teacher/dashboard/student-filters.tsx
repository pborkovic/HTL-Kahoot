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
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                        <School className="size-3" />
                        <span className="hidden sm:inline">Klasse</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="start">
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
                                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex justify-between items-center ${
                                        allSelected ? "bg-primary/8 text-primary" : "hover:bg-muted/60"
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
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                        <ArrowUpDown className="size-3" />
                        <span className="hidden sm:inline">Sortieren</span>
                        <ChevronDown className="size-3 opacity-40" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => onSort("display_name-asc")}>Name A-Z</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSort("display_name-desc")}>Name Z-A</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSort("class_name-asc")}>Klasse A-Z</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSort("class_name-desc")}>Klasse Z-A</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSort("email-asc")}>E-Mail A-Z</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSort("email-desc")}>E-Mail Z-A</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex-1 min-w-[120px]">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Schüler suchen..."
                        className="pl-8 h-8 text-xs"
                    />
                </div>
            </div>
        </div>
    );
}
