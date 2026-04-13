"use client";

import { useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import type { Theme } from "@/components/ThemeProvider";
import type { UserPreferences } from "@/types/auth";

/**
 * Interface for the object returned by the usePreferences hook.
 */
interface UsePreferencesReturn {
  /** The current user preferences. */
  preferences: UserPreferences;
  /**
   * Function to update a specific preference.
   * @param key - The preference key to update.
   * @param value - The new value for the preference.
   */
  updatePreference: <K extends keyof UserPreferences>(key: K, value: NonNullable<UserPreferences[K]>) => Promise<void>;
  /** Function to apply the preferences retrieved from the server (e.g., theme, font size). */
  applyServerPreferences: () => void;
}

/**
 * Custom hook to manage user preferences, including fetching, updating, and applying them.
 * 
 * @returns An object containing preferences and management functions.
 */
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
