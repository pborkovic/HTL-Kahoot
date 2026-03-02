"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function CallbackHandler(): ReactNode {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { handleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const calledRef = useRef<boolean>(false);

  useEffect((): void => {
    if (calledRef.current){
        return;
    }

    const code: string | null = searchParams.get("code");
    if (!code) {
      setError("Kein Autorisierungscode erhalten.");
      return;
    }

    calledRef.current = true;

    handleCallback(code)
      .then((): void => {
        router.replace("/home");
      })
      .catch((): void => {
        setError("Anmeldung fehlgeschlagen. Bitte versuche es erneut.");
      });
  }, [searchParams, handleCallback, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-10 space-y-6 rounded-lg border border-red-400 text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <a
            href="/login"
            className="inline-block text-accent hover:underline"
          >
            Zurück zum Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-text/60">Anmeldung wird verarbeitet...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage(): ReactNode {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
        <CallbackHandler />
    </Suspense>
  );
}
