import Echo from "laravel-echo";
import Pusher from "pusher-js";

if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).Pusher = Pusher;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

function getToken(): string {
    if (typeof window === "undefined"){
        return "";
    }
    return localStorage.getItem("auth_token") ?? "";
}

function createEcho(): Echo<"reverb"> {
    const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";

    return new Echo({
        broadcaster: "reverb",
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? "htl-kahoot-key",
        wsHost: typeof window !== "undefined" ? window.location.hostname : "localhost",
        wsPort: isSecure ? 443 : 80,
        wssPort: 443,
        forceTLS: isSecure,
        enabledTransports: ["ws", "wss"],
        authEndpoint: `${API_URL}/broadcasting/auth`,
        auth: {
            headers: {
                get Authorization() {
                    return `Bearer ${getToken()}`;
                },
                Accept: "application/json",
            },
        },
    });
}

/**
 * Global instance of Echo.
 */
let echoInstance: Echo<"reverb"> | null = null;

/**
 * Returns the singleton Echo instance, creating it if it doesn't exist.
 * 
 * @returns The Echo instance.
 */
export function getEcho(): Echo<"reverb"> {
    if (!echoInstance) {
        echoInstance = createEcho();
    }
    return echoInstance;
}

/**
 * Disconnects and resets the singleton Echo instance.
 */
export function resetEcho(): void {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
}
