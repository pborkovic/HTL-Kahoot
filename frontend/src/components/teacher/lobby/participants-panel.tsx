import { UsersRound, Wifi, WifiOff, UserPlus } from "lucide-react";
import type { Participant } from "@/types/participant";

/**
 * Props for the ParticipantsPanel component.
 */
interface ParticipantsPanelProps {
    /** The list of participants who have joined the lobby. */
    participants: Participant[];
    /** The number of participants currently connected. */
    connectedCount: number;
}

/**
 * A panel that displays a list of participants who have joined the game lobby.
 * 
 * Shows each participant's nickname and their current connection status (online/offline).
 * Displays a placeholder message if no participants have joined yet.
 *
 * @param props - The component props.
 * @returns The rendered participants panel.
 */
export function ParticipantsPanel({ participants, connectedCount }: ParticipantsPanelProps) {
    return (
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-md bg-foreground flex items-center justify-center">
                            <UsersRound className="size-3.5 text-primary-foreground" />
                        </div>
                        <h2 className="text-sm font-semibold text-foreground">
                            Beigetretene Schüler
                        </h2>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                        {connectedCount} verbunden · {participants.length} gesamt
                    </span>
                </div>
            </div>

            <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex-1 overflow-y-auto">
                {participants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                        <UserPlus className="size-8 opacity-30" />
                        <span className="text-sm">
                            Noch keine Schüler beigetreten …
                        </span>
                        <span className="text-xs opacity-60">
                            Teile den Game-Code, damit Schüler joinen können.
                        </span>
                    </div>
                ) : (
                    <div className="rounded-lg border border-border/40 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/40 bg-muted/30">
                                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                                        #
                                    </th>
                                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                                        Nickname
                                    </th>
                                    <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((p, i) => (
                                    <tr
                                        key={p.id}
                                        className="border-b last:border-b-0 border-border/20 hover:bg-muted/20 transition-colors"
                                    >
                                        <td className="px-3 py-2.5 text-xs text-muted-foreground tabular-nums w-10">
                                            {i + 1}
                                        </td>
                                        <td className="px-3 py-2.5 font-medium text-foreground">
                                            {p.nickname}
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            {p.is_connected ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500">
                                                    <Wifi className="size-3" />
                                                    Verbunden
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs text-amber-500">
                                                    <WifiOff className="size-3" />
                                                    Getrennt
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
