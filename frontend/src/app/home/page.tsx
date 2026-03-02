"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

export default function HomePage(): ReactNode {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect((): void => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = useCallback(async (): Promise<void> => {
    await logout();
    router.replace("/login");
  }, [logout, router]);

  if (isLoading || !user) {
    return <p>Laden...</p>;
  }

  return (
    <div>
      <h1>Hallo, {user.username ?? user.email}</h1>
      <p>E-Mail: {user.email}</p>
      <button type="button" onClick={handleLogout}>Abmelden</button>
    </div>
  );
}
