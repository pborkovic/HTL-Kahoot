export function WaitingHeader() {
    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-primary font-semibold tracking-widest uppercase text-xs">
                GamQuiz
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Wartebereich
            </h1>
            <p className="text-sm text-white/50">
                Du bist drin! Warte, bis der Lehrer das Spiel startet.
            </p>
        </div>
    );
}
