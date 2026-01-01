import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CurrencyDto,
  ExchangeRateDto,
  ExchangeRatesResponse,
  PagedResponse,
  PaginationParams,
} from '../../models';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private readonly http = inject(HttpClient);
  private readonly currenciesUrl = `${environment.apiUrl}/currencies`;
  private readonly ratesUrl = `${environment.apiUrl}/rates`;

  /**
   * Get paginated list of all currencies
   */
  getCurrencies(params?: PaginationParams): Observable<PagedResponse<CurrencyDto>> {
    let httpParams = new HttpParams();
    if (params?.pageNumber) {
      httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
    }
    if (params?.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    return this.http
      .get<PagedResponse<CurrencyDto>>(this.currenciesUrl, { params: httpParams })
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Get all currencies (no pagination)
   */
  getAllCurrencies(): Observable<CurrencyDto[]> {
    return this.http
      .get<CurrencyDto[]>(`${this.currenciesUrl}/all`)
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Get a specific currency by code
   */
  getCurrencyByCode(code: string): Observable<CurrencyDto> {
    return this.http
      .get<CurrencyDto>(`${this.currenciesUrl}/${code}`)
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Get all exchange rates for a base currency
   */
  getRates(baseCurrency: string = 'USD'): Observable<ExchangeRatesResponse> {
    return this.http
      .get<ExchangeRatesResponse>(`${this.ratesUrl}`, {
        params: new HttpParams().set('base', baseCurrency),
      })
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Get specific exchange rate between two currencies
   */
  getRate(baseCurrency: string, targetCurrency: string): Observable<ExchangeRateDto> {
    return this.http
      .get<ExchangeRateDto>(`${this.ratesUrl}/${baseCurrency}/${targetCurrency}`)
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
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
