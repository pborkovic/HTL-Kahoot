import { LayoutDashboard, Zap } from "lucide-react";

export function DashboardHeader() {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-foreground flex items-center justify-center">
                    <LayoutDashboard className="size-4.5 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">
                        Quiz erstellen
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Fragen und Teilnehmer auswählen, Einstellungen anpassen, Quiz starten.
                    </p>
                </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border/60 rounded-lg px-3 py-2">
                <Zap className="size-3 text-primary" />
                <span>GamQuiz</span>
            </div>
        </div>
    );
}
