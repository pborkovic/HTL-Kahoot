"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch, getStoredToken } from "@/lib/api";

export type Theme =
    | "light"
    | "dark"
    | "high-contrast"
    | "dark-high-contrast"
    | "colorblind-friendly"
    | "dark-colorblind-friendly";

export type FontSize = "small" | "medium" | "large";

export const THEMES: { value: Theme; label: string }[] = [
    { value: "light",                   label: "Helles Design"        },
    { value: "dark",                    label: "Dunkles Design"       },
    { value: "high-contrast",           label: "Hoher Kontrast"       },
    { value: "dark-high-contrast",      label: "Dunkler Kontrast"     },
    { value: "colorblind-friendly",     label: "Farbenblind"      },
    { value: "dark-colorblind-friendly",label: "Farbenblind Dunkel" },
];

export const FONT_SIZES: { value: FontSize; label: string }[] = [
    { value: "small",  label: "Klein"   },
    { value: "medium", label: "Normal"  },
    { value: "large",  label: "Groß"    },
];

function applyTheme(theme: Theme): void {
    const el = document.documentElement;
    el.classList.remove("dark", "high-contrast", "colorblind-friendly");
    if (theme === "dark")                    el.classList.add("dark");
    if (theme === "high-contrast")           el.classList.add("high-contrast");
    if (theme === "dark-high-contrast")      el.classList.add("dark", "high-contrast");
    if (theme === "colorblind-friendly")     el.classList.add("colorblind-friendly");
    if (theme === "dark-colorblind-friendly")el.classList.add("dark", "colorblind-friendly");
}

function applyFontSize(size: FontSize): void {
    document.documentElement.dataset.fontSize = size;
}

interface ThemeContextValue {
    theme: Theme;
    fontSize: FontSize;
    setTheme: (theme: Theme) => void;
    setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: "light",
    fontSize: "medium",
    setTheme: () => {},
    setFontSize: () => {},
});

function syncPreference(key: string, value: string): void {
    if (!getStoredToken()) return;
    apiFetch("/v1/users/me/preferences", {
        method: "PUT",
        body: JSON.stringify({ [key]: value }),
    }).catch((err) => {
        console.error("Failed to sync preference:", key, err);
    });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");
    const [fontSize, setFontSizeState] = useState<FontSize>("medium");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        const savedFontSize = localStorage.getItem("font_size") as FontSize | null;
        const initialTheme = savedTheme ?? "light";
        const initialFontSize = savedFontSize ?? "medium";
        setThemeState(initialTheme);
        setFontSizeState(initialFontSize);
        applyTheme(initialTheme);
        applyFontSize(initialFontSize);

        const handlePreferencesChanged = (e: Event): void => {
            const detail = (e as CustomEvent).detail as Record<string, string>;
            if (detail.theme) {
                const t = detail.theme as Theme;
                setThemeState(t);
                applyTheme(t);
            }
            if (detail.font_size) {
                const f = detail.font_size as FontSize;
                setFontSizeState(f);
                applyFontSize(f);
            }
        };

        window.addEventListener("preferences-changed", handlePreferencesChanged);
        return () => window.removeEventListener("preferences-changed", handlePreferencesChanged);
    }, []);

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next);
        applyTheme(next);
        localStorage.setItem("theme", next);
        syncPreference("theme", next);
    }, []);

    const setFontSize = useCallback((next: FontSize) => {
        setFontSizeState(next);
        applyFontSize(next);
        localStorage.setItem("font_size", next);
        syncPreference("font_size", next);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, fontSize, setTheme, setFontSize }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
