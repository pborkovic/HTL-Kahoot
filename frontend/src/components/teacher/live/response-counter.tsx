import { Users } from "lucide-react";

/**
 * Props for the ResponseCounter component.
 */
interface ResponseCounterProps {
    /** The number of responses received so far. */
    totalResponses: number;
    /** The total number of participants in the session. */
    totalParticipants: number;
}

/**
 * A component that displays the progress of responses in a live game session.
 * 
 * Shows a numerical count and a progress bar indicating how many participants
 * have submitted their answers.
 *
 * @param props - The component props.
 * @returns The rendered response counter.
 */
export function ResponseCounter({ totalResponses, totalParticipants }: ResponseCounterProps) {
    const fraction = totalParticipants > 0 ? totalResponses / totalParticipants : 0;

    return (
        <div className="bg-card border border-border/60 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2.5 mb-3">
                <div className="size-7 rounded-md bg-foreground flex items-center justify-center">
                    <Users className="size-3.5 text-primary-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Antworten</h3>
            </div>
            <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold tabular-nums text-foreground">
                    {totalResponses}
                </span>
                <span className="text-sm text-muted-foreground">
                    von {totalParticipants}
                </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${fraction * 100}%` }}
                />
            </div>
        </div>
    );
}
