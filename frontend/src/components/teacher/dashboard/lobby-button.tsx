import { PlayCircle, HelpCircle, Users, Loader2 } from "lucide-react";
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
        <div className="flex flex-col items-center gap-3">
            <Button
                size="lg"
                onClick={onCreateLobby}
                disabled={!canCreate || isCreating}
                className="w-full sm:w-auto min-w-[320px] h-14 text-base font-bold gap-3 shadow-lg bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 disabled:opacity-40 disabled:shadow-none rounded-xl"
            >
                {isCreating ? (
                    <>
                        <Loader2 className="size-5 animate-spin" />
                        Lobby wird erstellt...
                    </>
                ) : (
                    <>
                        <PlayCircle className="size-6" strokeWidth={2.5} />
                        Lobby eröffnen
                    </>
                )}
            </Button>
            {canCreate && !isCreating && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <HelpCircle className="size-3.5 text-primary" />
                        {selectedQuestionsCount} Fragen
                    </span>
                    <span className="text-border">|</span>
                    <span className="flex items-center gap-1.5">
                        <Users className="size-3.5 text-primary" />
                        {selectedStudentsCount} Schüler
                    </span>
                </div>
            )}
            {!canCreate && !isCreating && (
                <p className="text-xs text-muted-foreground">
                    Wähle mindestens eine Frage und einen Schüler aus
                </p>
            )}
            {createError && (
                <p className="text-xs text-destructive font-medium">
                    {createError}
                </p>
            )}
        </div>
    );
}
