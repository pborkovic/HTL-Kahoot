"use client";

import { type MutableRefObject, useEffect, useRef } from "react";
import type Echo from "laravel-echo";

/**
 * Data received when a participant joins the session.
 */
export interface ParticipantJoinedData {
    /** The unique identifier of the participant. */
    readonly participant_id: string;
    /** The nickname of the participant. */
    readonly nickname: string;
    /** Indicates if the participant is currently connected. */
    readonly is_connected: boolean;
    /** The timestamp when the participant joined. */
    readonly joined_at: string;
}

/**
 * Data received when a question is opened.
 */
export interface QuestionOpenedData {
    /** The index of the current question. */
    readonly question_index: number;
    /** The total number of questions in the quiz. */
    readonly total_questions: number;
}

/**
 * Data received when a question is closed.
 */
export interface QuestionClosedData {
    /** The index of the question that was closed. */
    readonly question_index: number;
}

/**
 * Data received when an answer is submitted.
 */
export interface AnswerReceivedData {
    /** The current number of responses received. */
    readonly total_responses: number;
    /** The total number of participants in the session. */
    readonly total_participants: number;
}

/**
 * Data received when the game starts.
 */
export interface GameStartedData {
    /** The status of the game. */
    readonly status: string;
}

/**
 * Data received when the game finishes.
 */
export interface GameFinishedData {
    /** The status of the game. */
    readonly status: string;
}

/**
 * Callback handlers for session channel events.
 */
export interface SessionChannelHandlers {
    /** Callback when a participant joins. */
    readonly onParticipantJoined?: (data: ParticipantJoinedData) => void;
    /** Callback when the game starts. */
    readonly onGameStarted?: () => void;
    /** Callback when a question is opened. */
    readonly onQuestionOpened?: (data: QuestionOpenedData) => void;
    /** Callback when an answer is received. */
    readonly onAnswerReceived?: (data: AnswerReceivedData) => void;
    /** Callback when a question is closed. */
    readonly onQuestionClosed?: (data: QuestionClosedData) => void;
    /** Callback when the game finishes. */
    readonly onGameFinished?: () => void;
}

/**
 * Internal map of session event names to their corresponding data types.
 */
type SessionEventMap = {
    readonly ".ParticipantJoined": ParticipantJoinedData;
    readonly ".GameStarted": GameStartedData;
    readonly ".QuestionOpened": QuestionOpenedData;
    readonly ".AnswerReceived": AnswerReceivedData;
    readonly ".QuestionClosed": QuestionClosedData;
    readonly ".GameFinished": GameFinishedData;
};

/**
 * Internal type for session event names.
 */
type SessionEventName = keyof SessionEventMap;

/**
 * Binds event listeners to the Echo channel.
 * 
 * @param channel - The Echo channel to listen on.
 * @param handlersRef - A ref to the object containing callback handlers.
 */
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

/**
 * Hook for connecting to a quiz session channel via Laravel Echo/Reverb.
 * 
 * @param gamePin - The game pin of the session to join.
 * @param handlers - Callback functions for handling session events.
 */
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
