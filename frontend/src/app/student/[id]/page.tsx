"use client";

import React, { useEffect, useState, use } from "react";
import type { StudentUser } from "@/types/student";

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

    const [student, setStudent] = useState<StudentUser | null>(null);
    const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
    const [overallCorrectRate, setOverallCorrectRate] = useState<number>(0);
    const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
    const [userError, setUserError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoadingUser(true);
            setUserError(null);
            try {
                const res = await fetch(`/api/v1/users/${id}`);

                if (!res.ok) {
                    setUserError(
                        res.status === 404
                            ? "Dieser Student wurde nicht gefunden."
                            : "Beim Laden der Nutzerdaten ist ein Fehler aufgetreten."
                    );
                    return;
                }

                const json: { data: StudentUser } = await res.json();
                setStudent(json.data);
            } catch (error) {
                console.error("Fehler beim Laden des Nutzers", error);
                setUserError("Die Nutzerdaten konnten nicht geladen werden.");
            } finally {
                setIsLoadingUser(false);
            }
        };

        fetchUser();
    }, [id]);

    useEffect(() => {
        // \[PLACEHOLDER\] Beispiel\-Daten \-\- hier später echte API\-Requests machen
        // z\.B.: fetch(`/api/students/${id}`) und fetch(`/api/students/${id}/quizzes`)
        const mockQuizResults: QuizResult[] = [
            {
                id: "1",
                title: "Mathe Grundlagen",
                correctAnswers: 8,
                totalQuestions: 10,
                date: "2025\-03\-01",
            },
            {
                id: "2",
                title: "Geschichte Europas",
                correctAnswers: 6,
                totalQuestions: 10,
                date: "2025\-03\-05",
            },
            {
                id: "3",
                title: "Physik \- Mechanik",
                correctAnswers: 9,
                totalQuestions: 10,
                date: "2025\-03\-10",
            },
        ];

        setQuizResults(mockQuizResults);

        const totalCorrect = mockQuizResults.reduce(
            (sum, quiz) => sum + quiz.correctAnswers,
            0
        );
        const totalQuestions = mockQuizResults.reduce(
            (sum, quiz) => sum + quiz.totalQuestions,
            0
        );
        const rate = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
        setOverallCorrectRate(rate);

        // \[PLACEHOLDER\] Student\-Name aus API laden
        // setStudentName(response.name)
    }, [id]);

    if (isLoadingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Lade Nutzerdaten...</p>
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
                        Bitte versuche es später erneut oder wende dich an die Lehrkraft.
                    </p>
                </div>
            </div>
        );
    }

    const displayName = student.display_name || student.username || "Unbekannter Student";

    return (
        <div className="min-h-screen bg-background text-foreground px-6 py-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header / Student Info */}
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

                {/* Gesamtstatistik */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card text-card-foreground border border-border/60 rounded-xl p-4 shadow-sm">
                        <h2 className="text-sm font-medium text-muted-foreground mb-1">
                            Insgesamt beantwortet
                        </h2>
                        <p className="text-2xl font-bold">
                            {quizResults.reduce(
                                (sum, quiz) => sum + quiz.totalQuestions,
                                0
                            )}
                        </p>
                    </div>
                    <div className="bg-card text-card-foreground border border-border/60 rounded-xl p-4 shadow-sm">
                        <h2 className="text-sm font-medium text-muted-foreground mb-1">
                            Davon korrekt
                        </h2>
                        <p className="text-2xl font-bold">
                            {quizResults.reduce(
                                (sum, quiz) => sum + quiz.correctAnswers,
                                0
                            )}
                        </p>
                    </div>
                    <div className="bg-primary text-primary-foreground rounded-xl p-4 shadow-sm">
                        <h2 className="text-sm font-medium opacity-80 mb-1">
                            Gesamt\-Quote
                        </h2>
                        <p className="text-2xl font-bold">
                            {overallCorrectRate.toFixed(0)}%
                        </p>
                    </div>
                </section>

                {/* Quiz Liste */}
                <section className="bg-card text-card-foreground border border-border/60 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">
                        Quiz\-Historie
                    </h2>

                    {quizResults.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Noch keine Quizzes absolviert.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {quizResults.map((quiz) => {
                                const rate =
                                    (quiz.correctAnswers / quiz.totalQuestions) * 100;

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
                                                {quiz.correctAnswers}/{quiz.totalQuestions} korrekt
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
            </div>
        </div>
    );
};

export default StudentDashboard;
