"use client";

import type { ReactNode } from "react";
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
  setAuthCookie,
  removeAuthCookie,
} from "@/lib/api";
import type { AuthResponse, User } from "@/types/auth";
import type { Theme, FontSize } from "@/components/ThemeProvider";

function applyUserPreferences(user: User): void {
  if (!user.preferences) return;

  if (user.preferences.theme) {
    localStorage.setItem("theme", user.preferences.theme);
    window.dispatchEvent(new CustomEvent("preferences-changed", { detail: user.preferences }));
  }

  if (user.preferences.font_size) {
    localStorage.setItem("font_size", user.preferences.font_size);
    window.dispatchEvent(new CustomEvent("preferences-changed", { detail: user.preferences }));
  }
}

interface UserResponse {
  user: User;
}

interface RedirectResponse {
  url: string;
}

/**
 * Represents the authentication state.
 */
interface AuthState {
  /** The currently authenticated user, or null if not logged in. */
  user: User | null;
  /** Whether the authentication status is being checked. */
  isLoading: boolean;
  /** Whether the user is currently authenticated. */
  isAuthenticated: boolean;
}

/**
 * Represents the available authentication actions.
 */
interface AuthActions {
  /** Initiates the login process by redirecting to the auth provider. */
  login: () => Promise<void>;
  /** Logs in using email and password. */
  loginWithEmail: (email: string, password: string) => Promise<User>;
  /** Handles the callback from the auth provider after successful authentication. */
  handleCallback: (code: string) => Promise<User>;
  /** Logs out the current user. */
  logout: () => Promise<void>;
}

/**
 * The combined type for the authentication context value.
 */
type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provider component that manages authentication state and provides it to the rest of the application.
 * 
 * @param props - The component props.
 * @param props.children - The children to be wrapped by the provider.
 * @returns The rendered AuthProvider.
 */
export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated: boolean = user !== null;

  useEffect((): (() => void) | undefined => {
    const token: string | null = getStoredToken();
    if (!token) {
      setIsLoading(false);

      return undefined;
    }

    let cancelled: boolean = false;

    apiFetch<UserResponse>("/auth/user")
      .then(async (data: UserResponse): Promise<void> => {
        if (!cancelled) {
          const roles: string[] = data.user.roles?.map((r) => r.name) ?? [];
          await setAuthCookie(token, roles);
          applyUserPreferences(data.user);
          setUser(data.user);
        }
      })
      .catch(async (): Promise<void> => {
        if (!cancelled) {
          removeStoredToken();
          await removeAuthCookie();
        }
      })
      .finally((): void => {
        if (!cancelled) setIsLoading(false);
      });

    return (): void => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (): Promise<void> => {
    const data: RedirectResponse = await apiFetch<RedirectResponse>("/auth/redirect");
    window.location.href = data.url;
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string): Promise<User> => {
    const data: AuthResponse = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setStoredToken(data.token);
    const roles: string[] = data.user.roles?.map((r) => r.name) ?? [];
    await setAuthCookie(data.token, roles);
    applyUserPreferences(data.user);
    setUser(data.user);

    return data.user;
  }, []);

  const handleCallback = useCallback(async (code: string): Promise<User> => {
    const data: AuthResponse = await apiFetch<AuthResponse>("/auth/callback", {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    setStoredToken(data.token);
    const roles: string[] = data.user.roles?.map((r) => r.name) ?? [];
    await setAuthCookie(data.token, roles);
    applyUserPreferences(data.user);
    setUser(data.user);

    return data.user;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiFetch<unknown>("/auth/logout", { method: "POST" });
    } finally {
      removeStoredToken();
      await removeAuthCookie();
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isAuthenticated, login, loginWithEmail, handleCallback, logout }),
    [
        user,
        isLoading,
        isAuthenticated,
        login,
        loginWithEmail,
        handleCallback,
        logout,
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
