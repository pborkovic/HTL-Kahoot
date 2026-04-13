import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Props for the UserSearch component.
 */
interface UserSearchProps {
    /** The current search term. */
    searchTerm: string;
    /** Callback when the search term changes. */
    onSearchChange: (value: string) => void;
    /** The number of results found for the current search term. */
    resultCount: number;
    /** The total number of users. */
    totalCount: number;
}

/**
 * UserSearch component for filtering the user list.
 *
 * @param props - The component props.
 * @returns The UserSearch component.
 */
export function UserSearch({ searchTerm, onSearchChange, resultCount, totalCount }: UserSearchProps) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Nach Name, E-Mail oder Rolle suchen..."
                    className="pl-9 h-9 text-xs rounded-xl bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/30 transition-all duration-200"
                />
            </div>
            <span className="text-xs tabular-nums text-muted-foreground shrink-0 backdrop-blur-sm bg-background/30 px-2.5 py-1 rounded-lg">
                {resultCount} von {totalCount}
            </span>
        </div>
    );
}
