import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiUsageStats,
  HealthStatus,
  CacheStats,
  LogEntry,
  LogFilter,
  PagedResponse,
  PaginationParams,
} from '../../models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  /**
   * Get API usage statistics
   */
  getApiUsage(): Observable<ApiUsageStats> {
    return this.http
      .get<ApiUsageStats>(`${this.apiUrl}/api-usage`)
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Get system health status
   */
  getHealth(): Observable<HealthStatus> {
    return this.http
      .get<HealthStatus>(`${this.apiUrl}/health`)
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): Observable<CacheStats> {
    return this.http
      .get<CacheStats>(`${this.apiUrl}/cache/stats`)
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/cache/clear`, {})
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Clear specific cache by key pattern
   */
  clearCache(pattern: string): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/cache/clear`, { pattern })
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Force sync exchange rates from external API
   */
  syncRates(): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/sync-rates`, {})
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Get recent logs with optional filters
   */
  getLogs(
    params?: PaginationParams,
    filters?: LogFilter
  ): Observable<PagedResponse<LogEntry>> {
    let httpParams = new HttpParams();

    // Pagination
    if (params?.pageNumber) {
      httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
    }
    if (params?.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    // Filters
    if (filters?.level) {
      httpParams = httpParams.set('level', filters.level);
    }
    if (filters?.startDate) {
      httpParams = httpParams.set('startDate', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      httpParams = httpParams.set('endDate', filters.endDate.toISOString());
    }
    if (filters?.endpoint) {
      httpParams = httpParams.set('endpoint', filters.endpoint);
    }
    if (filters?.search) {
      httpParams = httpParams.set('search', filters.search);
    }

    return this.http
      .get<PagedResponse<LogEntry>>(`${this.apiUrl}/logs`, { params: httpParams })
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Export logs as CSV
   */
  exportLogs(filters?: LogFilter): Observable<Blob> {
    let httpParams = new HttpParams();

    if (filters?.level) {
      httpParams = httpParams.set('level', filters.level);
    }
    if (filters?.startDate) {
      httpParams = httpParams.set('startDate', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      httpParams = httpParams.set('endDate', filters.endDate.toISOString());
    }

    return this.http
      .get(`${this.apiUrl}/logs/export`, {
        params: httpParams,
        responseType: 'blob',
      })
      .pipe(catchError((error) => throwError(() => this.handleError(error))));
  }

  /**
   * Clear logs
   */
  clearLogs(): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/logs`)
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
