"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { LobbyHeader } from "@/components/teacher/lobby/lobby-header";
import { ParticipantsPanel } from "@/components/teacher/lobby/participants-panel";
import { GamePinCard } from "@/components/teacher/lobby/game-pin-card";
import { ParticipantCounter } from "@/components/teacher/lobby/participant-counter";
import { StartButton } from "@/components/teacher/lobby/start-button";
import type { Participant } from "@/types/participant";

/* ── Testdaten ─────────────────────────────────────────────── */

const MOCK_PARTICIPANTS: Participant[] = [
    { id: "1", nickname: "Max Mustermann", isConnected: true, joinedAt: "2026-03-09T10:00:00Z" },
    { id: "2", nickname: "Anna Schmidt", isConnected: true, joinedAt: "2026-03-09T10:00:05Z" },
    { id: "3", nickname: "Lukas Weber", isConnected: true, joinedAt: "2026-03-09T10:00:12Z" },
    { id: "4", nickname: "Sophie Bauer", isConnected: true, joinedAt: "2026-03-09T10:00:18Z" },
    { id: "5", nickname: "Felix Wagner", isConnected: false, joinedAt: "2026-03-09T10:00:25Z" },
];

const LATE_JOINERS: Participant[] = [
    { id: "6", nickname: "Emma Fischer", isConnected: true, joinedAt: "2026-03-09T10:01:00Z" },
    { id: "7", nickname: "Leon Hoffmann", isConnected: true, joinedAt: "2026-03-09T10:01:10Z" },
    { id: "8", nickname: "Mia Schäfer", isConnected: true, joinedAt: "2026-03-09T10:01:20Z" },
];

/* ── Lobby-Seite ───────────────────────────────────────────── */

export default function Lobby() {
    const params = useParams();
    const router = useRouter();
    const gameCode = params.gameCode as string;

    const [participants, setParticipants] = useState<Participant[]>(MOCK_PARTICIPANTS);
    const [isStarting, setIsStarting] = useState(false);
    const lateJoinerIdx = useRef(0);

    /* Simulierter WebSocket: Alle 4 Sekunden joined ein neuer Schüler */
    useEffect(() => {
        const interval = setInterval(() => {
            if (lateJoinerIdx.current < LATE_JOINERS.length) {
                const newParticipant = LATE_JOINERS[lateJoinerIdx.current];
                lateJoinerIdx.current += 1;
                setParticipants((prev) => [...prev, newParticipant]);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const connectedCount = participants.filter((p) => p.isConnected).length;

    const handleStart = useCallback(() => {
        setIsStarting(true);
        setTimeout(() => {
            router.push(`/teacher/session/${gameCode}/live`);
        }, 1500);
    }, [gameCode, router]);

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
                        <GamePinCard gameCode={gameCode} />

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
