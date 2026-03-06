import { Zap } from "lucide-react";

export function DashboardHeader() {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Quiz erstellen
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Fragen und Teilnehmer auswählen, Einstellungen anpassen, Quiz starten.
                </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border/60 rounded-lg px-3 py-2">
                <Zap className="size-3.5 text-primary" />
                <span>GamQuiz Editor</span>
            </div>
        </div>
    );
}
