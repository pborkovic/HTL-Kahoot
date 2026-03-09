"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const TIPS = [
    "Lies die Fragen genau durch, bevor du antwortest.",
    "Schnelle Antworten können Bonuspunkte bringen!",
    "Bleib ruhig — du schaffst das!",
    "Jede Frage zählt. Überspringe nichts!",
    "Manchmal ist die offensichtliche Antwort die richtige.",
];

export function WaitingAnimation() {
    const [tipIndex, setTipIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % TIPS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Pulsierender Wartekreis */}
            <div className="relative flex items-center justify-center">
                <div className="absolute size-24 rounded-full bg-primary/5 animate-ping" />
                <div className="absolute size-20 rounded-full bg-primary/10 animate-pulse" />
                <div className="relative size-16 rounded-full bg-primary flex items-center justify-center">
                    <Loader2 className="size-7 text-text animate-spin" />
                </div>
            </div>

            <div className="text-center space-y-1.5">
                <p className="text-lg font-semibold text-white">
                    Warte auf Start…
                </p>
                <p className="text-xs text-white/40">
                    Der Lehrer startet das Spiel in Kürze.
                </p>
            </div>

            {/* Tipp-Karussell */}
            <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-center transition-all duration-300">
                <p className="text-[10px] uppercase tracking-wider text-primary font-medium mb-1">
                    Tipp
                </p>
                <p className="text-xs text-white/60">
                    {TIPS[tipIndex]}
                </p>
            </div>
        </div>
    );
}
