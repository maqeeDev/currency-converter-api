import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/auth/guards/auth.guard';
import { adminGuard } from './core/auth/guards/admin.guard';

export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // Auth routes (public only)
  {
    path: 'auth',
    canActivate: [publicGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
        title: 'Login - Currency Converter',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
        title: 'Register - Currency Converter',
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  // Protected routes (authenticated users)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Dashboard - Currency Converter',
  },

  // Currency routes
  {
    path: 'currencies',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/currencies/currency-list/currency-list.component').then(
            (m) => m.CurrencyListComponent
          ),
        title: 'Currencies - Currency Converter',
      },
      {
        path: 'rates',
        loadComponent: () =>
          import('./features/currencies/currency-rates/currency-rates.component').then(
            (m) => m.CurrencyRatesComponent
          ),
        title: 'Exchange Rates - Currency Converter',
      },
    ],
  },

  // Conversion routes
  {
    path: 'convert',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/convert/converter/converter.component').then(
        (m) => m.ConverterComponent
      ),
    title: 'Convert - Currency Converter',
  },

  // History route
  {
    path: 'history',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/convert/history/history.component').then((m) => m.HistoryComponent),
    title: 'Conversion History - Currency Converter',
  },

  // Admin routes (admin only)
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
        title: 'Admin Dashboard - Currency Converter',
      },
      {
        path: 'health',
        loadComponent: () =>
          import('./features/admin/admin-health/admin-health.component').then(
            (m) => m.AdminHealthComponent
          ),
        title: 'System Health - Currency Converter',
      },
      {
        path: 'cache',
        loadComponent: () =>
          import('./features/admin/admin-cache/admin-cache.component').then(
            (m) => m.AdminCacheComponent
          ),
        title: 'Cache Management - Currency Converter',
      },
      {
        path: 'logs',
        loadComponent: () =>
          import('./features/admin/admin-logs/admin-logs.component').then(
            (m) => m.AdminLogsComponent
          ),
        title: 'System Logs - Currency Converter',
      },
    ],
  },

  // 404 Not Found
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: '404 Not Found - Currency Converter',
  },
];
