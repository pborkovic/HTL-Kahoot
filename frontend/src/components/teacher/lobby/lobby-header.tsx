import { MonitorPlay } from "lucide-react";

export function LobbyHeader() {
    return (
        <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-foreground flex items-center justify-center">
                <MonitorPlay className="size-4.5 text-primary-foreground" />
            </div>
            <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                    Lobby
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Warte auf Schüler — starte das Spiel, sobald alle bereit sind.
                </p>
            </div>
        </div>
    );
}
