/**
 * Base URL for the API, defaulting to "/api" if not specified in environment variables.
 */
const API_URL: string = process.env.NEXT_PUBLIC_API_URL ?? "/api";

/**
 * Key used for storing the authentication token in local storage.
 */
const TOKEN_KEY: string = "auth_token";

/**
 * Represents the structure of an error response from the API.
 */
interface ApiErrorBody {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Retrieves the stored authentication token from local storage.
 * 
 * @returns The token string if found, otherwise null.
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Stores the authentication token in local storage.
 * 
 * @param token - The authentication token to store.
 */
export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Removes the stored authentication token from local storage.
 */
export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Sets an authentication cookie by calling the internal auth token endpoint.
 * 
 * @param token - The authentication token.
 * @param roles - The roles associated with the user.
 */
export async function setAuthCookie(token: string, roles: string[]): Promise<void> {
  await fetch("/api/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, roles }),
  });
}

/**
 * Removes the authentication cookie by calling the internal auth token endpoint.
 */
export async function removeAuthCookie(): Promise<void> {
  await fetch("/api/auth/token", { method: "DELETE" });
}

/**
 * Performs a file upload to the API using multipart/form-data.
 * 
 * @template T - The expected response type.
 * @param path - The API endpoint path.
 * @param formData - The form data containing the file and other fields.
 * @returns A promise resolving to the API response.
 * @throws {ApiError} If the API request fails.
 */
export async function apiUpload<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const token = getStoredToken();

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Performs a generic API request using fetch.
 * 
 * @template T - The expected response type.
 * @param path - The API endpoint path.
 * @param options - Additional fetch options.
 * @returns A promise resolving to the API response.
 * @throws {ApiError} If the API request fails.
 */
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Custom error class for API-related errors.
 */
export class ApiError extends Error {
  /**
   * Creates an instance of ApiError.
   * 
   * @param status - The HTTP status code.
   * @param message - The error message.
   */
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Returns a user-friendly error message based on the HTTP status code.
 * 
 * @param status - The HTTP status code.
 * @returns A localized error message.
 */
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
