"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Props for the CountdownTimer component.
 */
interface CountdownTimerProps {
    /** ISO date string indicating when the timer started. */
    openedAt: string;
    /** The total time limit in seconds. */
    timeLimit: number;
    /** Callback function called when the timer reaches zero. */
    onExpired: () => void;
}

/**
 * A circular countdown timer that synchronizes with a server-provided start time.
 * 
 * Displays remaining seconds and a progress ring that changes color when time is running out.
 *
 * @param props - The component props.
 * @returns The rendered countdown timer.
 */
export function CountdownTimer({ openedAt, timeLimit, onExpired }: CountdownTimerProps) {
    const [remaining, setRemaining] = useState(timeLimit);
    const expiredRef = useRef(false);

    useEffect(() => {
        expiredRef.current = false;
        const deadline = new Date(openedAt).getTime() + timeLimit * 1000;

        const tick = () => {
            const now = Date.now();
            const left = Math.max(0, (deadline - now) / 1000);
            setRemaining(left);

            if (left <= 0 && !expiredRef.current) {
                expiredRef.current = true;
                onExpired();
            }
        };

        tick();
        const interval = setInterval(tick, 100);

        return () => clearInterval(interval);
    }, [openedAt, timeLimit, onExpired]);

    const fraction = remaining / timeLimit;
    const seconds = Math.ceil(remaining);
    const isUrgent = remaining <= 5;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative size-20">
                <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                    <circle
                        cx="18" cy="18" r="15.9155"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white/10"
                    />
                    <circle
                        cx="18" cy="18" r="15.9155"
                        fill="none"
                        strokeWidth="2.5"
                        strokeDasharray={`${fraction * 100} 100`}
                        strokeLinecap="round"
                        className={`transition-colors duration-300 ${isUrgent ? "text-red-400" : "text-primary"}`}
                        stroke="currentColor"
                    />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-2xl font-bold tabular-nums ${isUrgent ? "text-red-400" : "text-white"}`}>
                    {seconds}
                </span>
            </div>
        </div>
    );
}
