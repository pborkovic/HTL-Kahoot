"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, getStoredToken } from "@/lib/api";
import { DashboardHeader } from "@/components/teacher/dashboard/dashboard-header";
import { QuestionsPanel } from "@/components/teacher/dashboard/questions-panel";
import { StudentsPanel } from "@/components/teacher/dashboard/students-panel";
import { QuizSettings } from "@/components/teacher/dashboard/quiz-settings";
import { LobbyButton } from "@/components/teacher/dashboard/lobby-button";
import { QuestionFormDialog } from "@/components/teacher/questions/question-form-dialog";
import { useQuestions } from "@/hooks/use-questions";
import { useStudents } from "@/hooks/use-students";
import type { Question } from "@/types/question";
import type { Quiz } from "@/types/quiz";

const API_URL: string = process.env.NEXT_PUBLIC_API_URL ?? "/api";

interface SessionData {
    id: string;
    game_pin: string;
    qr_code_url: string;
}

/** Fire-and-forget PUT that survives page navigation via keepalive. */
function fireAndForgetSave(path: string, body: object): void {
    const token = getStoredToken();
    try {
        fetch(`${API_URL}${path}`, {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(body),
            keepalive: true,
        }).catch(() => {});
    } catch {
        // best effort
    }
}

export default function Dashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const quizIdParam = searchParams.get("quiz");
    const questions = useQuestions();
    const students = useStudents();
    const [questionWeight, setQuestionWeight] = useState(5);
    const [maxTimePerQuestion, setMaxTimePerQuestion] = useState(30);
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editQuestion, setEditQuestion] = useState<Question | null>(null);
    const [quizTitle, setQuizTitle] = useState<string>("");
    const [loadedQuiz, setLoadedQuiz] = useState<Quiz | null>(null);
    const [preselected, setPreselected] = useState(false);
    const [autosaveEnabled, setAutosaveEnabled] = useState(false);
    const lastSavedQuestionKey = useRef("");
    const lastSavedStudentKey = useRef("");
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const quizIdRef = useRef<string | null>(null);
    const busyRef = useRef(false);
    quizIdRef.current = loadedQuiz?.id ?? null;

    const questionKey = useMemo(
        () => [...questions.selectedIds].sort().join(","),
        [questions.selectedIds]
    );
    const studentKey = useMemo(
        () => [...students.selectedIds].sort().join(","),
        [students.selectedIds]
    );

    useEffect(() => {
        if (!quizIdParam) {
            setLoadedQuiz(null);
            setPreselected(false);
            setAutosaveEnabled(false);
            lastSavedQuestionKey.current = "";
            lastSavedStudentKey.current = "";

            return;
        }

        setPreselected(false);
        setAutosaveEnabled(false);

        async function loadQuiz() {
            try {
                const quiz = await apiFetch<Quiz>(`/v1/quizzes/${quizIdParam}`);
                setLoadedQuiz(quiz);
                setQuizTitle(quiz.title);
            } catch {
                setLoadedQuiz(null);
            }
        }

        void loadQuiz();
    }, [quizIdParam]);

    useEffect(() => {
        if (!loadedQuiz || questions.loading || students.loading || preselected) {
            return;
        }

        const quizQuestionVersionIds = new Set(
            loadedQuiz.quiz_questions?.map((qq) => qq.question_version?.id) ?? []
        );

        const matchedQuestionIds = new Set<string>();
        if (quizQuestionVersionIds.size > 0) {
            for (const q of questions.displayQuestions) {
                if (q.current_version && quizQuestionVersionIds.has(q.current_version.id)) {
                    matchedQuestionIds.add(q.id);
                }
            }
        }
        if (matchedQuestionIds.size > 0) {
            questions.setSelectedIds(matchedQuestionIds);
        }

        const savedParticipantIds = new Set(
            loadedQuiz.participants?.map((p) => p.id) ?? []
        );
        if (savedParticipantIds.size > 0) {
            students.setSelectedIds(savedParticipantIds);
        }

        setPreselected(true);
    }, [loadedQuiz, questions.loading, students.loading, questions.displayQuestions, questions.setSelectedIds, students.setSelectedIds, loadedQuiz?.quiz_questions, loadedQuiz?.participants, preselected]);

    useEffect(() => {
        if (!preselected || autosaveEnabled) return;
        lastSavedQuestionKey.current = questionKey;
        lastSavedStudentKey.current = studentKey;
        setAutosaveEnabled(true);
    }, [preselected, autosaveEnabled, questionKey, studentKey]);

    const buildQuestionsSyncBody = useCallback(() => {
        const selected = questions.displayQuestions.filter(
            (q) => questions.selectedIds.has(q.id) && q.current_version
        );
        return {
            questions: selected.map((q, i) => ({
                question_version_id: q.current_version!.id,
                sort_order: i,
                weight: questionWeight,
                time_limit_override: maxTimePerQuestion,
            })),
        };
    }, [questions.displayQuestions, questions.selectedIds, questionWeight, maxTimePerQuestion]);

    const buildParticipantsSyncBody = useCallback(() => {
        return { user_ids: [...students.selectedIds] };
    }, [students.selectedIds]);

    useEffect(() => {
        if (!loadedQuiz || !autosaveEnabled) return;

        const questionsChanged = questionKey !== lastSavedQuestionKey.current;
        const studentsChanged = studentKey !== lastSavedStudentKey.current;

        if (!questionsChanged && !studentsChanged) return;

        if (saveTimer.current) clearTimeout(saveTimer.current);

        saveTimer.current = setTimeout(async () => {
            saveTimer.current = null;
            const quizId = loadedQuiz.id;

            try {
                if (questionsChanged) {
                    await apiFetch(`/v1/quizzes/${quizId}/questions/sync`, {
                        method: "PUT",
                        body: JSON.stringify(buildQuestionsSyncBody()),
                    });
                    lastSavedQuestionKey.current = questionKey;
                }
                if (studentsChanged) {
                    await apiFetch(`/v1/quizzes/${quizId}/participants`, {
                        method: "PUT",
                        body: JSON.stringify(buildParticipantsSyncBody()),
                    });
                    lastSavedStudentKey.current = studentKey;
                }
            } catch (err) {
                console.error("[autosave] SAVE FAILED:", err);
            }
        }, 800);

        return () => {
            if (saveTimer.current) {
                clearTimeout(saveTimer.current);
                saveTimer.current = null;
            }
        };
    }, [questionKey, studentKey, loadedQuiz?.id, autosaveEnabled]);

    const questionKeyRef = useRef(questionKey);
    const studentKeyRef = useRef(studentKey);
    const buildQuestionsSyncBodyRef = useRef(buildQuestionsSyncBody);
    const buildParticipantsSyncBodyRef = useRef(buildParticipantsSyncBody);
    const autosaveEnabledRef = useRef(autosaveEnabled);

    questionKeyRef.current = questionKey;
    studentKeyRef.current = studentKey;
    buildQuestionsSyncBodyRef.current = buildQuestionsSyncBody;
    buildParticipantsSyncBodyRef.current = buildParticipantsSyncBody;
    autosaveEnabledRef.current = autosaveEnabled;

    useEffect(() => {
        return () => {
            if (saveTimer.current) {
                clearTimeout(saveTimer.current);
                saveTimer.current = null;
            }

            const qId = quizIdRef.current;
            if (!qId || !autosaveEnabledRef.current) return;

            if (questionKeyRef.current !== lastSavedQuestionKey.current) {
                fireAndForgetSave(
                    `/v1/quizzes/${qId}/questions/sync`,
                    buildQuestionsSyncBodyRef.current()
                );
            }
            if (studentKeyRef.current !== lastSavedStudentKey.current) {
                fireAndForgetSave(
                    `/v1/quizzes/${qId}/participants`,
                    buildParticipantsSyncBodyRef.current()
                );
            }
        };
    }, []);

    async function ensureQuizWithSelections(): Promise<string> {
        let quizId: string;

        if (loadedQuiz) {
            if (saveTimer.current) {
                clearTimeout(saveTimer.current);
                saveTimer.current = null;
            }
            const questionsChanged = questionKey !== lastSavedQuestionKey.current;
            const studentsChanged = studentKey !== lastSavedStudentKey.current;

            if (questionsChanged) {
                await apiFetch(`/v1/quizzes/${loadedQuiz.id}/questions/sync`, {
                    method: "PUT",
                    body: JSON.stringify(buildQuestionsSyncBody()),
                });
                lastSavedQuestionKey.current = questionKey;
            }
            if (studentsChanged) {
                await apiFetch(`/v1/quizzes/${loadedQuiz.id}/participants`, {
                    method: "PUT",
                    body: JSON.stringify(buildParticipantsSyncBody()),
                });
                lastSavedStudentKey.current = studentKey;
            }

            if (quizTitle && quizTitle !== loadedQuiz.title) {
                await apiFetch(`/v1/quizzes/${loadedQuiz.id}`, {
                    method: "PUT",
                    body: JSON.stringify({ title: quizTitle }),
                });
            }

            quizId = loadedQuiz.id;
        } else {
            const title = quizTitle.trim() || `Quiz ${new Date().toLocaleDateString("de-DE")}`;

            const quizRes = await apiFetch<{ id: string }>("/v1/quizzes", {
                method: "POST",
                body: JSON.stringify({
                    title,
                    time_mode: "per_question",
                    speed_scoring: true,
                    randomize_questions: false,
                }),
            });

            quizId = quizRes.id;
            if (!quizId) {
                throw new Error("Quiz konnte nicht erstellt werden — keine ID erhalten.");
            }

            const selectedQuestions = questions.displayQuestions.filter(
                (q) => questions.selectedIds.has(q.id) && q.current_version
            );

            if (selectedQuestions.length === 0) {
                throw new Error("Keine der ausgewählten Fragen hat eine gültige Version.");
            }

            await apiFetch(`/v1/quizzes/${quizId}/questions/sync`, {
                method: "PUT",
                body: JSON.stringify({
                    questions: selectedQuestions.map((q, i) => ({
                        question_version_id: q.current_version!.id,
                        sort_order: i,
                        weight: questionWeight,
                        time_limit_override: maxTimePerQuestion,
                    })),
                }),
            });

            if (students.selectedIds.size > 0) {
                await apiFetch(`/v1/quizzes/${quizId}/participants`, {
                    method: "PUT",
                    body: JSON.stringify({ user_ids: [...students.selectedIds] }),
                });
            }

            setLoadedQuiz({ id: quizId, title } as Quiz);
            lastSavedQuestionKey.current = questionKey;
            lastSavedStudentKey.current = studentKey;
        }

        return quizId;
    }

    const canCreateLobby = questions.selectedIds.size > 0 && students.selectedIds.size > 0;
    const canSave = questions.selectedIds.size > 0 || students.selectedIds.size > 0;

    const handleCreateQuestion = useCallback(() => {
        setEditQuestion(null);
        setFormOpen(true);
    }, []);

    const handleEditQuestion = useCallback((q: Question) => {
        setEditQuestion(q);
        setFormOpen(true);
        questions.setDetailQuestion(null);
    }, [questions]);

    const handleQuestionSaved = useCallback(() => {
        questions.refetch();
    }, [questions]);

    const handleTitleChange = useCallback((title: string) => {
        setQuizTitle(title);
        if (loadedQuiz) {
            apiFetch(`/v1/quizzes/${loadedQuiz.id}`, {
                method: "PUT",
                body: JSON.stringify({ title }),
            }).catch(() => {});
        }
    }, [loadedQuiz]);

    async function createLobby() {
        if (!canCreateLobby || busyRef.current) return;
        busyRef.current = true;

        setIsCreating(true);
        setCreateError(null);

        try {
            const quizId = await ensureQuizWithSelections();

            const sessionRes = await apiFetch<{ session: SessionData }>("/v1/sessions", {
                method: "POST",
                body: JSON.stringify({ quiz_id: quizId }),
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
            busyRef.current = false;
        }
    }

    async function saveQuiz() {
        if (!canSave || busyRef.current) return;
        busyRef.current = true;

        setIsSaving(true);
        setCreateError(null);

        try {
            const quizId = await ensureQuizWithSelections();

            if (!loadedQuiz) {
                router.replace(`/teacher/dashboard?quiz=${quizId}`);
            }
        } catch (err) {
            setCreateError(
                err instanceof Error ? err.message : "Fehler beim Speichern"
            );
        } finally {
            setIsSaving(false);
            busyRef.current = false;
        }
    }

    return (
        <div className="flex-1">
            <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-8 mx-auto max-w-[1920px]">
                <DashboardHeader
                    quizTitle={quizTitle || loadedQuiz?.title}
                    onTitleChange={handleTitleChange}
                />

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_480px] gap-4 sm:gap-5 items-stretch">
                    <QuestionsPanel
                        questions={questions}
                        onCreateQuestion={handleCreateQuestion}
                        onEditQuestion={handleEditQuestion}
                        onQuestionDeleted={handleQuestionSaved}
                    />

                    <div className="flex flex-col gap-4 sm:gap-5">
                        <StudentsPanel students={students} />

                        <QuizSettings
                            questionWeight={questionWeight}
                            maxTimePerQuestion={maxTimePerQuestion}
                            onWeightChange={setQuestionWeight}
                            onTimeChange={setMaxTimePerQuestion}
                        />

                        <LobbyButton
                            canCreate={canCreateLobby}
                            canSave={canSave}
                            isCreating={isCreating}
                            isSaving={isSaving}
                            selectedQuestionsCount={questions.selectedIds.size}
                            selectedStudentsCount={students.selectedIds.size}
                            onCreateLobby={createLobby}
                            onSaveQuiz={saveQuiz}
                            createError={createError}
                        />
                    </div>
                </div>
            </div>
            <QuestionFormDialog
                open={formOpen}
                question={editQuestion}
                onClose={() => setFormOpen(false)}
                onSaved={handleQuestionSaved}
            />
        </div>
    );
}
