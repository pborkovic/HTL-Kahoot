"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useSessionChannel } from "@/hooks/use-session-channel";
import { CountdownTimer } from "@/components/play/game/countdown-timer";
import { AnswerGrid } from "@/components/play/game/answer-grid";
import { AnswerFeedback } from "@/components/play/game/answer-feedback";
import { WaitingScreen } from "@/components/play/game/waiting-screen";
import type { CurrentQuestion, AnswerResult } from "@/types/session";

type GameState = "loading" | "answering" | "submitted" | "waiting" | "finished";

export default function StudentGame() {
    const { gameCode } = useParams<{ gameCode: string }>();
    const router = useRouter();
    const [gameState, setGameState] = useState<GameState>("loading");
    const [question, setQuestion] = useState<CurrentQuestion | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [result, setResult] = useState<AnswerResult | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const lastQuestionIdx = useRef<number | null>(null);
    const gameStateRef = useRef(gameState);
    gameStateRef.current = gameState;

    const fetchQuestion = useCallback(async () => {
        try {
            const res = await apiFetch<{ data: CurrentQuestion }>(
                `/v1/sessions/${gameCode}/current-question`,
            );
            setQuestion(res.data);
            setSelectedIds([]);
            setResult(null);
            setGameState("answering");
            lastQuestionIdx.current = res.data.question_index;
        } catch {
        }
    }, [gameCode]);

    useEffect(() => {
        fetchQuestion();
    }, [fetchQuestion]);

    useSessionChannel(gameCode, {
        onQuestionOpened: async (data) => {
            if (data.question_index !== lastQuestionIdx.current) {
                await fetchQuestion();
            }
        },
        onQuestionClosed: () => {
            if (gameStateRef.current === "answering" || gameStateRef.current === "submitted") {
                setGameState("waiting");
            }
        },
        onGameFinished: () => {
            setGameState("finished");
            router.push(`/play/${gameCode}/results`);
        },
    });

    const isMultiSelect = question?.question_type === "multiple_choice";

    const submitAnswer = useCallback(
        async (answerIds: string[]) => {
            if (submitting || gameState !== "answering" || answerIds.length === 0) return;

            setSubmitting(true);

            try {
                const res = await apiFetch<{ data: AnswerResult }>(
                    `/v1/sessions/${gameCode}/answer`,
                    {
                        method: "POST",
                        body: JSON.stringify({ answer: answerIds }),
                    },
                );
                setResult(res.data);
                setGameState("submitted");
            } catch {
                setGameState("submitted");
                setResult({ is_correct: false, score_awarded: 0, time_taken_ms: 0, answer_streak: 0 });
            } finally {
                setSubmitting(false);
            }
        },
        [gameCode, submitting, gameState],
    );

    const handleSelect = useCallback(
        (optionId: string) => {
            if (submitting || gameState !== "answering") return;

            if (isMultiSelect) {
                setSelectedIds((prev) =>
                    prev.includes(optionId)
                        ? prev.filter((id) => id !== optionId)
                        : [...prev, optionId],
                );
            } else {
                setSelectedIds([optionId]);
                submitAnswer([optionId]);
            }
        },
        [submitting, gameState, isMultiSelect, submitAnswer],
    );

    const handleConfirm = useCallback(() => {
        submitAnswer(selectedIds);
    }, [submitAnswer, selectedIds]);

    const handleExpired = useCallback(() => {
        if (gameState === "answering") {
            setGameState("waiting");
        }
    }, [gameState]);

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

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center bg-[#2D3436] overflow-y-auto">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-primary/4 blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-2xl px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6">
                {gameState === "loading" && (
                    <WaitingScreen message="Spiel wird geladen..." />
                )}

                {gameState === "answering" && question && (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
                                Frage {question.question_index + 1} von {question.total_questions}
                            </span>
                            <CountdownTimer
                                openedAt={question.opened_at}
                                timeLimit={question.time_limit}
                                onExpired={handleExpired}
                            />
                        </div>

                        {/* Question */}
                        <div className="rounded-xl bg-white/5 border border-white/10 px-5 py-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-white text-center leading-snug">
                                {question.question_text}
                            </h2>
                        </div>

                        {/* Answers */}
                        <AnswerGrid
                            options={question.answer_options}
                            questionType={question.question_type}
                            selectedIds={selectedIds}
                            disabled={submitting}
                            onSelect={handleSelect}
                        />

                        {/* Confirm button for multi-select */}
                        {isMultiSelect && selectedIds.length > 0 && (
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={submitting}
                                className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-white text-[#2D3436] hover:bg-white/90 transition-colors disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <Send className="size-4" />
                                Antwort absenden ({selectedIds.length} ausgewählt)
                            </button>
                        )}
                    </>
                )}

                {gameState === "submitted" && result && (
                    <AnswerFeedback
                        isCorrect={result.is_correct}
                        scoreAwarded={result.score_awarded}
                        answerStreak={result.answer_streak}
                    />
                )}

                {gameState === "waiting" && (
                    <WaitingScreen message="Warte auf die nächste Frage..." />
                )}
            </div>
        </div>
    );
}
