"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

export default function HomePage(): ReactNode {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return;
    }
    const roleNames = user.roles?.map((r) => r.name) ?? [];
    if (roleNames.includes("student")) {
      router.replace("/student/dashboard");
    }
  }, [user, router]);

  const handleLogout = useCallback(async (): Promise<void> => {
    await logout();
    router.replace("/login");
  }, [logout, router]);

  return (
    <div>
      <h1>Hallo, {user?.username ?? user?.email}</h1>
      <p>E-Mail: {user?.email}</p>
      <button type="button" onClick={handleLogout}>Abmelden</button>
    </div>
  );
}
