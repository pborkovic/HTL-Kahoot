import { UsersRound, Hash, Clock } from "lucide-react";

/**
 * Interface for the StatusCard component props.
 */
interface StatusInfo {
    /** The code of the current game session. */
    gameCode: string;
    /** The nickname of the current player. */
    nickname: string;
    /** The total number of players in the lobby. */
    playerCount: number;
    /** How long the player has been waiting. */
    waitingSince: string;
}

/**
 * StatusCard component for displaying game session status information.
 *
 * @param props - The component props.
 * @returns The StatusCard component.
 */
export function StatusCard({ gameCode, nickname, playerCount, waitingSince }: StatusInfo) {
    return (
        <div className="w-full rounded-xl bg-white/5 border border-white/10 p-4 sm:p-5 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">
                Status
            </h2>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/4 border border-white/8 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-white/40 mb-1">
                        <Hash className="size-3" />
                        <span className="text-[10px] uppercase tracking-wider font-medium">Game-PIN</span>
                    </div>
                    <p className="text-sm font-bold tabular-nums text-white">{gameCode}</p>
                </div>

                <div className="bg-white/4 border border-white/8 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-white/40 mb-1">
                        <UsersRound className="size-3" />
                        <span className="text-[10px] uppercase tracking-wider font-medium">Spieler</span>
                    </div>
                    <p className="text-sm font-bold tabular-nums text-white">{playerCount}</p>
                </div>

                <div className="bg-white/4 border border-white/8 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-white/40 mb-1">
                        <span className="text-xs">👤</span>
                        <span className="text-[10px] uppercase tracking-wider font-medium">Dein Name</span>
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{nickname}</p>
                </div>

                <div className="bg-white/4 border border-white/8 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-white/40 mb-1">
                        <Clock className="size-3" />
                        <span className="text-[10px] uppercase tracking-wider font-medium">Wartezeit</span>
                    </div>
                    <p className="text-sm font-bold tabular-nums text-white">{waitingSince}</p>
                </div>
            </div>
        </div>
    );
}
