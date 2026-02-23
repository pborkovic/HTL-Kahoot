"use client";
import { useTheme } from "@/components/ThemeProvider";

export default function Login() {
    const { theme, setTheme } = useTheme();
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="absolute top-4 right-4">
                <button
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    className="p-2.5 rounded-full bg-text/10 hover:bg-text/20 text-text transition-all duration-200"
                    aria-label="Theme wechseln"
                >
                    {theme === "dark" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                        </svg>
                    )}
                </button>
            </div>
            <div className="w-full max-w-md p-15 space-y-8 rounded-lg border-2 border-primary">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-text">Willkommen bei GamQuiz</h1>
                    <p className="mt-2 text-text/60">Melde dich mit deinem Microsoft-Konto an</p>
                </div>

                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={() => {
                            // TODO: Redirect to backend OAuth endpoint
                            window.location.href = "/api/auth/microsoft";
                        }}
                        className="w-full py-3 px-4 bg-[#2f2f2f] hover:bg-[#1a1a1a] text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 flex items-center justify-center gap-3"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 23 23"
                            className="w-5 h-5"
                        >
                            <path fill="#f35325" d="M1 1h10v10H1z" />
                            <path fill="#81bc06" d="M12 1h10v10H12z" />
                            <path fill="#05a6f0" d="M1 12h10v10H1z" />
                            <path fill="#ffba08" d="M12 12h10v10H12z" />
                        </svg>
                        Mit Microsoft anmelden
                    </button>
                </div>

                <div className="text-center text-sm text-text/50">
                    <p>
                        Mit der Anmeldung akzeptierst du unsere{" "}
                        <a href="/terms" className="text-accent hover:underline">
                            Nutzungsbedingungen
                        </a>{" "}
                        und{" "}
                        <a href="/privacy" className="text-accent hover:underline">
                            Datenschutzrichtlinie
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
