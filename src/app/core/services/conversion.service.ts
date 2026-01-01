import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ConvertRequest,
  ConvertResponse,
  BatchConvertRequest,
  BatchConvertResponse,
  ConversionHistoryDto,
  ConversionHistoryFilter,
  PagedResponse,
  PaginationParams,
} from '../../models';

@Injectable({
  providedIn: 'root',
})
export class ConversionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/convert`;

  /**
   * Convert amount from one currency to another
   */
  convert(request: ConvertRequest): Observable<ConvertResponse> {
    return this.http
      .post<ConvertResponse>(this.apiUrl, request)
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Batch convert multiple amounts
   */
  batchConvert(request: BatchConvertRequest): Observable<BatchConvertResponse> {
    return this.http
      .post<BatchConvertResponse>(`${this.apiUrl}/batch`, request)
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Get conversion history with optional filters
   */
  getHistory(
    params?: PaginationParams,
    filters?: ConversionHistoryFilter
  ): Observable<PagedResponse<ConversionHistoryDto>> {
    let httpParams = new HttpParams();

    // Pagination
    if (params?.pageNumber) {
      httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
    }
    if (params?.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    // Filters
    if (filters?.startDate) {
      httpParams = httpParams.set('startDate', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      httpParams = httpParams.set('endDate', filters.endDate.toISOString());
    }
    if (filters?.fromCurrency) {
      httpParams = httpParams.set('fromCurrency', filters.fromCurrency);
    }
    if (filters?.toCurrency) {
      httpParams = httpParams.set('toCurrency', filters.toCurrency);
    }
    if (filters?.minAmount !== undefined) {
      httpParams = httpParams.set('minAmount', filters.minAmount.toString());
    }
    if (filters?.maxAmount !== undefined) {
      httpParams = httpParams.set('maxAmount', filters.maxAmount.toString());
    }

    return this.http
      .get<PagedResponse<ConversionHistoryDto>>(`${this.apiUrl}/history`, {
        params: httpParams,
      })
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Get recent conversions (last 24 hours)
   */
  getRecentConversions(limit: number = 5): Observable<ConversionHistoryDto[]> {
    return this.http
      .get<ConversionHistoryDto[]>(`${this.apiUrl}/recent`, {
        params: new HttpParams().set('limit', limit.toString()),
      })
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Export conversion history as CSV
   */
  exportHistory(filters?: ConversionHistoryFilter): Observable<Blob> {
    let httpParams = new HttpParams();

    if (filters?.startDate) {
      httpParams = httpParams.set('startDate', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      httpParams = httpParams.set('endDate', filters.endDate.toISOString());
    }
    if (filters?.fromCurrency) {
      httpParams = httpParams.set('fromCurrency', filters.fromCurrency);
    }
    if (filters?.toCurrency) {
      httpParams = httpParams.set('toCurrency', filters.toCurrency);
    }

    return this.http
      .get(`${this.apiUrl}/history/export`, {
        params: httpParams,
        responseType: 'blob',
      })
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
