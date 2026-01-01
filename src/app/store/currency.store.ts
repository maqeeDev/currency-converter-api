import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of, interval, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyService } from '../core/services/currency.service';
import {
  CurrencyState,
  initialCurrencyState,
  CurrencyDto,
  ExchangeRatesResponse,
} from '../models';
import { environment } from '../../environments/environment';

export const CurrencyStore = signalStore(
  { providedIn: 'root' },
  withState<CurrencyState>(initialCurrencyState),
  withComputed((store) => ({
    // Get currency by code
    getCurrencyByCode: computed(() => (code: string) =>
      store.currencies().find((c) => c.code === code)
    ),
    // Get rate for a target currency
    getRateForCurrency: computed(() => (targetCode: string) =>
      store.rates()?.rates[targetCode] ?? null
    ),
    // Get all rate entries as array
    ratesArray: computed(() => {
      const rates = store.rates();
      if (!rates) return [];
      return Object.entries(rates.rates).map(([code, rate]) => ({
        code,
        rate,
        baseCurrency: rates.baseCurrency,
      }));
    }),
    // Check if data is stale (older than 1 hour)
    isStale: computed(() => {
      const lastUpdated = store.lastUpdated();
      if (!lastUpdated) return true;
      const oneHour = 60 * 60 * 1000;
      return Date.now() - new Date(lastUpdated).getTime() > oneHour;
    }),
    // Get currencies for dropdown
    currencyOptions: computed(() =>
      store.currencies().map((c) => ({
        value: c.code,
        label: `${c.code} - ${c.name}`,
        symbol: c.symbol,
      }))
    ),
  })),
  withMethods((store) => {
    const currencyService = inject(CurrencyService);

    return {
      // Load all currencies
      loadCurrencies: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            currencyService.getAllCurrencies().pipe(
              tap((currencies) => {
                patchState(store, {
                  currencies,
                  isLoading: false,
                  error: null,
                });
              }),
              catchError((error) => {
                patchState(store, {
                  isLoading: false,
                  error: error.message || 'Failed to load currencies',
                });
                return of(null);
              })
            )
          )
        )
      ),

      // Load exchange rates for base currency
      loadRates: rxMethod<string | void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((baseCurrency) => {
            const base = baseCurrency || store.baseCurrency();
            return currencyService.getRates(base).pipe(
              tap((rates) => {
                patchState(store, {
                  rates,
                  baseCurrency: base,
                  lastUpdated: new Date(),
                  isLoading: false,
                  error: null,
                });
              }),
              catchError((error) => {
                patchState(store, {
                  isLoading: false,
                  error: error.message || 'Failed to load exchange rates',
                });
                return of(null);
              })
            );
          })
        )
      ),

      // Set base currency and reload rates
      setBaseCurrency: (baseCurrency: string) => {
        patchState(store, { baseCurrency });
      },

      // Toggle selected currency
      toggleSelectedCurrency: (code: string) => {
        const current = store.selectedCurrencies();
        const updated = current.includes(code)
          ? current.filter((c) => c !== code)
          : [...current, code];
        patchState(store, { selectedCurrencies: updated });
      },

      // Set selected currencies
      setSelectedCurrencies: (codes: string[]) => {
        patchState(store, { selectedCurrencies: codes });
      },

      // Clear error
      clearError: () => {
        patchState(store, { error: null });
      },

      // Start auto-refresh polling
      startAutoRefresh: rxMethod<void>(
        pipe(
          switchMap(() =>
            interval(environment.ratePollInterval).pipe(
              startWith(0),
              tap(() => {
                const base = store.baseCurrency();
                currencyService.getRates(base).subscribe({
                  next: (rates) => {
                    patchState(store, {
                      rates,
                      lastUpdated: new Date(),
                    });
                  },
                });
              })
            )
          )
        )
      ),
    };
  })
);
