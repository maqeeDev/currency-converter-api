export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001/api/v1',
  tokenRefreshThreshold: 300, // 5 minutes before expiry
  ratePollInterval: 60000, // 60 seconds
  maxRetries: 3,
  retryDelay: 1000,
};
