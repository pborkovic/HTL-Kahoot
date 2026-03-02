export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: string;
  external_id: string;
  email: string;
  username: string | null;
  auth_provider: string;
  is_active: boolean;
  last_login_at: string;
  roles: Role[];
}

export interface AuthResponse {
  user: User;
  token: string;
}
