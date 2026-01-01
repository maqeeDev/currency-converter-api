export const environment = {
  production: true,
  apiUrl: '/api/v1', // Relative URL for production (reverse proxy)
  tokenRefreshThreshold: 300, // 5 minutes before expiry
  ratePollInterval: 60000, // 60 seconds
  maxRetries: 3,
  retryDelay: 1000,
};
