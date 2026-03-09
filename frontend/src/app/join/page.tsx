"use client";

import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ArrowRight } from "lucide-react";

interface JoinResponse {
  participant_id: string;
  session_id: string;
  game_pin: string;
  nickname: string;
  status: string;
}

interface ParticipantData {
  participantId: string;
  sessionId: string;
  gamePin: string;
  nickname: string;
}

const DIGIT_COUNT: number = 8;
const SEPARATOR_INDEX: number = 4;

export default function JoinPage(): ReactNode {
  const router = useRouter();
  const searchParams: ReturnType<typeof useSearchParams> = useSearchParams();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [digits, setDigits] = useState<string[]>(
    (): string[] => Array<string>(DIGIT_COUNT).fill("")
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pin: string = digits.join("");
  const filledCount: number = digits.filter((d: string): boolean => d !== "").length;
  const isComplete: boolean = filledCount === DIGIT_COUNT;

  useEffect((): void => {
    const urlPin: string | null = searchParams.get("pin");
    if (urlPin && /^\d{8}$/.test(urlPin)) {
      setDigits(urlPin.split(""));
    }
  }, [searchParams]);

  useEffect((): void => {
    if (!authLoading) {
      const firstEmpty: number = digits.findIndex((d: string): boolean => d === "");
      const idx: number = firstEmpty === -1 ? DIGIT_COUNT - 1 : firstEmpty;
      inputRefs.current[idx]?.focus();
    }
  }, [authLoading, digits]);

  useEffect((): void => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleDigitChange = useCallback(
    (index: number, value: string): void => {
      const cleaned: string = value.replace(/\D/g, "");

      if (cleaned.length > 1) {
        const chars: string[] = cleaned.slice(0, DIGIT_COUNT).split("");
        const newDigits: string[] = [...digits];
        chars.forEach((char: string, i: number): void => {
          if (index + i < DIGIT_COUNT) {
            newDigits[index + i] = char;
          }
        });
        setDigits(newDigits);
        setError(null);
        const nextIdx: number = Math.min(index + chars.length, DIGIT_COUNT - 1);
        inputRefs.current[nextIdx]?.focus();

        return;
      }

      if (cleaned.length === 1) {
        const newDigits: string[] = [...digits];

        newDigits[index] = cleaned;
        setDigits(newDigits);
        setError(null);

        if (index < DIGIT_COUNT - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    },
    [digits]
  );

  const handleJoin = useCallback(async (): Promise<void> => {
    setError(null);

    if (pin.length !== DIGIT_COUNT) {
      setError("Bitte gib alle 8 Ziffern ein.");
      return;
    }

    setIsLoading(true);

    try {
      const data: JoinResponse = await apiFetch<JoinResponse>("/v1/sessions/join", {
        method: "POST",
        body: JSON.stringify({ game_pin: pin }),
      });

      const participantData: ParticipantData = {
        participantId: data.participant_id,
        sessionId: data.session_id,
        gamePin: data.game_pin,
        nickname: data.nickname,
      };

      sessionStorage.setItem("participant", JSON.stringify(participantData));
      router.push(`/play/${data.game_pin}/lobby`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Verbindung zum Server fehlgeschlagen.");
      }
      setIsLoading(false);
    }
  }, [pin, router]);

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === "Backspace") {
        e.preventDefault();
        const newDigits: string[] = [...digits];
        if (digits[index]) {
          newDigits[index] = "";
          setDigits(newDigits);
        } else if (index > 0) {
          newDigits[index - 1] = "";
          setDigits(newDigits);
          inputRefs.current[index - 1]?.focus();
        }
        setError(null);
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < DIGIT_COUNT - 1) {
        inputRefs.current[index + 1]?.focus();
      } else if (e.key === "Enter" && pin.length === DIGIT_COUNT) {
        void handleJoin();
      }
    },
    [digits, handleJoin, pin.length]
  );

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-text">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName: string =
    user?.display_name ?? user?.username ?? user?.email?.split("@")[0] ?? "";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-text overflow-hidden">
      {/* Subtle radial glow behind the content */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-primary/4 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
        {/* Brand */}
        <p className="text-primary font-semibold tracking-widest uppercase text-xs mb-6">
          GamQuiz
        </p>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight text-center">
          Spiel beitreten
        </h1>

        {/* Progress bar */}
        <div className="w-full max-w-xs mt-6 mb-8">
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${(filledCount / DIGIT_COUNT) * 100}%` }}
            />
          </div>
        </div>

        {/* Digit cells */}
        <div className="flex gap-2 sm:gap-3 mb-6">
          {digits.map((digit: string, i: number): ReactNode => (
            <div key={i} className="relative">
              {i === SEPARATOR_INDEX && (
                <div className="absolute -left-1.5 sm:-left-2 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-white/20" />
              )}
              <input
                ref={(el: HTMLInputElement | null): void => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={1}
                value={digit}
                onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                  handleDigitChange(i, e.target.value)
                }
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>): void =>
                  handleKeyDown(i, e)
                }
                onFocus={(e: React.FocusEvent<HTMLInputElement>): void =>
                  e.target.select()
                }
                className={`
                  w-10 h-14 sm:w-12 sm:h-16
                  text-center text-xl sm:text-2xl font-bold font-mono
                  rounded-lg border-2
                  outline-none
                  transition-all duration-200
                  ${
                    digit
                      ? "bg-white text-text border-primary shadow-[0_0_16px_rgba(211,175,55,0.25)]"
                      : "bg-white/[0.07] text-white/60 border-white/12 hover:border-white/20"
                  }
                  focus:border-primary focus:bg-white/12 focus:text-white focus:shadow-[0_0_20px_rgba(211,175,55,0.15)]
                  ${digit ? "focus:bg-white focus:text-text" : ""}
                `}
              />
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400 text-center font-medium">
              {error}
            </p>
          </div>
        )}

        {/* Join button */}
        <button
          type="button"
          onClick={(): void => void handleJoin()}
          disabled={isLoading || !isComplete}
          className={`
            group w-full max-w-xs py-3.5 px-6
            font-semibold rounded-xl
            transition-all duration-300 ease-out
            flex items-center justify-center gap-2.5
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-text
            disabled:cursor-not-allowed
            ${
              isComplete
                ? "bg-primary text-text hover:bg-[#B8982E] hover:shadow-[0_0_30px_rgba(211,175,55,0.3)] scale-100 hover:scale-[1.02] active:scale-[0.98]"
                : "bg-white/6 text-white/30 border border-white/8"
            }
          `}
        >
          {isLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              Beitreten
              <ArrowRight
                className={`size-4 transition-transform duration-200 ${isComplete ? "group-hover:translate-x-0.5" : ""}`}
              />
            </>
          )}
        </button>

        {/* User badge */}
        {displayName && (
          <div className="mt-8 flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/6 border border-white/8">
            <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-white/60">{displayName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
