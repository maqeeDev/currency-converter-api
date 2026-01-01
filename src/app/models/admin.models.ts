// API usage statistics
export interface ApiUsageStats {
  totalRequests: number;
  requestsToday: number;
  averageResponseTime: number;
  cacheHitRate: number;
  externalApiCalls: number;
  activeUsers: number;
  topEndpoints: EndpointStat[];
  requestsTrend: TrendData[];
}

// Endpoint statistics
export interface EndpointStat {
  endpoint: string;
  method: string;
  count: number;
  averageTime: number;
}

// Trend data for charts
export interface TrendData {
  date: string;
  value: number;
}

// System health status
export interface HealthStatus {
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  totalDuration: string;
  entries: HealthEntry[];
}

// Health check entry
export interface HealthEntry {
  name: string;
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  description?: string;
  duration: string;
  tags?: string[];
}

// Cache statistics
export interface CacheStats {
  totalItems: number;
  memoryUsage: string;
  hitCount: number;
  missCount: number;
  hitRate: number;
  recentItems: CacheItem[];
}

// Cache item
export interface CacheItem {
  key: string;
  size: string;
  expiresAt: Date;
  createdAt: Date;
}

// Log entry
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'Error' | 'Warning' | 'Information' | 'Debug';
  message: string;
  errorCode?: string;
  stackTrace?: string;
  userId?: string;
  endpoint?: string;
  correlationId?: string;
}

// Log filter
export interface LogFilter {
  level?: string;
  startDate?: Date;
  endDate?: Date;
  endpoint?: string;
  search?: string;
}

// Admin state for store
export interface AdminState {
  apiUsage: ApiUsageStats | null;
  health: HealthStatus | null;
  cacheStats: CacheStats | null;
  logs: LogEntry[];
  isLoading: boolean;
  error: string | null;
}

// Initial admin state
export const initialAdminState: AdminState = {
  apiUsage: null,
  health: null,
  cacheStats: null,
  logs: [],
  isLoading: false,
  error: null,
};
