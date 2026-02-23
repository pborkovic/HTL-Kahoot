"use client";

import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api";

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleMicrosoftLogin = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/redirect`);
            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                setError("Fehler beim Abrufen der Login-URL");
            }
        } catch (err) {
            setError("Verbindung zum Server fehlgeschlagen");
            console.error("Login error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-md p-15 space-y-8 rounded-lg border-2 border-primary">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-text">Willkommen bei GamQuiz</h1>
                    <p className="mt-2 text-text/60">Melde dich mit deinem Microsoft-Konto an</p>
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-100 text-red-700 text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={handleMicrosoftLogin}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-[#2f2f2f] hover:bg-[#1a1a1a] text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 23 23"
                            className="w-5 h-5"
                        >
                            <path fill="#f35325" d="M1 1h10v10H1z" />
                            <path fill="#81bc06" d="M12 1h10v10H12z" />
                            <path fill="#05a6f0" d="M1 12h10v10H1z" />
                            <path fill="#ffba08" d="M12 12h10v10H12z" />
                        </svg>
                        {isLoading ? "Wird geladen..." : "Mit Microsoft anmelden"}
                    </button>
                </div>

                <div className="text-center text-sm text-text/50">
                    <p>
                        Mit der Anmeldung akzeptierst du unsere{" "}
                        <a href="/terms" className="text-accent hover:underline">
                            Nutzungsbedingungen
                        </a>{" "}
                        und{" "}
                        <a href="/privacy" className="text-accent hover:underline">
                            Datenschutzrichtlinie
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
