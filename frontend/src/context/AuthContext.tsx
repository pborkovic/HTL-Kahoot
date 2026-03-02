"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  apiFetch,
  getStoredToken,
  removeStoredToken,
  setStoredToken,
} from "@/lib/api";
import type { AuthResponse, User } from "@/types/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: () => Promise<void>;
  handleCallback: (code: string) => Promise<User>;
  logout: () => Promise<void>;
}

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);

      return;
    }

    let cancelled = false;

    apiFetch<{ user: User }>("/auth/user")
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        if (!cancelled) removeStoredToken();
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async () => {
    const data = await apiFetch<{ url: string }>("/auth/redirect");
    window.location.href = data.url;
  }, []);

  const handleCallback = useCallback(async (code: string): Promise<User> => {
    const data = await apiFetch<AuthResponse>("/auth/callback", {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    setStoredToken(data.token);
    setUser(data.user);

    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      removeStoredToken();
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isAuthenticated, login, handleCallback, logout }),
    [
        user,
        isLoading,
        isAuthenticated,
        login,
        handleCallback,
        logout
    ],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
