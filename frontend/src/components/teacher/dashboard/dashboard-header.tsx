import { FileText } from "lucide-react";

export function DashboardHeader() {
    return (
        <div>
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="size-11 sm:size-13 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
                    <FileText className="size-5 sm:size-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        Quiz Editor
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Fragen auswählen, Teilnehmer zuweisen und Quiz starten
                    </p>
                </div>
            </div>
        </div>
    );
}
