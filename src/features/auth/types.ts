export interface SessionPayload {
  username: string;
  role: 'admin';
  createdAt: number;
  lastActive: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  authenticated: boolean;
  username: string | null;
}
