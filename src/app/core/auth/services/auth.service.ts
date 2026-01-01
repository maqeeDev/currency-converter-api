import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  UserDto,
  TokenPayload,
  ApiResponse,
} from '../../../models';
import { jwtDecode } from 'jwt-decode';

const AUTH_STORAGE_KEY = 'auth_data';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  /**
   * Login with username and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Login failed');
        }
        return response.data;
      }),
      tap((data) => this.storeAuthData(data)),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Register a new user
   */
  register(userData: RegisterRequest): Observable<UserDto> {
    return this.http.post<ApiResponse<UserDto>>(`${this.apiUrl}/register`, userData).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Registration failed');
        }
        return response.data;
      }),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Refresh the access token using refresh token
   */
  refreshToken(refreshToken: string): Observable<LoginResponse> {
    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/refresh-token`, request).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Token refresh failed');
        }
        return response.data;
      }),
      tap((data) => this.storeAuthData(data)),
      catchError((error) => throwError(() => this.handleError(error)))
    );
  }

  /**
   * Logout user and clear stored data
   */
  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/logout`, { refreshToken }).pipe(
      map(() => void 0),
      tap(() => this.clearAuthData()),
      catchError((error) => {
        // Clear data even if logout API fails
        this.clearAuthData();
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Store authentication data in session storage
   */
  storeAuthData(response: LoginResponse): void {
    const authData = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
      expiresAt: Date.now() + response.expiresIn * 1000,
    };
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    const data = this.getStoredAuthData();
    return data?.accessToken ?? null;
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    const data = this.getStoredAuthData();
    return data?.refreshToken ?? null;
  }

  /**
   * Get stored user data
   */
  getStoredUser(): UserDto | null {
    const data = this.getStoredAuthData();
    return data?.user ?? null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const expirationTime = decoded.exp * 1000;
      return Date.now() >= expirationTime;
    } catch {
      return true;
    }
  }

  /**
   * Check if token needs refresh (within threshold)
   */
  shouldRefreshToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const expirationTime = decoded.exp * 1000;
      const threshold = environment.tokenRefreshThreshold * 1000;
      return Date.now() >= expirationTime - threshold;
    } catch {
      return false;
    }
  }

  /**
   * Decode JWT token to get payload
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      return jwtDecode<TokenPayload>(token);
    } catch {
      return null;
    }
  }

  /**
   * Check if user has admin role
   */
  isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role === 'Admin';
  }

  /**
   * Clear all authentication data
   */
  clearAuthData(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }

  /**
   * Get stored auth data from session storage
   */
  private getStoredAuthData(): {
    accessToken: string;
    refreshToken: string;
    user: UserDto;
    expiresAt: number;
  } | null {
    const data = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    const httpError = error as { error?: { message?: string }; message?: string };
    const message = httpError.error?.message || httpError.message || 'An error occurred';
    return new Error(message);
  }
}
