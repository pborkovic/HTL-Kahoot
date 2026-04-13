"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { SkipForward, BarChart3, Trophy, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useSessionChannel } from "@/hooks/use-session-channel";
import { QuestionHeader } from "@/components/teacher/live/question-header";
import { QuestionCard } from "@/components/teacher/live/question-card";
import { ResponseCounter } from "@/components/teacher/live/response-counter";
import { AnswerDistribution } from "@/components/teacher/live/answer-distribution";
import { LeaderboardPanel } from "@/components/teacher/live/leaderboard-panel";
import type {
    CurrentQuestion,
    QuestionResults,
    LeaderboardEntry,
} from "@/types/session";

type LiveState = "question_open" | "question_closed" | "leaderboard" | "finished";

export default function TeacherLive() {
    const { gameCode } = useParams<{ gameCode: string }>();
    const router = useRouter();

    const [liveState, setLiveState] = useState<LiveState>("question_open");
    const [question, setQuestion] = useState<CurrentQuestion | null>(null);
    const [questionResults, setQuestionResults] = useState<QuestionResults | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isAdvancing, setIsAdvancing] = useState(false);
    const [totalParticipants, setTotalParticipants] = useState(0);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchQuestion = useCallback(async () => {
        try {
            const res = await apiFetch<{ data: CurrentQuestion }>(
                `/v1/sessions/${gameCode}/current-question`,
            );
            setQuestion(res.data);
            setTimeRemaining(res.data.time_remaining);
            setLiveState("question_open");
            setQuestionResults(null);
        } catch {
        }
    }, [gameCode]);

    useEffect(() => {
        fetchQuestion();
    }, [fetchQuestion]);

    useEffect(() => {
        if (liveState !== "question_open" || !question){
            return ;
        }

        const deadline = new Date(question.opened_at).getTime() + question.time_limit * 1000;

        const tick = () => {
            const left = Math.max(0, (deadline - Date.now()) / 1000);
            setTimeRemaining(left);
        };

        tick();
        timerRef.current = setInterval(tick, 200);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [liveState, question]);

    useSessionChannel(gameCode, {
        onAnswerReceived: (data) => {
            setQuestionResults((prev) => prev ? {
                ...prev,
                total_responses: data.total_responses,
                total_participants: data.total_participants,
            } : {
                answer_distribution: [],
                total_responses: data.total_responses,
                correct_count: 0,
                total_participants: data.total_participants,
            });
            setTotalParticipants(data.total_participants);
        },
    });

    const handleCloseQuestion = useCallback(async () => {
        setIsAdvancing(true);
        try {
            await apiFetch(
                `/v1/sessions/${gameCode}/close-question`,
                { method: "POST" },
            );
            const res = await apiFetch<{ data: QuestionResults }>(
                `/v1/sessions/${gameCode}/question-results`,
            );
            setQuestionResults(res.data);
        } catch {
            setQuestionResults((prev) => prev ?? {
                answer_distribution: [],
                total_responses: 0,
                correct_count: 0,
                total_participants: totalParticipants,
            });
        } finally {
            setLiveState("question_closed");
            setIsAdvancing(false);
        }
    }, [gameCode, totalParticipants]);

    const handleShowLeaderboard = useCallback(async () => {
        try {
            const res = await apiFetch<{ data: LeaderboardEntry[] }>(
                `/v1/sessions/${gameCode}/leaderboard`,
            );
            setLeaderboard(res.data);
            setLiveState("leaderboard");
        } catch {
            setLiveState("leaderboard");
        }
    }, [gameCode]);

    const handleNext = useCallback(async () => {
        setIsAdvancing(true);
        try {
            const res = await apiFetch<{ data: { status: string } }>(
                `/v1/sessions/${gameCode}/next`,
                { method: "POST" },
            );

            if (res.data.status === "finished") {
                setLiveState("finished");
                router.push(`/teacher/session/${gameCode}/results`);
            } else {
                await fetchQuestion();
            }
        } catch {
        } finally {
            setIsAdvancing(false);
        }
    }, [gameCode, fetchQuestion, router]);

    const isLastQuestion = question
        ? question.question_index + 1 >= question.total_questions
        : false;

    return (
        <div className="flex-1">
            <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-8 mx-auto max-w-480">
                {/* Page header */}
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-foreground flex items-center justify-center">
                        <BarChart3 className="size-4.5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            Live-Spiel
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            PIN: {gameCode}
                        </p>
                    </div>
                </div>

                {question && liveState === "question_open" && (
                    <>
                        <QuestionHeader
                            questionIndex={question.question_index}
                            totalQuestions={question.total_questions}
                            timeLimit={question.time_limit}
                            timeRemaining={timeRemaining}
                        />

                        <QuestionCard
                            questionText={question.question_text}
                            answerOptions={question.answer_options}
                            media={question.question_media}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <ResponseCounter
                                totalResponses={questionResults?.total_responses ?? 0}
                                totalParticipants={totalParticipants}
                            />

                            <div className="bg-card border border-border/60 rounded-xl p-4 sm:p-5 flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={handleCloseQuestion}
                                    disabled={isAdvancing}
                                    className="w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isAdvancing ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <>
                                            <SkipForward className="size-4" />
                                            Frage schließen
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {liveState === "question_closed" && questionResults && (
                    <>
                        {question && (
                            <QuestionHeader
                                questionIndex={question.question_index}
                                totalQuestions={question.total_questions}
                                timeLimit={question.time_limit}
                                timeRemaining={0}
                            />
                        )}

                        <AnswerDistribution
                            distribution={questionResults.answer_distribution}
                            totalResponses={questionResults.total_responses}
                        />

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{questionResults.correct_count} von {questionResults.total_responses} richtig</span>
                            <span>{questionResults.total_participants} Teilnehmer</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={handleShowLeaderboard}
                                className="h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer"
                            >
                                <Trophy className="size-4" />
                                Bestenliste
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={isAdvancing}
                                className="h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {isAdvancing ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <>
                                        <SkipForward className="size-4" />
                                        {isLastQuestion ? "Ergebnisse" : "Nächste Frage"}
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}

                {liveState === "leaderboard" && (
                    <>
                        <LeaderboardPanel entries={leaderboard} maxEntries={10} />

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={isAdvancing}
                            className="w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {isAdvancing ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <>
                                    <SkipForward className="size-4" />
                                    {isLastQuestion ? "Ergebnisse anzeigen" : "Nächste Frage"}
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
