"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy, CheckCircle2, XCircle, MinusCircle, History, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CompletedQuizzesData = {
    completed_quizzes: number;
};

type AnswerDistributionData = {
    total_correct: number;
    total_wrong: number;
    total_unanswered: number;
    correct_percentage: number;
};

type QuizHistoryItem = {
    session_id: string;
    quiz_id: string;
    quiz_title: string;
    total_questions: number;
    correct_answers: number;
    wrong_answers: number;
    unanswered: number;
    total_score: number;
    finished_at: string | null;
};

const formatDate = (value: string | null): string => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleString("de-DE", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    } catch {
        return value;
    }
};

export default function StudentDashboardPage() {
    const { user } = useAuth();

    const [completedQuizzes, setCompletedQuizzes] = useState<number>(0);
    const [distribution, setDistribution] = useState<AnswerDistributionData | null>(null);
    const [history, setHistory] = useState<QuizHistoryItem[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        const fetchAll = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [completedRes, distributionRes, historyRes] = await Promise.all([
                    apiFetch<{ data: CompletedQuizzesData }>(
                        `/v1/users/${user.id}/completed-quizzes`,
                        { method: "GET" },
                    ),
                    apiFetch<{ data: AnswerDistributionData }>(
                        `/v1/users/${user.id}/answer-distribution`,
                        { method: "GET" },
                    ),
                    apiFetch<{ data: QuizHistoryItem[] }>(
                        `/v1/users/${user.id}/quiz-history`,
                        { method: "GET" },
                    ),
                ]);

                setCompletedQuizzes(completedRes.data?.completed_quizzes ?? 0);
                setDistribution(distributionRes.data ?? null);
                setHistory(historyRes.data ?? []);
            } catch (err) {
                if (err instanceof ApiError && err.status === 401) {
                    setError("Du bist nicht angemeldet. Bitte melde dich erneut an.");
                } else if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Die Statistiken konnten nicht geladen werden.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAll();
    }, [user?.id]);

    const totalAnswered = useMemo(
        () => (distribution ? distribution.total_correct + distribution.total_wrong : 0),
        [distribution],
    );

    const totalScore = useMemo(
        () => history.reduce((sum, item) => sum + (item.total_score ?? 0), 0),
        [history],
    );

    const displayName = user?.display_name || user?.username || user?.email || "Student";

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Lade...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground px-4 md:px-6 py-6 md:py-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Mein Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Willkommen zurück, {displayName}
                        </p>
                    </div>
                    {user.class_name && (
                        <Badge variant="secondary" className="self-start md:self-auto">
                            Klasse: {user.class_name}
                        </Badge>
                    )}
                </header>

                {error && (
                    <Card className="border-destructive/40 bg-destructive/5">
                        <CardContent className="pt-6">
                            <p className="text-sm text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                )}

                <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Absolvierte Quizzes
                            </CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {isLoading ? "..." : completedQuizzes}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Richtige Antworten
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                                {isLoading || !distribution ? "..." : distribution.total_correct}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Falsche Antworten
                            </CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-500">
                                {isLoading || !distribution ? "..." : distribution.total_wrong}
                            </p>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Antwortverteilung</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading || !distribution ? (
                                <p className="text-sm text-muted-foreground">Lade...</p>
                            ) : totalAnswered + distribution.total_unanswered === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Noch keine Antworten vorhanden.
                                </p>
                            ) : (
                                <DistributionBar
                                    correct={distribution.total_correct}
                                    wrong={distribution.total_wrong}
                                    unanswered={distribution.total_unanswered}
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Gesamtpunkte</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">
                                {isLoading ? "..." : totalScore.toLocaleString("de-DE")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Aus allen Quizzes summiert
                            </p>
                        </CardContent>
                    </Card>
                </section>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                        <History className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-base">Quiz-Historie</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p className="text-sm text-muted-foreground">Lade Historie...</p>
                        ) : history.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Noch keine Quizzes absolviert. Tritt einem Spiel bei, um loszulegen.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {history.map((item) => {
                                    const rate =
                                        item.total_questions > 0
                                            ? (item.correct_answers / item.total_questions) * 100
                                            : 0;
                                    return (
                                        <div
                                            key={item.session_id}
                                            className="flex flex-col md:flex-row md:items-center justify-between gap-3 border border-border/60 rounded-lg px-4 py-3 bg-background/50"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">
                                                    {item.quiz_title}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {formatDate(item.finished_at)}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 md:gap-4">
                                                <div className="flex items-center gap-1 text-xs">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span>{item.correct_answers}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs">
                                                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                                                    <span>{item.wrong_answers}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs">
                                                    <MinusCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>{item.unanswered}</span>
                                                </div>
                                                <div className="w-24 md:w-32 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all"
                                                        style={{ width: `${rate}%` }}
                                                    />
                                                </div>
                                                <p className="text-sm font-semibold w-12 text-right">
                                                    {rate.toFixed(0)}%
                                                </p>
                                                <Badge variant="outline" className="font-mono">
                                                    {item.total_score.toLocaleString("de-DE")} P
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DistributionBar({
    correct,
    wrong,
    unanswered,
}: {
    correct: number;
    wrong: number;
    unanswered: number;
}) {
    const total = correct + wrong + unanswered;
    if (total === 0) return null;

    const correctPct = (correct / total) * 100;
    const wrongPct = (wrong / total) * 100;
    const unansweredPct = (unanswered / total) * 100;

    return (
        <div className="space-y-3">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className="bg-emerald-500 transition-all"
                    style={{ width: `${correctPct}%` }}
                    title={`Richtig: ${correct}`}
                />
                <div
                    className="bg-red-500 transition-all"
                    style={{ width: `${wrongPct}%` }}
                    title={`Falsch: ${wrong}`}
                />
                <div
                    className="bg-muted-foreground/40 transition-all"
                    style={{ width: `${unansweredPct}%` }}
                    title={`Unbeantwortet: ${unanswered}`}
                />
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Richtig</span>
                    <span className="font-medium">{correct}</span>
                    <span className="text-muted-foreground">({correctPct.toFixed(0)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">Falsch</span>
                    <span className="font-medium">{wrong}</span>
                    <span className="text-muted-foreground">({wrongPct.toFixed(0)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                    <span className="text-muted-foreground">Unbeantwortet</span>
                    <span className="font-medium">{unanswered}</span>
                    <span className="text-muted-foreground">({unansweredPct.toFixed(0)}%)</span>
                </div>
            </div>
        </div>
    );
}
