import { LayoutDashboard } from "lucide-react";

interface DashboardHeaderProps {
    readonly quizTitle?: string | null;
}

export function DashboardHeader({ quizTitle }: DashboardHeaderProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-foreground flex items-center justify-center">
                <LayoutDashboard className="size-4.5 text-primary-foreground" />
            </div>
            <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                    {quizTitle ? quizTitle : "Quiz erstellen"}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {quizTitle
                        ? "Fragen und Teilnehmer anpassen, dann Quiz starten."
                        : "Fragen und Teilnehmer auswählen, Einstellungen anpassen, Quiz starten."}
                </p>
            </div>
        </div>
    );
}
