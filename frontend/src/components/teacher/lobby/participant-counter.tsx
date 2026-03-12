interface ParticipantCounterProps {
    total: number;
    connectedCount: number;
}

export function ParticipantCounter({ total, connectedCount }: ParticipantCounterProps) {
    return (
        <div className="bg-card border border-border/60 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Teilnehmer</span>
                <span className="text-2xl font-bold tabular-nums text-foreground">
                    {total}
                </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{
                        width: `${Math.min((connectedCount / Math.max(total, 1)) * 100, 100)}%`,
                    }}
                />
            </div>
            <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground">
                    {connectedCount} verbunden
                </span>
                <span className="text-[10px] text-muted-foreground">
                    {total - connectedCount} getrennt
                </span>
            </div>
        </div>
    );
}
