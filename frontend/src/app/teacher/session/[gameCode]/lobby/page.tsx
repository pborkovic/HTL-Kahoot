"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { LobbyHeader } from "@/components/teacher/lobby/lobby-header";
import { ParticipantsPanel } from "@/components/teacher/lobby/participants-panel";
import { GamePinCard } from "@/components/teacher/lobby/game-pin-card";
import { ParticipantCounter } from "@/components/teacher/lobby/participant-counter";
import { StartButton } from "@/components/teacher/lobby/start-button";
import { useSessionChannel } from "@/hooks/use-session-channel";
import { apiFetch } from "@/lib/api";
import type { Participant } from "@/types/participant";

interface SessionResponse {
    data: {
        id: string;
        game_pin: string;
        qr_code_url: string;
        status: string;
        participants: Participant[];
    };
}

export default function Lobby() {
    const { gameCode } = useParams<{ gameCode: string }>();
    const router = useRouter();

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>();
    const [isStarting, setIsStarting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    /* Initial session load */
    useEffect(() => {
        apiFetch<SessionResponse>(`/v1/sessions/${gameCode}`)
            .then((res) => {
                setQrCodeUrl(res.data.qr_code_url);
                setParticipants(res.data.participants);
            })
            .catch((err) => {
                console.error("Failed to load session:", err);
            })
            .finally(() => setIsLoading(false));
    }, [gameCode]);

    /* Real-time participant updates via WebSocket */
    useSessionChannel(gameCode, {
        onParticipantJoined: (data) => {
            setParticipants((prev) => {
                if (prev.some((p) => p.id === data.participant_id)) return prev;
                return [...prev, {
                    id: data.participant_id,
                    nickname: data.nickname,
                    is_connected: data.is_connected,
                    joined_at: data.joined_at,
                }];
            });
        },
    });

    const connectedCount = participants.filter((p) => p.is_connected).length;

    const handleStart = useCallback(async () => {
        setIsStarting(true);
        try {
            await apiFetch(`/v1/sessions/${gameCode}/start`, { method: "POST" });
            router.push(`/teacher/session/${gameCode}/live`);
        } catch (err) {
            console.error("Failed to start game:", err);
            setIsStarting(false);
        }
    }, [gameCode, router]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="size-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1">
            <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-8 mx-auto max-w-480">
                <LobbyHeader />

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-4 sm:gap-5 items-stretch">
                    <ParticipantsPanel
                        participants={participants}
                        connectedCount={connectedCount}
                    />

                    <div className="flex flex-col gap-4 sm:gap-5">
                        <GamePinCard gameCode={gameCode} qrCodeUrl={qrCodeUrl} />

                        <ParticipantCounter
                            total={participants.length}
                            connectedCount={connectedCount}
                        />

                        <StartButton
                            participantCount={participants.length}
                            isStarting={isStarting}
                            onStart={handleStart}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
