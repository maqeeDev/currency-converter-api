import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { ConversionService } from '../core/services/conversion.service';
import {
  ConversionState,
  initialConversionState,
  ConvertRequest,
  ConvertResponse,
  BatchConvertRequest,
  ConversionHistoryFilter,
  FavoritePair,
  PaginationParams,
} from '../models';

const FAVORITES_KEY = 'currency_favorites';
const RECENT_CONVERSIONS_KEY = 'recent_conversions';
const MAX_RECENT = 10;

export const ConversionStore = signalStore(
  { providedIn: 'root' },
  withState<ConversionState>(initialConversionState),
  withComputed((store) => ({
    // Get last conversion
    lastConversion: computed(() => store.recentConversions()[0] ?? null),
    // Check if pair is favorite
    isFavorite: computed(() => (from: string, to: string) =>
      store.favorites().some((f) => f.fromCurrency === from && f.toCurrency === to)
    ),
    // Get history page info
    historyPageInfo: computed(() => ({
      currentPage: store.currentPage(),
      pageSize: store.pageSize(),
      totalCount: store.totalHistoryCount(),
      totalPages: Math.ceil(store.totalHistoryCount() / store.pageSize()),
    })),
    // Has more history pages
    hasMoreHistory: computed(() => {
      const totalPages = Math.ceil(store.totalHistoryCount() / store.pageSize());
      return store.currentPage() < totalPages;
    }),
  })),
  withMethods((store) => {
    const conversionService = inject(ConversionService);

    // Load favorites from localStorage
    const loadFavorites = (): FavoritePair[] => {
      try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    };

    // Save favorites to localStorage
    const saveFavorites = (favorites: FavoritePair[]) => {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    };

    // Load recent from localStorage
    const loadRecentConversions = (): ConvertResponse[] => {
      try {
        const stored = localStorage.getItem(RECENT_CONVERSIONS_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    };

    // Save recent to localStorage
    const saveRecentConversions = (conversions: ConvertResponse[]) => {
      localStorage.setItem(RECENT_CONVERSIONS_KEY, JSON.stringify(conversions.slice(0, MAX_RECENT)));
    };

    return {
      // Initialize store with localStorage data
      initialize: () => {
        patchState(store, {
          favorites: loadFavorites(),
          recentConversions: loadRecentConversions(),
        });
      },

      // Convert currency
      convert: rxMethod<ConvertRequest>(
        pipe(
          tap(() => patchState(store, { isConverting: true, error: null })),
          switchMap((request) =>
            conversionService.convert(request).pipe(
              tap((response) => {
                const recent = [response, ...store.recentConversions()].slice(0, MAX_RECENT);
                saveRecentConversions(recent);
                patchState(store, {
                  recentConversions: recent,
                  isConverting: false,
                  error: null,
                });
              }),
              catchError((error) => {
                patchState(store, {
                  isConverting: false,
                  error: error.message || 'Conversion failed',
                });
                return of(null);
              })
            )
          )
        )
      ),

      // Batch convert
      batchConvert: rxMethod<BatchConvertRequest>(
        pipe(
          tap(() => patchState(store, { isConverting: true, error: null })),
          switchMap((request) =>
            conversionService.batchConvert(request).pipe(
              tap((response) => {
                const recent = [...response.conversions, ...store.recentConversions()].slice(0, MAX_RECENT);
                saveRecentConversions(recent);
                patchState(store, {
                  recentConversions: recent,
                  isConverting: false,
                  error: null,
                });
              }),
              catchError((error) => {
                patchState(store, {
                  isConverting: false,
                  error: error.message || 'Batch conversion failed',
                });
                return of(null);
              })
            )
          )
        )
      ),

      // Load conversion history
      loadHistory: rxMethod<{ params?: PaginationParams; filters?: ConversionHistoryFilter }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ params, filters }) =>
            conversionService.getHistory(params, filters).pipe(
              tap((response) => {
                patchState(store, {
                  history: response.items,
                  totalHistoryCount: response.totalCount,
                  currentPage: response.pageNumber,
                  pageSize: response.pageSize,
                  isLoading: false,
                  error: null,
                });
              }),
              catchError((error) => {
                patchState(store, {
                  isLoading: false,
                  error: error.message || 'Failed to load history',
                });
                return of(null);
              })
            )
          )
        )
      ),

      // Add to favorites
      addFavorite: (fromCurrency: string, toCurrency: string) => {
        const favorites = store.favorites();
        const exists = favorites.some(
          (f) => f.fromCurrency === fromCurrency && f.toCurrency === toCurrency
        );
        if (!exists) {
          const updated = [...favorites, { fromCurrency, toCurrency }];
          saveFavorites(updated);
          patchState(store, { favorites: updated });
        }
      },

      // Remove from favorites
      removeFavorite: (fromCurrency: string, toCurrency: string) => {
        const favorites = store.favorites().filter(
          (f) => !(f.fromCurrency === fromCurrency && f.toCurrency === toCurrency)
        );
        saveFavorites(favorites);
        patchState(store, { favorites });
      },

      // Toggle favorite
      toggleFavorite: (fromCurrency: string, toCurrency: string) => {
        const favorites = store.favorites();
        const exists = favorites.some(
          (f) => f.fromCurrency === fromCurrency && f.toCurrency === toCurrency
        );
        if (exists) {
          const updated = favorites.filter(
            (f) => !(f.fromCurrency === fromCurrency && f.toCurrency === toCurrency)
          );
          saveFavorites(updated);
          patchState(store, { favorites: updated });
        } else {
          const updated = [...favorites, { fromCurrency, toCurrency }];
          saveFavorites(updated);
          patchState(store, { favorites: updated });
        }
      },

      // Set page
      setPage: (page: number) => {
        patchState(store, { currentPage: page });
      },

      // Set page size
      setPageSize: (size: number) => {
        patchState(store, { pageSize: size, currentPage: 1 });
      },

      // Clear error
      clearError: () => {
        patchState(store, { error: null });
      },

      // Clear recent conversions
      clearRecent: () => {
        localStorage.removeItem(RECENT_CONVERSIONS_KEY);
        patchState(store, { recentConversions: [] });
      },
    };
  })
);
