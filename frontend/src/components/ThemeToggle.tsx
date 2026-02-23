"use client";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const next = () => {
        const order: ("system" | "light" | "dark")[] = ["system", "light", "dark"];
        const current = order.indexOf(theme);
        setTheme(order[(current + 1) % 3]);
    };

    const icon = theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "💻";

    return (
        <button
            onClick={next}
            className="p-2 rounded-lg bg-secondary text-white hover:opacity-80 transition"
            aria-label="Theme wechseln"
        >
            {icon}
        </button>
    );
}
