"use client";

import { useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import type { Theme } from "@/components/ThemeProvider";
import type { UserPreferences } from "@/types/auth";

interface UsePreferencesReturn {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: NonNullable<UserPreferences[K]>) => Promise<void>;
  applyServerPreferences: () => void;
}

export function usePreferences(): UsePreferencesReturn {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  const preferences: UserPreferences = user?.preferences ?? {};

  const applyServerPreferences = useCallback((): void => {
    if (!user?.preferences){
      return;
    }

    if (user.preferences.theme) {
      setTheme(user.preferences.theme as Theme);
    }

    if (user.preferences.font_size) {
      document.documentElement.dataset.fontSize = user.preferences.font_size;
    }
  }, [user?.preferences, setTheme]);

  const updatePreference = useCallback(async <K extends keyof UserPreferences>(
    key: K,
    value: NonNullable<UserPreferences[K]>,
  ): Promise<void> => {
    await apiFetch<{ data: UserPreferences }>("/v1/users/me/preferences", {
      method: "PUT",
      body: JSON.stringify({ [key]: value }),
    });
  }, []);

  return { preferences, updatePreference, applyServerPreferences };
}
