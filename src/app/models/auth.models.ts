// User roles
export type UserRole = 'Admin' | 'User' | 'ReadOnly';

// Login request
export interface LoginRequest {
  username: string;
  password: string;
}

// Register request
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// User DTO
export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

// Login response
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserDto;
}

// Refresh token request
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Token payload (decoded JWT)
export interface TokenPayload {
  uid: string;
  role: UserRole;
  exp: number;
  iat: number;
}

// Auth state for store
export interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial auth state
export const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};
