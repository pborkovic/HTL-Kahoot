"use client";

import { useState, useCallback } from "react";
import { QrCode, Copy, Check } from "lucide-react";

interface GamePinCardProps {
    gameCode: string;
    qrCodeUrl?: string;
}

export function GamePinCard({ gameCode, qrCodeUrl }: GamePinCardProps) {
    const [copied, setCopied] = useState(false);

    const copyPin = useCallback(async () => {
        await navigator.clipboard.writeText(gameCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [gameCode]);

    return (
        <div className="bg-card border border-border/60 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-md bg-foreground flex items-center justify-center">
                    <QrCode className="size-3.5 text-primary-foreground" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                    Game-PIN
                </h2>
            </div>

            <div className="flex items-center justify-center">
                <div className="flex items-center gap-3 bg-muted/40 border border-border/40 rounded-lg px-5 py-3">
                    <span className="text-3xl font-bold tracking-[0.25em] text-foreground tabular-nums">
                        {gameCode}
                    </span>
                    <button
                        type="button"
                        onClick={copyPin}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="PIN kopieren"
                    >
                        {copied ? (
                            <Check className="size-4 text-emerald-500" />
                        ) : (
                            <Copy className="size-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* QR-Code */}
            <div className="flex items-center justify-center">
                <div className="rounded-lg border border-border/40 p-3 bg-white">
                    {qrCodeUrl ? (
                        <img
                            src={qrCodeUrl}
                            alt="QR Code zum Beitreten"
                            width={192}
                            height={192}
                        />
                    ) : (
                        <div className="size-48 flex items-center justify-center text-muted-foreground">
                            <QrCode className="size-12 opacity-20 animate-pulse" />
                        </div>
                    )}
                </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
                Schüler geben den Code unter <span className="font-medium text-foreground">/join</span> ein oder scannen den QR-Code.
            </p>
        </div>
    );
}
