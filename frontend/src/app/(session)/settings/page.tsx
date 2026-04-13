"use client";

import type { ReactNode } from "react";
import { Settings, Sun, Moon, Contrast, Eye, Type, Globe } from "lucide-react";
import { useTheme, THEMES, FONT_SIZES, type Theme, type FontSize } from "@/components/ThemeProvider";
import { useAuth } from "@/context/AuthContext";

function ThemeIcon({ theme }: { theme: Theme }): ReactNode {
    if (theme === "dark")                    return <Moon className="size-5" />;
    if (theme === "high-contrast")           return <Contrast className="size-5" />;
    if (theme === "dark-high-contrast")      return <Contrast className="size-5" />;
    if (theme === "colorblind-friendly")     return <Eye className="size-5" />;
    if (theme === "dark-colorblind-friendly") return <Eye className="size-5" />;
    return <Sun className="size-5" />;
}

export default function SettingsPage(): ReactNode {
    const { theme, setTheme, fontSize, setFontSize } = useTheme();
    const { user } = useAuth();

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Settings className="size-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold">Einstellungen</h1>
                    <p className="text-sm text-muted-foreground">
                        Persönliche Einstellungen für {user?.username ?? user?.email ?? "dein Konto"}
                    </p>
                </div>
            </div>

            {/* Theme */}
            <section className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Design</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {THEMES.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => setTheme(t.value)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-colors cursor-pointer ${
                                theme === t.value
                                    ? "border-primary bg-primary/10 text-primary font-medium"
                                    : "border-border/40 bg-card/60 text-foreground hover:bg-card hover:border-border"
                            }`}
                        >
                            <ThemeIcon theme={t.value} />
                            <span>{t.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Font Size */}
            <section className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    <Type className="size-4 inline-block mr-1.5 -mt-0.5" />
                    Schriftgröße
                </h2>
                <div className="flex gap-2">
                    {FONT_SIZES.map((f) => (
                        <button
                            key={f.value}
                            type="button"
                            onClick={() => setFontSize(f.value)}
                            className={`flex-1 px-4 py-3 rounded-xl border text-sm transition-colors cursor-pointer ${
                                fontSize === f.value
                                    ? "border-primary bg-primary/10 text-primary font-medium"
                                    : "border-border/40 bg-card/60 text-foreground hover:bg-card hover:border-border"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Language (placeholder — currently only German) */}
            <section className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    <Globe className="size-4 inline-block mr-1.5 -mt-0.5" />
                    Sprache
                </h2>
                <div className="flex gap-2">
                    <button
                        type="button"
                        className="flex-1 px-4 py-3 rounded-xl border text-sm border-primary bg-primary/10 text-primary font-medium cursor-default"
                    >
                        Deutsch
                    </button>
                    <button
                        type="button"
                        disabled
                        className="flex-1 px-4 py-3 rounded-xl border text-sm border-border/40 bg-card/60 text-muted-foreground opacity-50 cursor-not-allowed"
                    >
                        English (bald)
                    </button>
                </div>
            </section>
        </div>
    );
}
