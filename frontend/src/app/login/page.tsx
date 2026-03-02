"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function LoginPage(): ReactNode {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect((): void => {
    if (!isLoading && isAuthenticated) {
      router.replace("/home");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogin = useCallback(async (): Promise<void> => {
    setIsRedirecting(true);
    setError(null);
    try {
      await login();
    } catch {
      setError("Verbindung zum Server fehlgeschlagen. Bitte versuche es erneut.");
      setIsRedirecting(false);
    }
  }, [login]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-15 space-y-8 rounded-lg border border-primary">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text">Willkommen bei GamQuiz</h1>
          <p className="mt-2 text-text/60">
            Melde dich mit deinem Microsoft-Konto an
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={isRedirecting}
            className="w-full py-3 px-4 bg-[#2f2f2f] hover:bg-[#1a1a1a] text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRedirecting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
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
            )}
            {isRedirecting ? "Weiterleitung..." : "Mit Microsoft anmelden"}
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
