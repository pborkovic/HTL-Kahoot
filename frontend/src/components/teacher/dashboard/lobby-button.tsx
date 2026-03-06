import { Play, HelpCircle, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LobbyButtonProps {
    canCreate: boolean;
    isCreating: boolean;
    selectedQuestionsCount: number;
    selectedStudentsCount: number;
    onCreateLobby: () => void;
    createError: string | null;
}

export function LobbyButton({
    canCreate,
    isCreating,
    selectedQuestionsCount,
    selectedStudentsCount,
    onCreateLobby,
    createError,
}: LobbyButtonProps) {
    return (
        <div className="bg-card border border-border/60 rounded-xl p-4 sm:p-5 space-y-3">
            <Button
                size="lg"
                onClick={onCreateLobby}
                disabled={!canCreate || isCreating}
                className="w-full h-11 text-sm font-semibold gap-2 bg-primary hover:bg-primary-hover transition-colors disabled:opacity-35 rounded-lg"
            >
                {isCreating ? (
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        Lobby wird erstellt...
                    </>
                ) : (
                    <>
                        <Play className="size-4" fill="currentColor" />
                        Lobby eröffnen
                    </>
                )}
            </Button>

            {canCreate && !isCreating && (
                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <HelpCircle className="size-3 text-primary/60" />
                        {selectedQuestionsCount} Fragen
                    </span>
                    <span className="size-0.5 rounded-full bg-border" />
                    <span className="flex items-center gap-1">
                        <Users className="size-3 text-primary/60" />
                        {selectedStudentsCount} Schüler
                    </span>
                </div>
            )}
            {!canCreate && !isCreating && (
                <p className="text-[11px] text-muted-foreground text-center">
                    Wähle mindestens eine Frage und einen Schüler aus
                </p>
            )}
            {createError && (
                <p className="text-[11px] text-destructive font-medium text-center">
                    {createError}
                </p>
            )}
        </div>
    );
}
