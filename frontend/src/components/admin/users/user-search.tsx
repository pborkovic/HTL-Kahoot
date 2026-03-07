import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserSearchProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    resultCount: number;
    totalCount: number;
}

export function UserSearch({ searchTerm, onSearchChange, resultCount, totalCount }: UserSearchProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Nach Name, E-Mail, ID oder Rolle suchen..."
                    className="pl-8 h-9 text-xs"
                />
            </div>
            <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                {resultCount} von {totalCount}
            </span>
        </div>
    );
}
