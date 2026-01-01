import { HttpInterceptorFn } from '@angular/common/http';
import { tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  // Only log in development mode
  if (environment.production) {
    return next(req);
  }

  const startTime = Date.now();
  const correlationId = generateCorrelationId();

  // Add correlation ID header
  const requestWithCorrelation = req.clone({
    setHeaders: {
      'X-Correlation-ID': correlationId,
    },
  });

  console.group(`%c[HTTP] ${req.method} ${req.url}`, 'color: #2196F3; font-weight: bold');
  console.log('%cCorrelation ID:', 'color: #9E9E9E', correlationId);
  console.log('%cRequest Headers:', 'color: #9E9E9E', req.headers.keys().map(key => `${key}: ${req.headers.get(key)}`));

  if (req.body) {
    console.log('%cRequest Body:', 'color: #9E9E9E', req.body);
  }

  return next(requestWithCorrelation).pipe(
    tap({
      next: (event) => {
        if ('status' in event) {
          const duration = Date.now() - startTime;
          console.log(
            `%cResponse Status: ${event.status}`,
            event.status >= 200 && event.status < 300 ? 'color: #4CAF50' : 'color: #F44336'
          );
          console.log('%cDuration:', 'color: #9E9E9E', `${duration}ms`);

          if ('body' in event && event.body) {
            console.log('%cResponse Body:', 'color: #9E9E9E', event.body);
          }
        }
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        console.error('%cError:', 'color: #F44336', error);
        console.log('%cDuration:', 'color: #9E9E9E', `${duration}ms`);
      },
    }),
    finalize(() => {
      console.groupEnd();
    })
  );
};

function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
