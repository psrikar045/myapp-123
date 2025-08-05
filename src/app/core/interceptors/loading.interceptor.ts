import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { SpinnerService } from '../services/spinner.service';

// Track active requests globally
let activeRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const spinnerService = inject(SpinnerService);
  const injector = inject(Injector);

  // Skip loading for certain requests
  const skipLoadingUrls = [
    '/assets/',
    '/api/health',
    '/api/ping',
    '/myapp/forward',
    '/public-forward'
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
            try {
              // Check if injector is still available before accessing service
              const currentSpinnerService = injector.get(SpinnerService);
              currentSpinnerService.hide();
            } catch (error: unknown) {
              // Injector has been destroyed, ignore the error silently
              // This is expected during SSR cleanup and doesn't need logging
              const errorMessage = error instanceof Error ? error.message : String(error);
              if (errorMessage.includes('NG0205') || errorMessage.includes('Injector has already been destroyed')) {
                // Expected during SSR cleanup, ignore silently
                return;
              }
            }
          }
        }, 100);
      }
    })
  );
};