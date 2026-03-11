import { Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/types/session";

interface LeaderboardPanelProps {
    entries: LeaderboardEntry[];
    maxEntries?: number;
}

export function LeaderboardPanel({ entries, maxEntries = 5 }: LeaderboardPanelProps) {
    const visible = entries.slice(0, maxEntries);

    return (
        <div className="bg-card border border-border/60 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2.5 mb-3">
                <div className="size-7 rounded-md bg-foreground flex items-center justify-center">
                    <Trophy className="size-3.5 text-primary-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Bestenliste</h3>
            </div>
            {visible.length === 0 ? (
                <p className="text-xs text-muted-foreground">Noch keine Ergebnisse.</p>
            ) : (
                <div className="space-y-1.5">
                    {visible.map((entry) => (
                        <div
                            key={entry.participant_id}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20"
                        >
                            <div className="flex items-center gap-2.5">
                                <span className={`text-xs font-bold tabular-nums w-5 text-center ${
                                    entry.rank === 1 ? "text-amber-500" :
                                    entry.rank === 2 ? "text-gray-400" :
                                    entry.rank === 3 ? "text-amber-700" :
                                    "text-muted-foreground"
                                }`}>
                                    {entry.rank}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {entry.nickname}
                                </span>
                            </div>
                            <span className="text-sm font-bold tabular-nums text-foreground">
                                {entry.total_score.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
