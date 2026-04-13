/**
 * Interface for user preferences.
 */
export interface UserPreferences {
  /** The theme preference (e.g., 'light', 'dark'). */
  theme?: string;
  /** The language preference (e.g., 'en', 'de'). */
  language?: string;
  /** The font size preference. */
  font_size?: string;
}

/**
 * Interface for a user permission.
 */
export interface Permission {
  /** The unique identifier of the permission. */
  id: string;
  /** The name of the permission. */
  name: string;
}

/**
 * Interface for a user role.
 */
export interface Role {
  /** The unique identifier of the role. */
  id: string;
  /** The name of the role. */
  name: string;
  /** The list of permissions associated with this role. */
  permissions?: Permission[];
}

/**
 * Interface for a user.
 */
export interface User {
  /** The unique identifier of the user. */
  id: string;
  /** The external identifier of the user (e.g., from an OAuth provider). */
  external_id: string;
  /** The email address of the user. */
  email: string;
  /** The username of the user. */
  username: string | null;
  /** The display name of the user. */
  display_name: string | null;
  /** The URL to the user's avatar image. */
  avatar_url: string | null;
  /** The class name associated with the user. */
  class_name: string | null;
  /** The user's preferences. */
  preferences: UserPreferences | null;
  /** The authentication provider used by the user. */
  auth_provider: string;
  /** Indicates if the user account is active. */
  is_active: boolean;
  /** The timestamp of the last login. */
  last_login_at: string;
  /** The timestamp when the user was created. */
  created_at: string;
  /** The timestamp when the user was last updated. */
  updated_at: string;
  /** The roles assigned to the user. */
  roles: Role[];
}

/**
 * Interface for the authentication response.
 */
export interface AuthResponse {
  /** The authenticated user. */
  user: User;
  /** The authentication token. */
  token: string;
}
