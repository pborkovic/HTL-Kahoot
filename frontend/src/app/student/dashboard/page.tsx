"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Trophy,
    CheckCircle2,
    XCircle,
    MinusCircle,
    History,
    Loader2,
    LayoutDashboard,
    Target,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiError } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

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
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary motion-reduce:animate-none" />
                    <p className="text-sm text-muted-foreground">Lade Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 relative overflow-hidden">
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/15 blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse [animation-delay:3s]" />
            </div>

            <div className="relative flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-8 mx-auto max-w-[1920px]">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                        <LayoutDashboard className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-semibold tracking-tight text-foreground truncate">
                            Hallo, {displayName}
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {user.class_name
                                ? `Klasse ${user.class_name} • Übersicht deiner Quiz-Statistiken`
                                : "Übersicht deiner Quiz-Statistiken"}
                        </p>
                    </div>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="backdrop-blur-xl bg-destructive/10 border border-destructive/30 rounded-2xl shadow-xl shadow-destructive/5 px-4 sm:px-6 py-4"
                    >
                        <p className="text-sm text-destructive font-medium">{error}</p>
                    </div>
                )}

                {/* KPI cards */}
                <section
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
                    aria-label="Statistiken"
                >
                    <StatCard
                        label="Absolvierte Quizzes"
                        value={completedQuizzes}
                        icon={<Trophy className="size-3.5 text-primary" />}
                        isLoading={isLoading}
                    />
                    <StatCard
                        label="Gesamtpunkte"
                        value={totalScore}
                        icon={<Target className="size-3.5 text-primary" />}
                        isLoading={isLoading}
                    />
                    <StatCard
                        label="Richtige Antworten"
                        value={distribution?.total_correct ?? 0}
                        icon={<CheckCircle2 className="size-3.5 text-primary" />}
                        isLoading={isLoading || !distribution}
                        tone="success"
                    />
                    <StatCard
                        label="Falsche Antworten"
                        value={distribution?.total_wrong ?? 0}
                        icon={<XCircle className="size-3.5 text-primary" />}
                        isLoading={isLoading || !distribution}
                        tone="danger"
                    />
                </section>

                {/* Distribution panel */}
                <section className="backdrop-blur-xl bg-card/60 dark:bg-card/40 border border-primary/15 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
                    <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="size-7 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                                <Target className="size-3.5 text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold text-foreground">
                                Antwortverteilung
                            </h2>
                            {distribution && !isLoading && (
                                <span className="ml-auto text-xs tabular-nums text-muted-foreground backdrop-blur-sm bg-background/30 px-2.5 py-1 rounded-lg">
                                    {totalAnswered + distribution.total_unanswered} Fragen gesamt
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="px-4 sm:px-6 pb-5 sm:pb-6">
                        {isLoading || !distribution ? (
                            <div className="space-y-3">
                                <Skeleton className="h-3 w-full rounded-full" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-3 w-28" />
                                </div>
                            </div>
                        ) : totalAnswered + distribution.total_unanswered === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Noch keine Antworten vorhanden.
                            </p>
                        ) : (
                            <DistributionBar
                                correct={distribution.total_correct}
                                wrong={distribution.total_wrong}
                                unanswered={distribution.total_unanswered}
                                percentage={distribution.correct_percentage}
                            />
                        )}
                    </div>
                </section>

                {/* History panel */}
                <section className="backdrop-blur-xl bg-card/60 dark:bg-card/40 border border-primary/15 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
                    <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="size-7 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                                <History className="size-3.5 text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold text-foreground">
                                Quiz-Historie
                            </h2>
                            {!isLoading && history.length > 0 && (
                                <span className="ml-auto text-xs tabular-nums text-muted-foreground backdrop-blur-sm bg-background/30 px-2.5 py-1 rounded-lg">
                                    {history.length} {history.length === 1 ? "Quiz" : "Quizzes"}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="px-4 sm:px-6 pb-5 sm:pb-6">
                        {isLoading ? (
                            <div className="space-y-2" aria-label="Lade Historie">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="size-12 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center mb-3">
                                    <Trophy className="size-5 text-primary" aria-hidden="true" />
                                </div>
                                <p className="text-sm font-medium text-foreground">
                                    Noch keine Quizzes absolviert
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                                    Tritt einem Spiel bei, um deine Statistiken zu sehen.
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {history.map((item) => (
                                    <HistoryRow key={item.session_id} item={item} />
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

type StatCardProps = {
    label: string;
    value: number;
    icon: React.ReactNode;
    isLoading: boolean;
    tone?: "default" | "success" | "danger";
};

function StatCard({ label, value, icon, isLoading, tone = "default" }: StatCardProps) {
    const valueClasses = {
        default: "text-foreground",
        success: "text-emerald-600 dark:text-emerald-500",
        danger: "text-red-600 dark:text-red-500",
    }[tone];

    return (
        <div className="backdrop-blur-xl bg-card/60 dark:bg-card/40 border border-primary/15 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
            <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-4 sm:pb-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="size-7 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                        {icon}
                    </div>
                    <h3 className="text-xs font-medium text-muted-foreground">{label}</h3>
                </div>
                {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                ) : (
                    <p
                        className={`text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight ${valueClasses}`}
                    >
                        {value.toLocaleString("de-DE")}
                    </p>
                )}
            </div>
        </div>
    );
}

function HistoryRow({ item }: { item: QuizHistoryItem }) {
    const rate =
        item.total_questions > 0
            ? (item.correct_answers / item.total_questions) * 100
            : 0;

    return (
        <li>
            <div className="group flex flex-col md:flex-row md:items-center justify-between gap-3 border border-primary/15 bg-background/30 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-background/50 hover:border-primary/30 transition-colors duration-200">
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                        {item.quiz_title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(item.finished_at)}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                    <div
                        className="flex items-center gap-1 text-xs tabular-nums"
                        title={`${item.correct_answers} richtig`}
                    >
                        <CheckCircle2
                            className="size-3.5 text-emerald-500"
                            aria-hidden="true"
                        />
                        <span>{item.correct_answers}</span>
                    </div>
                    <div
                        className="flex items-center gap-1 text-xs tabular-nums"
                        title={`${item.wrong_answers} falsch`}
                    >
                        <XCircle className="size-3.5 text-red-500" aria-hidden="true" />
                        <span>{item.wrong_answers}</span>
                    </div>
                    <div
                        className="flex items-center gap-1 text-xs tabular-nums"
                        title={`${item.unanswered} unbeantwortet`}
                    >
                        <MinusCircle
                            className="size-3.5 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <span>{item.unanswered}</span>
                    </div>
                    <div
                        className="w-24 md:w-32 h-1.5 bg-background/60 rounded-full overflow-hidden border border-primary/10"
                        role="progressbar"
                        aria-valuenow={Math.round(rate)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Erfolgsquote ${rate.toFixed(0)}%`}
                    >
                        <div
                            className="h-full bg-primary transition-all duration-500 motion-reduce:transition-none"
                            style={{ width: `${rate}%` }}
                        />
                    </div>
                    <p className="text-xs font-semibold w-10 text-right tabular-nums text-foreground">
                        {rate.toFixed(0)}%
                    </p>
                    <span className="text-xs tabular-nums text-muted-foreground backdrop-blur-sm bg-background/30 px-2.5 py-1 rounded-lg border border-primary/10">
                        {item.total_score.toLocaleString("de-DE")} P
                    </span>
                </div>
            </div>
        </li>
    );
}

function DistributionBar({
    correct,
    wrong,
    unanswered,
    percentage,
}: {
    correct: number;
    wrong: number;
    unanswered: number;
    percentage: number;
}) {
    const total = correct + wrong + unanswered;
    if (total === 0) return null;

    const correctPct = (correct / total) * 100;
    const wrongPct = (wrong / total) * 100;
    const unansweredPct = (unanswered / total) * 100;

    return (
        <div className="space-y-4">
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                    {percentage.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Erfolgsquote</p>
            </div>
            <div
                className="flex h-2 w-full overflow-hidden rounded-full bg-background/60 border border-primary/10"
                role="img"
                aria-label={`Richtig ${correct}, Falsch ${wrong}, Unbeantwortet ${unanswered}`}
            >
                <div
                    className="bg-emerald-500 transition-all duration-500 motion-reduce:transition-none"
                    style={{ width: `${correctPct}%` }}
                    title={`Richtig: ${correct}`}
                />
                <div
                    className="bg-red-500 transition-all duration-500 motion-reduce:transition-none"
                    style={{ width: `${wrongPct}%` }}
                    title={`Falsch: ${wrong}`}
                />
                <div
                    className="bg-muted-foreground/40 transition-all duration-500 motion-reduce:transition-none"
                    style={{ width: `${unansweredPct}%` }}
                    title={`Unbeantwortet: ${unanswered}`}
                />
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
                <LegendItem
                    color="bg-emerald-500"
                    label="Richtig"
                    value={correct}
                    pct={correctPct}
                />
                <LegendItem
                    color="bg-red-500"
                    label="Falsch"
                    value={wrong}
                    pct={wrongPct}
                />
                <LegendItem
                    color="bg-muted-foreground/40"
                    label="Unbeantwortet"
                    value={unanswered}
                    pct={unansweredPct}
                />
            </div>
        </div>
    );
}

function LegendItem({
    color,
    label,
    value,
    pct,
}: {
    color: string;
    label: string;
    value: number;
    pct: number;
}) {
    return (
        <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${color}`} aria-hidden="true" />
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium tabular-nums text-foreground">{value}</span>
            <span className="text-muted-foreground tabular-nums">
                ({pct.toFixed(0)}%)
            </span>
        </div>
    );
}
