"use client";

import type { ReactNode } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function LoginPage(): ReactNode {
  const { login, loginWithEmail, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const handleEmailLogin = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);
      try {
        await loginWithEmail(email, password);
        router.replace("/home");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.";
        setError(message);
        setIsSubmitting(false);
      }
    },
    [loginWithEmail, email, password, router],
  );

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
            {showEmailForm
              ? "Melde dich mit deinem Admin-Konto an"
              : "Melde dich mit deinem Microsoft-Konto an"}
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {showEmailForm ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text/80 mb-1"
                >
                  E-Mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-primary/40 text-text placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text/80 mb-1"
                >
                  Passwort
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-primary/40 text-text placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Passwort"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-accent hover:bg-accent/80 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Anmelden"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowEmailForm(false);
                  setError(null);
                }}
                className="w-full py-2 text-sm text-text/60 hover:text-text transition-colors"
              >
                Zurück zur Microsoft-Anmeldung
              </button>
            </form>
          ) : (
            <>
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-text/40">oder</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEmailForm(true);
                  setError(null);
                }}
                className="w-full py-3 px-4 border border-primary/40 hover:border-primary text-text font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              >
                Als Administrator anmelden
              </button>
            </>
          )}
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
