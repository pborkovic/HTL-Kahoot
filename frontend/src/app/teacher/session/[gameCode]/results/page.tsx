"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trophy, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import StudentQuestionReview from "@/components/teacher/results/student-question-review";
import type { FinalResults, LeaderboardEntry } from "@/types/session";

export default function TeacherResults() {
    const { gameCode } = useParams<{ gameCode: string }>();
    const router = useRouter();

    const [results, setResults] = useState<FinalResults | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDetail, setShowDetail] = useState<string | null>(null);

    useEffect(() => {
        apiFetch<{ data: FinalResults }>(`/v1/sessions/${gameCode}/results`)
            .then((res) => setResults(res.data))
            .catch((err) => console.error("Failed to load results:", err))
            .finally(() => setIsLoading(false));
    }, [gameCode]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="size-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
            </div>
        );
    }

    if (!results) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Ergebnisse konnten nicht geladen werden.</p>
            </div>
        );
    }

    function handleShowDetail(participantId: string) {
        return () => {
            // Toggle logic: Wenn bereits offen, dann schließen (null setzen), sonst ID setzen
            setShowDetail(prev => prev === participantId ? null : participantId);
        };
    }

    return (
        <div className="flex-1">
            <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-8 mx-auto max-w-480">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-foreground flex items-center justify-center">
                        <Trophy className="size-4.5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            Ergebnisse
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {results.quiz_title}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold tabular-nums text-foreground">{results.total_questions}</p>
                        <p className="text-xs text-muted-foreground mt-1">Fragen</p>
                    </div>
                    <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold tabular-nums text-foreground">{results.total_participants}</p>
                        <p className="text-xs text-muted-foreground mt-1">Teilnehmer</p>
                    </div>
                    <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold tabular-nums text-foreground">
                            {results.leaderboard.length > 0 ? results.leaderboard[0].total_score.toLocaleString() : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Highscore</p>
                    </div>
                </div>

                {/* Podium for top 3 */}
                {results.leaderboard.length >= 3 && (
                    <div className="bg-card border border-border/60 rounded-xl p-4 sm:p-5">
                        <div className="flex items-end justify-center gap-3 h-40">
                            <PodiumPlace entry={results.leaderboard[1]} height="h-24" medal="text-gray-400" />
                            <PodiumPlace entry={results.leaderboard[0]} height="h-32" medal="text-amber-500" />
                            <PodiumPlace entry={results.leaderboard[2]} height="h-20" medal="text-amber-700" />
                        </div>
                    </div>
                )}

                {/* Full leaderboard */}
                <div className="bg-card border border-border/60 rounded-xl p-4 sm:p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Bestenliste</h3>

                    {results.leaderboard.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Keine Ergebnisse vorhanden.</p>
                    ) : (
                        <div className="space-y-1.5">
                            {results.leaderboard.map((entry: LeaderboardEntry) => (
                                <div key={entry.participant_id} className="flex flex-col bg-muted/20 rounded-lg overflow-hidden transition-colors">
                                    <div
                                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/30"
                                        onClick={handleShowDetail(entry.participant_id)}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className={`text-xs font-bold tabular-nums w-5 text-center ${
                                                entry.rank === 1 ? "text-amber-500" :
                                                    entry.rank === 2 ? "text-gray-400" :
                                                        entry.rank === 3 ? "text-amber-700" :
                                                            "text-muted-foreground"
                                            }`}>
                                                {entry.rank}
                                            </span>
                                            <span className="text-sm font-medium text-foreground">
                                                {entry.nickname}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold tabular-nums text-foreground">
                                            {entry.total_score.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Detail View inside the loop */}
                                    {showDetail === entry.participant_id && (
                                        <StudentQuestionReview entry={entry}/>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Back button */}
                <button
                    type="button"
                    onClick={() => router.push("/teacher")}
                    className="w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="size-4" />
                    Zurück zum Dashboard
                </button>
            </div>
        </div>
    );
}

function PodiumPlace({
                         entry,
                         height,
                         medal,
                     }: {
    entry: LeaderboardEntry;
    height: string;
    medal: string;
}) {
    return (
        <div className="flex flex-col items-center gap-2 w-24">
            <span className="text-xs font-medium text-foreground truncate max-w-full">
                {entry.nickname}
            </span>
            <span className="text-xs font-bold tabular-nums text-muted-foreground">
                {entry.total_score.toLocaleString()}
            </span>
            <div className={`w-full ${height} rounded-t-lg bg-muted/30 flex items-start justify-center pt-2`}>
                <span className={`text-lg font-bold ${medal}`}>{entry.rank}</span>
            </div>
        </div>
    );
}
