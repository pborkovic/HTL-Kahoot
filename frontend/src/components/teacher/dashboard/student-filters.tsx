import { Search, ArrowUpDown, ChevronDown, School, CheckCircle } from "lucide-react";
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
    onSort: (type: string) => void;
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
            {/* Class quick select */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary-hover">
                        <School className="size-3.5" />
                        <span className="hidden sm:inline">Klasse</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-2" align="start">
                    <p className="text-sm font-semibold mb-2 px-2 text-foreground">Klasse auswählen</p>
                    <div className="space-y-0.5 max-h-52 overflow-y-auto">
                        {uniqueClasses.map(className => {
                            const classStudents = students.filter(s => s.class_name === className);
                            const allSelected = classStudents.length > 0 && classStudents.every(s => selectedStudentIds.has(s.id));
                            return (
                                <button
                                    type="button"
                                    key={className}
                                    onClick={() => onSelectWholeClass(className)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${
                                        allSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                    }`}
                                >
                                    <span className="flex items-center gap-1.5">
                                        {allSelected && <CheckCircle className="size-3.5" />}
                                        {className}
                                    </span>
                                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
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

            {/* Sort */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                        <ArrowUpDown className="size-3.5" />
                        <span className="hidden sm:inline">Sortieren</span>
                        <ChevronDown className="size-3 opacity-50" />
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

            {/* Search */}
            <div className="flex-1 min-w-[120px]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Schüler suchen..."
                        className="pl-9 h-8 text-sm"
                    />
                </div>
            </div>
        </div>
    );
}
