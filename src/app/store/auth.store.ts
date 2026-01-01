import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { AuthService } from '../core/auth/services/auth.service';
import {
  AuthState,
  initialAuthState,
  LoginRequest,
  RegisterRequest,
  UserDto,
} from '../models';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialAuthState),
  withComputed((store) => ({
    isLoggedIn: computed(() => store.isAuthenticated() && store.user() !== null),
    userRole: computed(() => store.user()?.role ?? null),
    isAdmin: computed(() => store.user()?.role === 'Admin'),
    username: computed(() => store.user()?.username ?? ''),
    userEmail: computed(() => store.user()?.email ?? ''),
  })),
  withMethods((store) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return {
      // Initialize auth state from session storage
      initializeAuth: () => {
        const user = authService.getStoredUser();
        const accessToken = authService.getAccessToken();
        const refreshToken = authService.getRefreshToken();
        const isAuthenticated = authService.isAuthenticated();

        patchState(store, {
          user,
          accessToken,
          refreshToken,
          isAuthenticated,
          isLoading: false,
          error: null,
        });
      },

      // Login method
      login: rxMethod<{ credentials: LoginRequest; returnUrl?: string }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ credentials, returnUrl }) =>
            authService.login(credentials).pipe(
              tap((response) => {
                patchState(store, {
                  user: response.user,
                  accessToken: response.accessToken,
                  refreshToken: response.refreshToken,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                });
                router.navigate([returnUrl || '/dashboard']);
              }),
              catchError((error) => {
                patchState(store, {
                  isLoading: false,
                  error: error.message || 'Login failed',
                });
                return of(null);
              })
            )
          )
        )
      ),

      // Register method
      register: rxMethod<RegisterRequest>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((userData) =>
            authService.register(userData).pipe(
              tap(() => {
                patchState(store, { isLoading: false, error: null });
                router.navigate(['/auth/login'], {
                  queryParams: { registered: 'true' },
                });
              }),
              catchError((error) => {
                patchState(store, {
                  isLoading: false,
                  error: error.message || 'Registration failed',
                });
                return of(null);
              })
            )
          )
        )
      ),

      // Logout method
      logout: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() =>
            authService.logout().pipe(
              tap(() => {
                patchState(store, { ...initialAuthState });
                router.navigate(['/auth/login']);
              }),
              catchError(() => {
                // Clear state even if API call fails
                patchState(store, { ...initialAuthState });
                router.navigate(['/auth/login']);
                return of(null);
              })
            )
          )
        )
      ),

      // Refresh token method
      refreshToken: rxMethod<void>(
        pipe(
          switchMap(() => {
            const refreshToken = authService.getRefreshToken();
            if (!refreshToken) {
              return of(null);
            }
            return authService.refreshToken(refreshToken).pipe(
              tap((response) => {
                patchState(store, {
                  accessToken: response.accessToken,
                  refreshToken: response.refreshToken,
                  user: response.user,
                });
              }),
              catchError(() => {
                patchState(store, { ...initialAuthState });
                router.navigate(['/auth/login']);
                return of(null);
              })
            );
          })
        )
      ),

      // Update user data
      updateUser: (user: UserDto) => {
        patchState(store, { user });
      },

      // Clear error
      clearError: () => {
        patchState(store, { error: null });
      },

      // Force logout (for token expiration)
      forceLogout: () => {
        authService.clearAuthData();
        patchState(store, { ...initialAuthState });
        router.navigate(['/auth/login'], {
          queryParams: { expired: 'true' },
        });
      },
    };
  })
);
