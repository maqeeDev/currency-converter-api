import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip auth header for auth endpoints (except logout and refresh)
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  if (isAuthEndpoint) {
    return next(req);
  }

  // Check if token needs refresh
  if (authService.shouldRefreshToken() && !isRefreshing) {
    isRefreshing = true;
    const refreshToken = authService.getRefreshToken();

    if (refreshToken) {
      return authService.refreshToken(refreshToken).pipe(
        switchMap(() => {
          isRefreshing = false;
          return next(addAuthHeader(req, authService));
        }),
        catchError((error) => {
          isRefreshing = false;
          authService.clearAuthData();
          router.navigate(['/auth/login']);
          return throwError(() => error);
        })
      );
    }
  }

  // Add auth header if token exists
  const token = authService.getAccessToken();
  if (token) {
    req = addAuthHeader(req, authService);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid
        authService.clearAuthData();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};

function addAuthHeader(req: HttpRequest<unknown>, authService: AuthService): HttpRequest<unknown> {
  const token = authService.getAccessToken();
  if (token) {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return req;
}
