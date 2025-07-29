import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { SpinnerService } from '../services/spinner.service';

// Track active requests globally
let activeRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const spinnerService = inject(SpinnerService);

  // Skip loading for certain requests
  const skipLoadingUrls = [
    '/assets/',
    '/api/health',
    '/api/ping'
  ];

  const shouldSkipLoading = 
    req.headers.has('X-Skip-Loading') ||
    skipLoadingUrls.some(url => req.url.includes(url)) ||
    req.method === 'GET' && req.url.includes('/api/search/suggestions'); // Skip for search suggestions

  if (shouldSkipLoading) {
    return next(req);
  }

  // Increment active requests and show spinner
  activeRequests++;
  if (activeRequests === 1) {
    spinnerService.show();
  }

  return next(req).pipe(
    finalize(() => {
      // Decrement active requests and hide spinner when no more requests
      activeRequests--;
      if (activeRequests === 0) {
        // Small delay to prevent flickering for rapid requests
        setTimeout(() => {
          if (activeRequests === 0) {
            spinnerService.hide();
          }
        }, 100);
      }
    })
  );
};