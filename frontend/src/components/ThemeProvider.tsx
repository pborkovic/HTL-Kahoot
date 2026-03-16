"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme =
    | "light"
    | "dark"
    | "high-contrast"
    | "dark-high-contrast"
    | "colorblind-friendly"
    | "dark-colorblind-friendly";

export const THEMES: { value: Theme; label: string }[] = [
    { value: "light",                   label: "Helles Design"        },
    { value: "dark",                    label: "Dunkles Design"       },
    { value: "high-contrast",           label: "Hoher Kontrast"       },
    { value: "dark-high-contrast",      label: "Dunkler Kontrast"     },
    { value: "colorblind-friendly",     label: "Farbenblind"      },
    { value: "dark-colorblind-friendly",label: "Farbenblind Dunkel" },
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

const ThemeContext = createContext<{
    theme: Theme;
    setTheme: (theme: Theme) => void;
}>({ theme: "light", setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");

    useEffect(() => {
        const saved = localStorage.getItem("theme") as Theme | null;
        const initial = saved ?? "light";
        setThemeState(initial);
        applyTheme(initial);
    }, []);

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next);
        applyTheme(next);
        localStorage.setItem("theme", next);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
