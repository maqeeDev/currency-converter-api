import { computed } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';

const THEME_KEY = 'app_theme';
const SIDEBAR_KEY = 'sidebar_collapsed';

export type Theme = 'light' | 'dark';

export interface UiState {
  theme: Theme;
  sidebarCollapsed: boolean;
  isLoading: boolean;
  loadingMessage: string | null;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  dismissible?: boolean;
}

const initialUiState: UiState = {
  theme: 'light',
  sidebarCollapsed: false,
  isLoading: false,
  loadingMessage: null,
  notifications: [],
};

export const UiStore = signalStore(
  { providedIn: 'root' },
  withState<UiState>(initialUiState),
  withComputed((store) => ({
    isDarkMode: computed(() => store.theme() === 'dark'),
    hasNotifications: computed(() => store.notifications().length > 0),
    latestNotification: computed(() => store.notifications()[0] ?? null),
  })),
  withMethods((store) => {
    // Load theme from localStorage
    const loadTheme = (): Theme => {
      try {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === 'dark' || stored === 'light') {
          return stored;
        }
        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
        return 'light';
      } catch {
        return 'light';
      }
    };

    // Load sidebar state from localStorage
    const loadSidebarState = (): boolean => {
      try {
        const stored = localStorage.getItem(SIDEBAR_KEY);
        return stored === 'true';
      } catch {
        return false;
      }
    };

    // Apply theme to document
    const applyTheme = (theme: Theme) => {
      document.documentElement.classList.remove('light-theme', 'dark-theme');
      document.documentElement.classList.add(`${theme}-theme`);
      document.documentElement.setAttribute('data-theme', theme);
    };

    return {
      // Initialize UI state
      initialize: () => {
        const theme = loadTheme();
        const sidebarCollapsed = loadSidebarState();
        applyTheme(theme);
        patchState(store, { theme, sidebarCollapsed });
      },

      // Toggle theme
      toggleTheme: () => {
        const newTheme = store.theme() === 'light' ? 'dark' : 'light';
        localStorage.setItem(THEME_KEY, newTheme);
        applyTheme(newTheme);
        patchState(store, { theme: newTheme });
      },

      // Set specific theme
      setTheme: (theme: Theme) => {
        localStorage.setItem(THEME_KEY, theme);
        applyTheme(theme);
        patchState(store, { theme });
      },

      // Toggle sidebar
      toggleSidebar: () => {
        const collapsed = !store.sidebarCollapsed();
        localStorage.setItem(SIDEBAR_KEY, collapsed.toString());
        patchState(store, { sidebarCollapsed: collapsed });
      },

      // Set sidebar collapsed state
      setSidebarCollapsed: (collapsed: boolean) => {
        localStorage.setItem(SIDEBAR_KEY, collapsed.toString());
        patchState(store, { sidebarCollapsed: collapsed });
      },

      // Show loading
      showLoading: (message?: string) => {
        patchState(store, {
          isLoading: true,
          loadingMessage: message ?? null,
        });
      },

      // Hide loading
      hideLoading: () => {
        patchState(store, {
          isLoading: false,
          loadingMessage: null,
        });
      },

      // Add notification
      addNotification: (notification: Omit<Notification, 'id'>) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = {
          ...notification,
          id,
          duration: notification.duration ?? 5000,
          dismissible: notification.dismissible ?? true,
        };

        patchState(store, {
          notifications: [newNotification, ...store.notifications()],
        });

        // Auto-dismiss after duration
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            patchState(store, {
              notifications: store.notifications().filter((n) => n.id !== id),
            });
          }, newNotification.duration);
        }

        return id;
      },

      // Remove notification
      removeNotification: (id: string) => {
        patchState(store, {
          notifications: store.notifications().filter((n) => n.id !== id),
        });
      },

      // Clear all notifications
      clearNotifications: () => {
        patchState(store, { notifications: [] });
      },

      // Helper methods for common notification types
      showSuccess: (message: string, duration?: number) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const notification: Notification = {
          id,
          type: 'success',
          message,
          duration: duration ?? 5000,
          dismissible: true,
        };
        patchState(store, {
          notifications: [notification, ...store.notifications()],
        });
        if (notification.duration && notification.duration > 0) {
          setTimeout(() => {
            patchState(store, {
              notifications: store.notifications().filter((n) => n.id !== id),
            });
          }, notification.duration);
        }
      },

      showError: (message: string, duration?: number) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const notification: Notification = {
          id,
          type: 'error',
          message,
          duration: duration ?? 8000,
          dismissible: true,
        };
        patchState(store, {
          notifications: [notification, ...store.notifications()],
        });
        if (notification.duration && notification.duration > 0) {
          setTimeout(() => {
            patchState(store, {
              notifications: store.notifications().filter((n) => n.id !== id),
            });
          }, notification.duration);
        }
      },

      showWarning: (message: string, duration?: number) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const notification: Notification = {
          id,
          type: 'warning',
          message,
          duration: duration ?? 6000,
          dismissible: true,
        };
        patchState(store, {
          notifications: [notification, ...store.notifications()],
        });
        if (notification.duration && notification.duration > 0) {
          setTimeout(() => {
            patchState(store, {
              notifications: store.notifications().filter((n) => n.id !== id),
            });
          }, notification.duration);
        }
      },

      showInfo: (message: string, duration?: number) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const notification: Notification = {
          id,
          type: 'info',
          message,
          duration: duration ?? 5000,
          dismissible: true,
        };
        patchState(store, {
          notifications: [notification, ...store.notifications()],
        });
        if (notification.duration && notification.duration > 0) {
          setTimeout(() => {
            patchState(store, {
              notifications: store.notifications().filter((n) => n.id !== id),
            });
          }, notification.duration);
        }
      },
    };
  })
);
