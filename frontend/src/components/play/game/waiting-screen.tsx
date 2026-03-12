import { Loader2 } from "lucide-react";

interface WaitingScreenProps {
    message: string;
}

export function WaitingScreen({ message }: WaitingScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="size-8 text-primary animate-spin" />
            <p className="text-white/60 text-sm">{message}</p>
        </div>
    );
}
