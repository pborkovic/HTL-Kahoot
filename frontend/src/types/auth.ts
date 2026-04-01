export interface Permission {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  permissions?: Permission[];
}

export interface User {
  id: string;
  external_id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  class_name: string | null;
  auth_provider: string;
  is_active: boolean;
  last_login_at: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

export interface AuthResponse {
  user: User;
  token: string;
}
