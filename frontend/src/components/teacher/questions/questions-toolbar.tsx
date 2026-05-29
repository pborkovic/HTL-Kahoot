"use client";

import type { ChangeEvent, ReactNode } from "react";
import { Search, Filter, ArrowUpDown, ChevronDown, Upload, Building2 } from "lucide-react";
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
import { useDepartments } from "@/hooks/use-departments";

type SortField = "created_at" | "updated_at" | "type" | "department";
type SortDirection = "asc" | "desc";

/**
 * Props for the QuestionsToolbar component.
 */
interface QuestionsToolbarProps {
  /** The current search term for filtering questions. */
  searchTerm: string;
  /**
   * Callback function when the search term changes.
   * @param value - The new search term.
   */
  onSearchChange: (value: string) => void;
  /** List of unique question types available for filtering. */
  uniqueTypes: string[];
  /** Set of currently active question type filters. */
  activeFilters: Set<string>;
  /**
   * Callback function to toggle a specific question type filter.
   * @param type - The question type to toggle.
   */
  onToggleFilter: (type: string) => void;
  /** Set of currently active department-slug filters. */
  activeDepartments: Set<string>;
  /**
   * Callback function to toggle a department filter.
   * @param slug - The department slug to toggle.
   */
  onToggleDepartment: (slug: string) => void;
  /** Clears all active department filters. */
  onClearDepartments: () => void;
  /**
   * Callback function to sort the question list.
   * @param field - The field to sort by.
   * @param direction - The sort direction (asc or desc).
   */
  onSort: (field: SortField, direction: SortDirection) => void;
  /** The total count of questions available. */
  totalCount: number;
  /** The number of questions currently selected. */
  selectedCount: number;
  /** Callback function to open the mass management (import/export) dialog. */
  onOpenMassManagement: () => void;
}

/**
 * A toolbar component for managing questions.
 * 
 * Provides inputs for searching, type filtering, sorting, and access to mass
 * management features (import/export). Displays summary information about
 * selections and total counts.
 *
 * @param props - The component props.
 * @returns The rendered questions toolbar.
 */
export function QuestionsToolbar({
  searchTerm,
  onSearchChange,
  uniqueTypes,
  activeFilters,
  onToggleFilter,
  activeDepartments,
  onToggleDepartment,
  onClearDepartments,
  onSort,
  totalCount,
  selectedCount,
  onOpenMassManagement,
}: QuestionsToolbarProps): ReactNode {
  const { departments } = useDepartments();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`gap-1.5 h-8 text-xs rounded-lg backdrop-blur-sm bg-background/40 border-border/40 hover:border-primary/30 hover:bg-background/60 transition-all duration-200 cursor-pointer ${activeFilters.size > 0 ? "border-primary/40 bg-primary/5 text-primary" : ""}`}
            >
              <Filter className="size-3" />
              Typ
              {activeFilters.size > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-0.5 size-4 p-0 justify-center text-[10px] bg-primary/15 text-primary hover:bg-primary/15"
                >
                  {activeFilters.size}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-2.5 backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl" align="start">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
              Typ filtern
            </p>
            <div className="space-y-0.5 max-h-52 overflow-y-auto">
              {uniqueTypes.map(
                (type: string): ReactNode => (
                  <label
                    key={type}
                    className="flex items-center gap-2.5 cursor-pointer hover:bg-muted/40 p-2 rounded-lg transition-colors text-sm"
                  >
                    <Checkbox
                      checked={activeFilters.has(type)}
                      onCheckedChange={(): void => onToggleFilter(type)}
                    />
                    <span className="text-xs font-medium">{type}</span>
                  </label>
                )
              )}
              {uniqueTypes.length === 0 && (
                <p className="text-xs text-muted-foreground p-2">
                  Keine Typen verfügbar
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`gap-1.5 h-8 text-xs rounded-lg backdrop-blur-sm bg-background/40 border-border/40 hover:border-primary/30 hover:bg-background/60 transition-all duration-200 cursor-pointer ${activeDepartments.size > 0 ? "border-primary/40 bg-primary/5 text-primary" : ""}`}
            >
              <Building2 className="size-3" />
              Abteilung
              {activeDepartments.size > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-0.5 size-4 p-0 justify-center text-[10px] bg-primary/15 text-primary hover:bg-primary/15"
                >
                  {activeDepartments.size}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2.5 backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl" align="start">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-medium text-muted-foreground">
                Abteilung filtern
              </p>
              {activeDepartments.size > 0 && (
                <button
                  type="button"
                  onClick={onClearDepartments}
                  className="text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Zurücksetzen
                </button>
              )}
            </div>
            <div className="space-y-0.5 max-h-60 overflow-y-auto">
              {departments.map(
                (d): ReactNode => (
                  <label
                    key={d.id}
                    className="flex items-center gap-2.5 cursor-pointer hover:bg-muted/40 p-2 rounded-lg transition-colors text-sm"
                  >
                    <Checkbox
                      checked={activeDepartments.has(d.slug)}
                      onCheckedChange={(): void => onToggleDepartment(d.slug)}
                    />
                    <span className="text-xs font-medium">{d.name}</span>
                  </label>
                )
              )}
              {departments.length === 0 && (
                <p className="text-xs text-muted-foreground p-2">
                  Keine Abteilungen verfügbar
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs rounded-lg backdrop-blur-sm bg-background/40 border-border/40 hover:border-primary/30 hover:bg-background/60 transition-all duration-200 cursor-pointer">
              <ArrowUpDown className="size-3" />
              Sortieren
              <ChevronDown className="size-3 opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
            <DropdownMenuItem className="cursor-pointer" onClick={(): void => onSort("created_at", "desc")}>
              Neueste zuerst
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={(): void => onSort("created_at", "asc")}>
              Älteste zuerst
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={(): void => onSort("updated_at", "desc")}>
              Zuletzt bearbeitet
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={(): void => onSort("type", "asc")}>
              Typ A–Z
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={(): void => onSort("type", "desc")}>
              Typ Z–A
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={(): void => onSort("department", "asc")}>
              Abteilung A–Z
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={(): void => onSort("department", "desc")}>
              Abteilung Z–A
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 text-xs rounded-lg backdrop-blur-sm bg-background/40 border-border/40 hover:border-primary/30 hover:bg-background/60 transition-all duration-200 cursor-pointer"
          onClick={onOpenMassManagement}
        >
          <Upload className="size-3" />
          Import / Export
        </Button>

        <div className="flex-1 min-w-[140px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                onSearchChange(e.target.value)
              }
              placeholder="Fragen durchsuchen..."
              className="pl-8 h-8 text-xs rounded-lg bg-background/50 backdrop-blur-sm border-border/40 focus:border-primary/50 focus:ring-primary/30 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
        {selectedCount > 0 && (
          <span className="font-medium text-primary">
            {selectedCount} ausgewählt
          </span>
        )}
        <span className="tabular-nums backdrop-blur-sm bg-background/30 px-2.5 py-1 rounded-lg">{totalCount} Fragen</span>
      </div>
    </div>
  );
}
