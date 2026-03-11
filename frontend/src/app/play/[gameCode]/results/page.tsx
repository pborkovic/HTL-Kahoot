"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Trophy } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { FinalResults, LeaderboardEntry } from "@/types/session";

export default function StudentResults() {
    const { gameCode } = useParams<{ gameCode: string }>();
    const [results, setResults] = useState<FinalResults | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiFetch<{ data: FinalResults }>(`/v1/sessions/${gameCode}/results`)
            .then((res) => setResults(res.data))
            .catch((err) => console.error("Failed to load results:", err))
            .finally(() => setIsLoading(false));
    }, [gameCode]);

    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        const prev = {
            htmlBg: html.style.backgroundColor,
            bodyBg: body.style.backgroundColor,
        };
        html.style.backgroundColor = "#2D3436";
        body.style.backgroundColor = "#2D3436";
        return () => {
            html.style.backgroundColor = prev.htmlBg;
            body.style.backgroundColor = prev.bodyBg;
        };
    }, []);

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3436]">
                <div className="size-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (!results) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3436]">
                <p className="text-white/60 text-sm">Ergebnisse konnten nicht geladen werden.</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center bg-[#2D3436] overflow-y-auto">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-primary/4 blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-lg px-6 py-10 sm:py-14 flex flex-col items-center gap-6">
                {/* Header */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="size-14 rounded-2xl bg-amber-500/15 flex items-center justify-center">
                        <Trophy className="size-7 text-amber-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Spiel beendet!</h1>
                    <p className="text-sm text-white/50">{results.quiz_title}</p>
                </div>

                {/* Stats */}
                <div className="w-full grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center">
                        <p className="text-2xl font-bold tabular-nums text-white">{results.total_questions}</p>
                        <p className="text-xs text-white/40 mt-0.5">Fragen</p>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center">
                        <p className="text-2xl font-bold tabular-nums text-white">{results.total_participants}</p>
                        <p className="text-xs text-white/40 mt-0.5">Teilnehmer</p>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="w-full rounded-xl bg-white/5 border border-white/10 p-4 sm:p-5 space-y-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Bestenliste
                    </h2>

                    {results.leaderboard.length === 0 ? (
                        <p className="text-xs text-white/40">Noch keine Ergebnisse.</p>
                    ) : (
                        <div className="space-y-1.5">
                            {results.leaderboard.map((entry: LeaderboardEntry) => (
                                <div
                                    key={entry.participant_id}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/4"
                                >
                                    <div className="flex items-center gap-3">
                                        <RankBadge rank={entry.rank} />
                                        <span className="text-sm font-medium text-white">
                                            {entry.nickname}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold tabular-nums text-white">
                                        {entry.total_score.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function RankBadge({ rank }: { rank: number }) {
    const colors =
        rank === 1
            ? "bg-amber-500/20 text-amber-400"
            : rank === 2
              ? "bg-gray-400/20 text-gray-300"
              : rank === 3
                ? "bg-amber-700/20 text-amber-600"
                : "bg-white/5 text-white/50";

    return (
        <span className={`size-7 rounded-md flex items-center justify-center text-xs font-bold tabular-nums ${colors}`}>
            {rank}
        </span>
    );
}
