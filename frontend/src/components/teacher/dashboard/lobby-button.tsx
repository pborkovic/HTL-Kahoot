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
        <div className="backdrop-blur-xl bg-card/60 dark:bg-card/40 border border-primary/15 rounded-2xl shadow-xl shadow-primary/5 p-4 sm:p-5 space-y-3">
            <div className="flex gap-2">
                <Button
                    size="lg"
                    onClick={onCreateLobby}
                    disabled={!canCreate || busy}
                    className="flex-1 h-11 text-sm font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary-hover transition-all duration-200 disabled:opacity-35 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 cursor-pointer"
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
                    className="h-11 px-4 text-sm font-semibold gap-2 rounded-xl disabled:opacity-35 backdrop-blur-sm bg-background/40 border-border/40 hover:border-primary/30 hover:bg-background/60 transition-all duration-200 cursor-pointer"
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
                        <HelpCircle className="size-3 text-primary/50" />
                        {selectedQuestionsCount} Fragen
                    </span>
                    <span className="size-0.5 rounded-full bg-border/40" />
                    <span className="flex items-center gap-1">
                        <Users className="size-3 text-primary/50" />
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
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                    <p className="text-[11px] text-destructive font-medium text-center">
                        {createError}
                    </p>
                </div>
            )}
        </div>
    );
}
