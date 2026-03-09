import type { Participant } from "@/types/participant";

interface PlayerListProps {
    participants: Participant[];
    currentPlayerId: string;
}

export function PlayerList({ participants, currentPlayerId }: PlayerListProps) {
    return (
        <div className="w-full rounded-xl bg-white/5 border border-white/10 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Mitspieler
                </h2>
                <span className="text-xs tabular-nums text-white/40">
                    {participants.length} dabei
                </span>
            </div>

            <div className="flex flex-wrap gap-2">
                {participants.map((p) => (
                    <span
                        key={p.id}
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
                            p.id === currentPlayerId
                                ? "bg-primary text-text border-primary font-semibold"
                                : "bg-white/6 text-white/70 border-white/10"
                        }`}
                    >
                        <span className={`size-1.5 rounded-full ${p.isConnected ? "bg-emerald-400" : "bg-amber-400"}`} />
                        {p.nickname}
                        {p.id === currentPlayerId && <span className="text-[10px] opacity-70">(du)</span>}
                    </span>
                ))}
            </div>
        </div>
    );
}
