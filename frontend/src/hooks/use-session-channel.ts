"use client";

import { useEffect, useRef } from "react";

interface ParticipantJoinedData {
    participant_id: string;
    nickname: string;
    is_connected: boolean;
    joined_at: string;
}

interface QuestionOpenedData {
    question_index: number;
    total_questions: number;
}

interface QuestionClosedData {
    question_index: number;
}

interface AnswerReceivedData {
    total_responses: number;
    total_participants: number;
}

interface SessionChannelHandlers {
    onParticipantJoined?: (data: ParticipantJoinedData) => void;
    onGameStarted?: () => void;
    onQuestionOpened?: (data: QuestionOpenedData) => void;
    onAnswerReceived?: (data: AnswerReceivedData) => void;
    onQuestionClosed?: (data: QuestionClosedData) => void;
    onGameFinished?: () => void;
}

export function useSessionChannel(gamePin: string, handlers: SessionChannelHandlers) {
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers;

    useEffect(() => {
        if (!gamePin) return;

        let mounted = true;

        import("@/lib/echo").then(({ getEcho }) => {
            if (!mounted) return;

            const echo = getEcho();
            const channel = echo.join(`session.${gamePin}`);

            channel
                .listen(".ParticipantJoined", (data: ParticipantJoinedData) => {
                    handlersRef.current.onParticipantJoined?.(data);
                })
                .listen(".GameStarted", () => {
                    handlersRef.current.onGameStarted?.();
                })
                .listen(".QuestionOpened", (data: QuestionOpenedData) => {
                    handlersRef.current.onQuestionOpened?.(data);
                })
                .listen(".AnswerReceived", (data: AnswerReceivedData) => {
                    handlersRef.current.onAnswerReceived?.(data);
                })
                .listen(".QuestionClosed", (data: QuestionClosedData) => {
                    handlersRef.current.onQuestionClosed?.(data);
                })
                .listen(".GameFinished", () => {
                    handlersRef.current.onGameFinished?.();
                });
        });

        return () => {
            mounted = false;
            import("@/lib/echo").then(({ getEcho }) => {
                getEcho().leave(`session.${gamePin}`);
            });
        };
    }, [gamePin]);
}
