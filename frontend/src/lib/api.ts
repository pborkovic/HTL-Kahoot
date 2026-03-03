const API_URL: string = process.env.NEXT_PUBLIC_API_URL ?? "/api";

const TOKEN_KEY: string = "auth_token";

interface ApiErrorBody {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken();

  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body: ApiErrorBody | null = await response.json().catch((): null => null);

    let errorMessage: string;
    if (body?.errors) {
      errorMessage = Object.values(body.errors).flat().join(". ");
    } else if (body?.message) {
      errorMessage = body.message;
    } else if (body?.error) {
      errorMessage = body.error;
    } else {
      errorMessage = friendlyStatusMessage(response.status);
    }

    throw new ApiError(response.status, errorMessage);
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function friendlyStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return "Die Anfrage war ungültig. Bitte überprüfe deine Eingaben.";
    case 401:
      return "Du bist nicht angemeldet. Bitte melde dich erneut an.";
    case 403:
      return "Du hast keine Berechtigung für diese Aktion.";
    case 404:
      return "Die angeforderte Ressource wurde nicht gefunden.";
    case 422:
      return "Die eingegebenen Daten sind ungültig.";
    case 429:
      return "Zu viele Anfragen. Bitte warte einen Moment.";
    case 500:
      return "Ein Serverfehler ist aufgetreten. Bitte versuche es später erneut.";
    case 502:
      return "Der Server ist vorübergehend nicht erreichbar.";
    case 503:
      return "Der Service ist derzeit nicht verfügbar. Bitte versuche es später erneut.";
    default:
      return `Ein unerwarteter Fehler ist aufgetreten (${status}).`;
  }
}
