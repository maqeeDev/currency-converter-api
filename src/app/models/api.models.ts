// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: Date;
}

// Paginated response wrapper
export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Error response from API
export interface ErrorResponse {
  errorCode: string;
  message: string;
  correlationId: string;
  path: string;
  timestamp?: Date;
}

// Pagination request parameters
export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

// Sort parameters
export interface SortParams {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Combined query parameters
export interface QueryParams extends PaginationParams, SortParams {
  search?: string;
  [key: string]: string | number | boolean | undefined;
}
