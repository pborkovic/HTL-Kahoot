"use client";

import React, { useEffect, useMemo, useState, use } from "react";
import type { StudentUser } from "@/types/student";
import { apiFetch, ApiError } from "@/lib/api";

type CompletedQuizzesData = {
    completed_quizzes: number;
};

type AnswerDistributionData = {
    total_answers: number;
    correct_answers: number;
    correct_rate?: number;
};

type QuizHistoryItem = {
    id: string | number;
    title: string;
    correct_answers: number;
    total_questions: number;
    completed_at: string;
};

type QuizResult = {
    id: string;
    title: string;
    correctAnswers: number;
    totalQuestions: number;
    date: string;
};

type StudentDashboardProps = {
    params: Promise<{ id: string }>;
};

const StudentDashboard: React.FC<StudentDashboardProps> = ({ params }) => {
    const { id } = use(params);

    const getUserErrorMessage = (error: unknown): string => {
        if (error instanceof ApiError) {
            if (error.status === 401) return "Du bist nicht angemeldet. Bitte melde dich erneut an.";
            if (error.status === 403) return "Du hast keine Berechtigung, diesen Studenten anzuzeigen.";
            if (error.status === 404) return "Dieser Student wurde nicht gefunden.";
            if (error.status === 422) return "Die Student-ID ist ungueltig. Bitte pruefe den Link.";
            if (error.status === 429) return "Zu viele Anfragen. Bitte versuche es in einer Minute erneut.";
            if (error.status >= 500) return "Serverfehler beim Laden der Nutzerdaten. Bitte spaeter erneut versuchen.";
            return `Fehler beim Laden der Nutzerdaten (HTTP ${error.status}).`;
        }

        if (error instanceof Error) {
            return `Nutzerdaten konnten nicht geladen werden: ${error.message}`;
        }

        return "Die Nutzerdaten konnten nicht geladen werden.";
    };

    const getStatsErrorMessage = (error: unknown): string => {
        if (error instanceof ApiError) {
            if (error.status === 401) return "Sitzung abgelaufen. Bitte melde dich erneut an, um die Statistik zu sehen.";
            if (error.status === 403) return "Keine Berechtigung fuer diese Statistikdaten.";
            if (error.status === 404) return "Statistikdaten fuer diesen Studenten wurden nicht gefunden.";
            if (error.status === 422) return "Die Anfrage fuer Statistikdaten ist ungueltig.";
            if (error.status === 429) return "Zu viele Anfragen auf Statistikdaten. Bitte kurz warten und erneut versuchen.";
            if (error.status >= 500) return "Serverfehler beim Laden der Statistikdaten. Bitte spaeter erneut versuchen.";
            return `Fehler beim Laden der Statistikdaten (HTTP ${error.status}).`;
        }

        if (error instanceof Error) {
            return `Statistikdaten konnten nicht geladen werden: ${error.message}`;
        }

        return "Die Statistikdaten konnten nicht geladen werden.";
    };

    const getHistoryErrorMessage = (error: unknown): string => {
        if (error instanceof ApiError) {
            if (error.status === 401) return "Sitzung abgelaufen. Bitte melde dich erneut an, um die Quiz-Historie zu sehen.";
            if (error.status === 403) return "Keine Berechtigung fuer diese Quiz-Historie.";
            if (error.status === 404) return "Es wurde keine Quiz-Historie fuer diesen Studenten gefunden.";
            if (error.status === 422) return "Die Anfrage fuer die Quiz-Historie ist ungueltig.";
            if (error.status === 429) return "Zu viele Anfragen auf die Quiz-Historie. Bitte kurz warten und erneut versuchen.";
            if (error.status >= 500) return "Serverfehler beim Laden der Quiz-Historie. Bitte spaeter erneut versuchen.";
            return `Fehler beim Laden der Quiz-Historie (HTTP ${error.status}).`;
        }

        if (error instanceof Error) {
            return `Quiz-Historie konnte nicht geladen werden: ${error.message}`;
        }

        return "Die Quiz-Historie konnte nicht geladen werden.";
    };

    const [student, setStudent] = useState<StudentUser | null>(null);
    const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
    const [completedQuizzes, setCompletedQuizzes] = useState<number>(0);
    const [totalAnswers, setTotalAnswers] = useState<number>(0);
    const [correctAnswers, setCorrectAnswers] = useState<number>(0);
    const [overallCorrectRate, setOverallCorrectRate] = useState<number>(0);

    const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
    const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

    const [userError, setUserError] = useState<string | null>(null);
    const [statsError, setStatsError] = useState<string | null>(null);
    const [historyError, setHistoryError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoadingUser(true);
            setUserError(null);
            try {
                const res = await apiFetch<{ data: StudentUser }>(`/v1/users/${id}`, {
                    method: "GET",
                });
                setStudent(res.data);
            } catch (error) {
                setUserError(getUserErrorMessage(error));
            } finally {
                setIsLoadingUser(false);
            }
        };

        fetchUser();
    }, [id]);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoadingStats(true);
            setStatsError(null);
            try {
                const [completedRes, distributionRes] = await Promise.all([
                    apiFetch<{ data: CompletedQuizzesData }>(
                        `/v1/users/${id}/completed-quizzes`,
                        { method: "GET" },
                    ),
                    apiFetch<{ data: AnswerDistributionData }>(
                        `/v1/users/${id}/answer-distribution`,
                        { method: "GET" },
                    ),
                ]);

                const completed = completedRes.data?.completed_quizzes ?? 0;
                const total = distributionRes.data?.total_answers ?? 0;
                const correct = distributionRes.data?.correct_answers ?? 0;
                const rateFromApi = distributionRes.data?.correct_rate;
                const rate =
                    typeof rateFromApi === "number"
                        ? rateFromApi
                        : total > 0
                          ? (correct / total) * 100
                          : 0;

                setCompletedQuizzes(completed);
                setTotalAnswers(total);
                setCorrectAnswers(correct);
                setOverallCorrectRate(rate);
            } catch (error) {
                setStatsError(getStatsErrorMessage(error));
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStats();
    }, [id]);

    useEffect(() => {
        const fetchQuizHistory = async () => {
            setIsLoadingHistory(true);
            setHistoryError(null);
            try {
                const res = await apiFetch<{ data: QuizHistoryItem[] }>(
                    `/v1/users/${id}/quiz-history`,
                    { method: "GET" },
                );

                const mappedResults = (res.data ?? []).map((quiz) => ({
                    id: String(quiz.id),
                    title: quiz.title,
                    correctAnswers: quiz.correct_answers,
                    totalQuestions: quiz.total_questions,
                    date: quiz.completed_at,
                }));

                setQuizResults(mappedResults);
            } catch (error) {
                setHistoryError(getHistoryErrorMessage(error));
            } finally {
                setIsLoadingHistory(false);
            }
        };

        fetchQuizHistory();
    }, [id]);

    const totalQuestionsFromHistory = useMemo(
        () => quizResults.reduce((sum, quiz) => sum + quiz.totalQuestions, 0),
        [quizResults],
    );

    const totalCorrectFromHistory = useMemo(
        () => quizResults.reduce((sum, quiz) => sum + quiz.correctAnswers, 0),
        [quizResults],
    );

    if (isLoadingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">
                        Lade Nutzerdaten...
                    </p>
                </div>
            </div>
        );
    }

    if (userError || !student) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
                <div className="max-w-md text-center space-y-3">
                    <p className="text-sm text-destructive font-medium">
                        {userError ?? "Unbekannter Fehler beim Laden des Studenten."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Bitte versuche es später erneut oder wende dich an die
                        Lehrkraft.
                    </p>
                </div>
            </div>
        );
    }

    const displayName = student.display_name || student.username || "Unbekannter Student";

    return (
        <div className="min-h-screen bg-background text-foreground px-6 py-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Student Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Übersicht über vergangene Quizzes und Performance
                        </p>
                    </div>
                    <div className="bg-card text-card-foreground border border-border/60 rounded-xl px-4 py-3 shadow-sm min-w-55">
                        <p className="text-sm font-medium text-muted-foreground">
                            Student
                        </p>
                        <p className="text-lg font-semibold truncate">{displayName}</p>
                        {student.class_name && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Klasse: {student.class_name}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 break-all">
                            ID: {student.id}
                        </p>
                    </div>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card text-card-foreground border border-border/60 rounded-xl p-4 shadow-sm">
                        <h2 className="text-sm font-medium text-muted-foreground mb-1">
                            Absolvierte Quizzes
                        </h2>
                        <p className="text-2xl font-bold">
                            {isLoadingStats ? "..." : completedQuizzes}
                        </p>
                    </div>
                    <div className="bg-card text-card-foreground border border-border/60 rounded-xl p-4 shadow-sm">
                        <h2 className="text-sm font-medium text-muted-foreground mb-1">
                            Davon korrekt
                        </h2>
                        <p className="text-2xl font-bold">
                            {isLoadingStats ? "..." : correctAnswers}
                        </p>
                    </div>
                    <div className="bg-primary text-primary-foreground rounded-xl p-4 shadow-sm">
                        <h2 className="text-sm font-medium opacity-80 mb-1">
                            Gesamt-Quote
                        </h2>
                        <p className="text-2xl font-bold">
                            {isLoadingStats ? "..." : `${overallCorrectRate.toFixed(0)}%`}
                        </p>
                    </div>
                </section>

                {statsError && (
                    <p className="text-xs text-destructive">{statsError}</p>
                )}

                <section className="bg-card text-card-foreground border border-border/60 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Quiz-Historie</h2>

                    {isLoadingHistory ? (
                        <p className="text-sm text-muted-foreground">Lade Quiz-Historie...</p>
                    ) : historyError ? (
                        <p className="text-sm text-destructive">{historyError}</p>
                    ) : quizResults.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Noch keine Quizzes absolviert.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {quizResults.map((quiz) => {
                                const rate =
                                    quiz.totalQuestions > 0
                                        ? (quiz.correctAnswers / quiz.totalQuestions) * 100
                                        : 0;

                                return (
                                    <div
                                        key={quiz.id}
                                        className="flex flex-col md:flex-row md:items-center justify-between gap-2 border border-border/60 rounded-lg px-4 py-3 bg-background/50"
                                    >
                                        <div>
                                            <p className="font-medium">{quiz.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Datum: {quiz.date}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-sm">
                                                {quiz.correctAnswers}/{quiz.totalQuestions}{" "}
                                                korrekt
                                            </p>
                                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-accent"
                                                    style={{ width: `${rate}%` }}
                                                />
                                            </div>
                                            <p className="text-sm font-semibold">
                                                {rate.toFixed(0)}%
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <p className="text-xs text-muted-foreground">
                    Gesamt beantwortete Fragen: {isLoadingStats ? "..." : totalAnswers} (aus Historie: {totalQuestionsFromHistory}) | Historie korrekt: {totalCorrectFromHistory}
                </p>
            </div>
        </div>
    );
};

export default StudentDashboard;
