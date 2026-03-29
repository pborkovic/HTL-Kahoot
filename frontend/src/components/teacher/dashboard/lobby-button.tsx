import { Play, HelpCircle, Users, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LobbyButtonProps {
    canCreate: boolean;
    canSave: boolean;
    isCreating: boolean;
    isSaving: boolean;
    selectedQuestionsCount: number;
    selectedStudentsCount: number;
    onCreateLobby: () => void;
    onSaveQuiz: () => void;
    createError: string | null;
}

export function LobbyButton({
    canCreate,
    canSave,
    isCreating,
    isSaving,
    selectedQuestionsCount,
    selectedStudentsCount,
    onCreateLobby,
    onSaveQuiz,
    createError,
}: LobbyButtonProps) {
    const busy = isCreating || isSaving;

    return (
        <div className="bg-card border border-border/60 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex gap-2">
                <Button
                    size="lg"
                    onClick={onCreateLobby}
                    disabled={!canCreate || busy}
                    className="flex-1 h-11 text-sm font-semibold gap-2 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-35 rounded-lg"
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
                <Button
                    size="lg"
                    variant="outline"
                    onClick={onSaveQuiz}
                    disabled={!canSave || busy}
                    className="h-11 px-4 text-sm font-semibold gap-2 rounded-lg disabled:opacity-35"
                >
                    {isSaving ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <>
                            <Save className="size-4" />
                            Speichern
                        </>
                    )}
                </Button>
            </div>

            {canCreate && !busy && (
                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <HelpCircle className="size-3 text-foreground/50" />
                        {selectedQuestionsCount} Fragen
                    </span>
                    <span className="size-0.5 rounded-full bg-border" />
                    <span className="flex items-center gap-1">
                        <Users className="size-3 text-foreground/50" />
                        {selectedStudentsCount} Schüler
                    </span>
                </div>
            )}
            {!canCreate && !busy && (
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
