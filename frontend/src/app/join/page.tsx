"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2, LogIn, Gamepad2 } from "lucide-react";

interface JoinResponse {
  participant_id: string;
  session_id: string;
  game_pin: string;
  nickname: string;
  status: string;
}

export default function JoinPage(): ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect((): void => {
    const urlPin = searchParams.get("pin");
    if (urlPin && /^\d{8}$/.test(urlPin)) {
      setPin(urlPin);
    }
  }, [searchParams]);

  useEffect((): void => {
    if (!authLoading) {
      pinInputRef.current?.focus();
    }
  }, [authLoading]);

  useEffect((): void => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleJoin = useCallback(async (): Promise<void> => {
    setError(null);

    if (!/^\d{8}$/.test(pin)) {
      setError("Bitte gib einen gültigen 8-stelligen Code ein.");

      return;
    }

    setIsLoading(true);

    try {
      const data = await apiFetch<JoinResponse>("/v1/sessions/join", {
        method: "POST",
        body: JSON.stringify({ game_pin: pin }),
      });

      sessionStorage.setItem(
        "participant",
        JSON.stringify({
          participantId: data.participant_id,
          sessionId: data.session_id,
          gamePin: data.game_pin,
          nickname: data.nickname,
        })
      );

      router.push(`/play/${data.game_pin}/lobby`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Verbindung zum Server fehlgeschlagen.");
      }
      setIsLoading(false);
    }
  }, [pin, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === "Enter") {
        void handleJoin();
      }
    },
    [handleJoin]
  );

  const handlePinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value.replace(/\D/g, "").slice(0, 8);
      setPin(value);
      setError(null);
    },
    []
  );

  const formattedPin =
    pin.length > 4 ? `${pin.slice(0, 4)} ${pin.slice(4)}` : pin;

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = user?.display_name ?? user?.username ?? user?.email?.split("@")[0] ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 mb-4">
            <Gamepad2 className="size-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Spiel beitreten
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gib den Spielcode ein, den dein Lehrer dir zeigt.
          </p>
          {displayName && (
            <p className="mt-2 text-sm text-foreground font-medium">
              Angemeldet als {displayName}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <input
            ref={pinInputRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0000 0000"
            value={formattedPin}
            onChange={(e) => {
              const raw = e.target.value.replace(/\s/g, "");
              handlePinChange({
                ...e,
                target: { ...e.target, value: raw },
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            onKeyDown={handleKeyDown}
            className="w-full text-center text-3xl font-mono font-bold tracking-[0.3em] py-4 px-4 rounded-xl border border-border bg-card text-card-foreground placeholder:text-muted-foreground/40 placeholder:tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            maxLength={9}
          />

          <button
            type="button"
            onClick={() => void handleJoin()}
            disabled={isLoading || pin.length !== 8}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <LogIn className="size-5" />
            )}
            {isLoading ? "Beitreten..." : "Beitreten"}
          </button>

          {error && (
            <p className="text-sm text-center text-red-500 font-medium">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
