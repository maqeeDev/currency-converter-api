import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard to protect routes that require admin role
 */
export const adminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  // Then check if admin
  if (authService.isAdmin()) {
    return true;
  }

  // User is not admin, redirect to dashboard with error
  router.navigate(['/dashboard'], {
    queryParams: { error: 'unauthorized' },
  });
  return false;
};

/**
 * Guard to check for specific roles
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    const user = authService.getStoredUser();
    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    router.navigate(['/dashboard'], {
      queryParams: { error: 'unauthorized' },
    });
    return false;
  };
};
