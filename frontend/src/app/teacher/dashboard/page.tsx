"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { DashboardHeader } from "@/components/teacher/dashboard/dashboard-header";
import { QuestionsPanel } from "@/components/teacher/dashboard/questions-panel";
import { StudentsPanel } from "@/components/teacher/dashboard/students-panel";
import { QuizSettings } from "@/components/teacher/dashboard/quiz-settings";
import { LobbyButton } from "@/components/teacher/dashboard/lobby-button";
import { useQuestions } from "@/hooks/use-questions";
import { useStudents } from "@/hooks/use-students";

interface QuizData {
    id: string;
}

interface SessionData {
    id: string;
    game_pin: string;
    qr_code_url: string;
}

export default function Dashboard() {
    const router = useRouter();
    const questions = useQuestions();
    const students = useStudents();
    const [questionWeight, setQuestionWeight] = useState(5);
    const [maxTimePerQuestion, setMaxTimePerQuestion] = useState(30);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const canCreateLobby = questions.selectedIds.size > 0 && students.selectedIds.size > 0;

    async function createLobby() {
        if (!canCreateLobby || isCreating) return;

        setIsCreating(true);
        setCreateError(null);

        try {
            const quizRes = await apiFetch<QuizData>("/v1/quizzes", {
                method: "POST",
                body: JSON.stringify({
                    title: `Quiz ${new Date().toLocaleDateString("de-DE")}`,
                    time_mode: "per_question",
                    speed_scoring: false,
                    randomize_questions: false,
                }),
            });

            const quizId = quizRes.id;
            if (!quizId) {
                throw new Error("Quiz konnte nicht erstellt werden — keine ID erhalten.");
            }

            const selectedQuestions = questions.displayQuestions.filter(q =>
                questions.selectedIds.has(q.id) && q.current_version
            );

            if (selectedQuestions.length === 0) {
                throw new Error("Keine der ausgewählten Fragen hat eine gültige Version.");
            }

            for (let i = 0; i < selectedQuestions.length; i++) {
                const q = selectedQuestions[i];
                await apiFetch(`/v1/quizzes/${quizId}/questions`, {
                    method: "POST",
                    body: JSON.stringify({
                        question_version_id: q.current_version!.id,
                        sort_order: i,
                        weight: questionWeight,
                        time_limit_override: maxTimePerQuestion,
                    }),
                });
            }

            const sessionRes = await apiFetch<{ session: SessionData }>("/v1/sessions", {
                method: "POST",
                body: JSON.stringify({
                    quiz_id: quizId,
                }),
            });

            const gamePin = sessionRes.session?.game_pin;
            if (!gamePin) {
                throw new Error("Session konnte nicht erstellt werden — kein Game-Pin erhalten.");
            }

            router.push(`/teacher/session/${gamePin}/lobby`);
        } catch (err) {
            setCreateError(
                err instanceof Error ? err.message : "Fehler beim Erstellen der Lobby"
            );
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-8 xl:px-12 2xl:px-16 mx-auto max-w-[1920px]">
                <DashboardHeader />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                    <QuestionsPanel questions={questions} />
                    <StudentsPanel students={students} />
                </div>

                <QuizSettings
                    questionWeight={questionWeight}
                    maxTimePerQuestion={maxTimePerQuestion}
                    onWeightChange={setQuestionWeight}
                    onTimeChange={setMaxTimePerQuestion}
                />

                <LobbyButton
                    canCreate={canCreateLobby}
                    isCreating={isCreating}
                    selectedQuestionsCount={questions.selectedIds.size}
                    selectedStudentsCount={students.selectedIds.size}
                    onCreateLobby={createLobby}
                    createError={createError}
                />
            </div>
        </div>
    );
}
