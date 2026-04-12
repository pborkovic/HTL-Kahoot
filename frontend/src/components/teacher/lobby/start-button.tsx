import { Play, Loader2 } from "lucide-react";

/**
 * Props for the StartButton component.
 */
interface StartButtonProps {
    /** The number of participants currently in the lobby. */
    participantCount: number;
    /** Whether the game is currently in the process of starting. */
    isStarting: boolean;
    /** Callback function to trigger the game start. */
    onStart: () => void;
}

/**
 * A button component used by teachers to start the game session.
 * 
 * It displays the current participant count and handles the loading state
 * while the game is starting. It is disabled if no participants have joined.
 *
 * @param props - The component props.
 * @returns The rendered start button panel.
 */
export function StartButton({ participantCount, isStarting, onStart }: StartButtonProps) {
    return (
        <div className="bg-card border border-border/60 rounded-xl p-4 sm:p-5 space-y-3">
            <button
                type="button"
                onClick={onStart}
                disabled={participantCount === 0 || isStarting}
                className="w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
            >
                {isStarting ? (
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        Spiel wird gestartet…
                    </>
                ) : (
                    <>
                        <Play className="size-4" fill="currentColor" />
                        Spiel starten
                    </>
                )}
            </button>

            {participantCount === 0 && !isStarting && (
                <p className="text-[11px] text-muted-foreground text-center">
                    Warte, bis mindestens ein Schüler beigetreten ist.
                </p>
            )}

            {participantCount > 0 && !isStarting && (
                <p className="text-[11px] text-muted-foreground text-center">
                    {participantCount} Schüler bereit — du kannst das Spiel jetzt starten.
                </p>
            )}
        </div>
    );
}
