"use client";

import { type MutableRefObject, useEffect, useRef } from "react";
import type Echo from "laravel-echo";

export interface ParticipantJoinedData {
    readonly participant_id: string;
    readonly nickname: string;
    readonly is_connected: boolean;
    readonly joined_at: string;
}

export interface QuestionOpenedData {
    readonly question_index: number;
    readonly total_questions: number;
}

export interface QuestionClosedData {
    readonly question_index: number;
}

export interface AnswerReceivedData {
    readonly total_responses: number;
    readonly total_participants: number;
}

export interface GameStartedData {
    readonly status: string;
}

export interface GameFinishedData {
    readonly status: string;
}

export interface SessionChannelHandlers {
    readonly onParticipantJoined?: (data: ParticipantJoinedData) => void;
    readonly onGameStarted?: () => void;
    readonly onQuestionOpened?: (data: QuestionOpenedData) => void;
    readonly onAnswerReceived?: (data: AnswerReceivedData) => void;
    readonly onQuestionClosed?: (data: QuestionClosedData) => void;
    readonly onGameFinished?: () => void;
}

type SessionEventMap = {
    readonly ".ParticipantJoined": ParticipantJoinedData;
    readonly ".GameStarted": GameStartedData;
    readonly ".QuestionOpened": QuestionOpenedData;
    readonly ".AnswerReceived": AnswerReceivedData;
    readonly ".QuestionClosed": QuestionClosedData;
    readonly ".GameFinished": GameFinishedData;
};

type SessionEventName = keyof SessionEventMap;

function bindListeners(
    channel: ReturnType<Echo<"reverb">["join"]>,
    handlersRef: MutableRefObject<SessionChannelHandlers>,
): void {
    const events: Array<[SessionEventName, (data: SessionEventMap[SessionEventName]) => void]> = [
        [".ParticipantJoined", (data) => handlersRef.current.onParticipantJoined?.(data as ParticipantJoinedData)],
        [".GameStarted", () => handlersRef.current.onGameStarted?.()],
        [".QuestionOpened", (data) => handlersRef.current.onQuestionOpened?.(data as QuestionOpenedData)],
        [".AnswerReceived", (data) => handlersRef.current.onAnswerReceived?.(data as AnswerReceivedData)],
        [".QuestionClosed", (data) => handlersRef.current.onQuestionClosed?.(data as QuestionClosedData)],
        [".GameFinished", () => handlersRef.current.onGameFinished?.()],
    ];

    for (const [event, handler] of events) {
        channel.listen(event, handler);
    }
}

export function useSessionChannel(gamePin: string, handlers: SessionChannelHandlers): void {
    const handlersRef: MutableRefObject<SessionChannelHandlers> = useRef<SessionChannelHandlers>(handlers);
    handlersRef.current = handlers;

    useEffect(() => {
        if (!gamePin) {
            return;
        }

        let mounted: boolean = true;

        import("@/lib/echo").then(({ getEcho }: { getEcho: () => Echo<"reverb"> }) => {
            if (!mounted) {
                return;
            }

            const echo: Echo<"reverb"> = getEcho();
            const channel: ReturnType<Echo<"reverb">["join"]> = echo.join(`session.${gamePin}`);

            bindListeners(channel, handlersRef);
        });

        return (): void => {
            mounted = false;
            import("@/lib/echo").then(({ getEcho }: { getEcho: () => Echo<"reverb"> }) => {
                getEcho().leave(`session.${gamePin}`);
            });
        };
    }, [gamePin]);
}
