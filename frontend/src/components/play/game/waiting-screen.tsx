import { Loader2 } from "lucide-react";

/**
 * Props for the WaitingScreen component.
 */
interface WaitingScreenProps {
    /** The message to display while waiting. */
    message: string;
}

/**
 * WaitingScreen component for displaying a loading state with a message.
 *
 * @param props - The component props.
 * @returns The WaitingScreen component.
 */
export function WaitingScreen({ message }: WaitingScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="size-8 text-primary animate-spin" />
            <p className="text-white/60 text-sm">{message}</p>
        </div>
    );
}
