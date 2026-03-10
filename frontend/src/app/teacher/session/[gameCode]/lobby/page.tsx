"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { LobbyHeader } from "@/components/teacher/lobby/lobby-header";
import { ParticipantsPanel } from "@/components/teacher/lobby/participants-panel";
import { GamePinCard } from "@/components/teacher/lobby/game-pin-card";
import { ParticipantCounter } from "@/components/teacher/lobby/participant-counter";
import { StartButton } from "@/components/teacher/lobby/start-button";
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

interface ParticipantsResponse {
    data: Participant[];
}

export default function Lobby() {
    const params = useParams();
    const router = useRouter();
    const gameCode = params.gameCode as string;

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>();
    const [isStarting, setIsStarting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        const interval = setInterval(() => {
            apiFetch<ParticipantsResponse>(`/v1/sessions/${gameCode}/participants`)
                .then((res) => setParticipants(res.data))
                .catch((err) => console.error("Failed to poll participants:", err));
        }, 3000);

        return () => clearInterval(interval);
    }, [gameCode]);

    const connectedCount = participants.filter((p) => p.is_connected).length;

    const handleStart = useCallback(() => {
        setIsStarting(true);
        setTimeout(() => {
            router.push(`/teacher/session/${gameCode}/live`);
        }, 1500);
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
