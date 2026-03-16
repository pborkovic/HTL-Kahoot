"use client";
import { Sun, Moon, Contrast, Eye } from "lucide-react";
import { useTheme, THEMES, type Theme } from "./ThemeProvider";
import { useState, useRef, useEffect } from "react";

function ThemeIcon({ theme }: { theme: Theme }) {
    if (theme === "dark")                    return <Moon className="w-4 h-4" />;
    if (theme === "high-contrast")           return <Contrast className="w-4 h-4" />;
    if (theme === "dark-high-contrast")      return <Contrast className="w-4 h-4" />;
    if (theme === "colorblind-friendly")     return <Eye className="w-4 h-4" />;
    if (theme === "dark-colorblind-friendly")return <Eye className="w-4 h-4" />;
    return <Sun className="w-4 h-4" />;
}

export function ThemeSelector() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-all duration-200 shadow-lg hover:shadow-xl"
                aria-label="Theme wechseln"
            >
                <ThemeIcon theme={theme} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50">
                    {THEMES.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => {
                                setTheme(t.value);
                                setIsOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors flex items-center gap-2 ${
                                theme === t.value
                                    ? "bg-primary text-primary-foreground"
                                    : "text-foreground hover:bg-muted"
                            }`}
                        >
                            <ThemeIcon theme={t.value} />
                            {t.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
