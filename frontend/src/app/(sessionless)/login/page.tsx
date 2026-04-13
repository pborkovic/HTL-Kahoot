"use client";

import type { ReactNode } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { GraduationCap, Mail, Lock, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/15 blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-accent/10 blur-3xl animate-pulse [animation-delay:4s]" />
      </div>

      {/* Glass card */}
      <div className="relative w-full max-w-md mx-4">
        <div className="backdrop-blur-xl bg-card/60 dark:bg-card/40 rounded-2xl border border-primary/20 shadow-2xl shadow-primary/5 p-10 space-y-8">
          {/* Logo & heading */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20 mb-2">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Willkommen bei GamQuiz
            </h1>
            <p className="text-muted-foreground text-sm">
              {showEmailForm
                ? "Melde dich mit deinem Admin-Konto an"
                : "Melde dich an, um loszulegen"}
            </p>
          </div>

          {/* Auth forms */}
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                <p className="text-destructive text-sm text-center">{error}</p>
              </div>
            )}

            {showEmailForm ? (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground/80"
                  >
                    E-Mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                      placeholder="admin@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-foreground/80"
                  >
                    Passwort
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                      placeholder="Passwort"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
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
                  className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück zur Microsoft-Anmeldung
                </button>
              </form>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isRedirecting}
                  className="w-full py-3 px-4 bg-[#2f2f2f] hover:bg-[#1a1a1a] text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-black/10 hover:shadow-xl"
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
                    <div className="w-full border-t border-border/40" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-card/60 backdrop-blur-sm text-muted-foreground rounded-full text-xs">
                      oder
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(true);
                    setError(null);
                  }}
                  className="w-full py-3 px-4 backdrop-blur-sm bg-background/40 border border-border/40 hover:border-primary/40 hover:bg-background/60 text-foreground font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background cursor-pointer"
                >
                  Als Administrator anmelden
                </button>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-2">
            <p>
              Mit der Anmeldung akzeptierst du unsere{" "}
              <a href="/terms" className="text-primary hover:underline">
                Nutzungsbedingungen
              </a>{" "}
              und{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Datenschutzrichtlinie
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
