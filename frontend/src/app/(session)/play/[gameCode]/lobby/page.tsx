"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { WaitingHeader } from "@/components/play/lobby/waiting-header";
import { WaitingAnimation } from "@/components/play/lobby/waiting-animation";
import { StatusCard } from "@/components/play/lobby/status-card";
import { PlayerList } from "@/components/play/lobby/player-list";
import { useSessionChannel } from "@/hooks/use-session-channel";
import { apiFetch } from "@/lib/api";
import type { Participant } from "@/types/participant";

interface JoinResponse {
    participant_id: string;
    session_id: string;
    game_pin: string;
    nickname: string;
    status: string;
}

interface ParticipantsResponse {
    data: Participant[];
}

export default function StudentLobby() {
    const { gameCode } = useParams<{ gameCode: string }>();
    const router = useRouter();

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [nickname, setNickname] = useState("Spieler");
    const [participantId, setParticipantId] = useState<string | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [hasJoined, setHasJoined] = useState(false);

    useEffect(() => {
        apiFetch<JoinResponse>("/v1/sessions/join", {
            method: "POST",
            body: JSON.stringify({ game_pin: gameCode }),
        })
            .then((res) => {
                setParticipantId(res.participant_id);
                setNickname(res.nickname);
                setHasJoined(true);

                if (res.status === "active") {
                    router.push(`/play/${gameCode}/game`);
                    return;
                }

                apiFetch<ParticipantsResponse>(`/v1/sessions/${gameCode}/participants`)
                    .then((pRes) => setParticipants(pRes.data))
                    .catch((err) => console.error("Failed to load participants:", err));
            })
            .catch((err) => {
                console.error("Failed to join session:", err);
            });
    }, [gameCode, router]);

    useSessionChannel(hasJoined ? gameCode : "", {
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
        onGameStarted: () => {
            router.push(`/play/${gameCode}/game`);
        },
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatElapsed = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        const prev = {
            htmlBg: html.style.backgroundColor,
            bodyBg: body.style.backgroundColor,
            htmlOverflow: html.style.overflow,
            bodyOverflow: body.style.overflow,
            bodyOverscroll: body.style.overscrollBehavior,
        };
        html.style.backgroundColor = "#2D3436";
        body.style.backgroundColor = "#2D3436";
        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
        body.style.overscrollBehavior = "none";
        return () => {
            html.style.backgroundColor = prev.htmlBg;
            body.style.backgroundColor = prev.bodyBg;
            html.style.overflow = prev.htmlOverflow;
            body.style.overflow = prev.bodyOverflow;
            body.style.overscrollBehavior = prev.bodyOverscroll;
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center bg-text overflow-y-auto overscroll-none">
            {/* Radialer Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-primary/4 blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-lg px-6 py-12 sm:py-16 flex flex-col items-center gap-8">
                <WaitingHeader />

                <WaitingAnimation />

                <StatusCard
                    gameCode={gameCode}
                    nickname={nickname}
                    playerCount={participants.length}
                    waitingSince={formatElapsed(elapsed)}
                />

                <PlayerList
                    participants={participants}
                    currentPlayerId={participantId ?? ""}
                />
            </div>
        </div>
    );
}
