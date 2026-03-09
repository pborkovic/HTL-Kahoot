"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { WaitingHeader } from "@/components/play/lobby/waiting-header";
import { WaitingAnimation } from "@/components/play/lobby/waiting-animation";
import { StatusCard } from "@/components/play/lobby/status-card";
import { PlayerList } from "@/components/play/lobby/player-list";
import type { Participant } from "@/types/participant";

/* ── Testdaten ─────────────────────────────────────────────── */

const CURRENT_PLAYER_ID = "3";

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
];

/* ── Schüler-Lobby ─────────────────────────────────────────── */

export default function StudentLobby() {
    const params = useParams();
    const gameCode = params.gameCode as string;

    const [participants, setParticipants] = useState<Participant[]>(MOCK_PARTICIPANTS);
    const [elapsed, setElapsed] = useState(0);
    const lateJoinerIdx = useRef(0);

    /* Simulierter WebSocket: Neue Spieler joinen */
    useEffect(() => {
        const interval = setInterval(() => {
            if (lateJoinerIdx.current < LATE_JOINERS.length) {
                const newParticipant = LATE_JOINERS[lateJoinerIdx.current];
                lateJoinerIdx.current += 1;
                setParticipants((prev) => [...prev, newParticipant]);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    /* Wartezeit-Timer */
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatElapsed = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const currentPlayer = participants.find((p) => p.id === CURRENT_PLAYER_ID);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center bg-text overflow-y-auto">
            {/* Radialer Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-primary/4 blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-lg px-6 py-12 sm:py-16 flex flex-col items-center gap-8">
                <WaitingHeader />

                <WaitingAnimation />

                <StatusCard
                    gameCode={gameCode}
                    nickname={currentPlayer?.nickname ?? "Spieler"}
                    playerCount={participants.length}
                    waitingSince={formatElapsed(elapsed)}
                />

                <PlayerList
                    participants={participants}
                    currentPlayerId={CURRENT_PLAYER_ID}
                />
            </div>
        </div>
    );
}
