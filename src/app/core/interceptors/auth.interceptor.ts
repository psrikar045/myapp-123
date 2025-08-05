import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const authToken = authService.getToken();
  const brandId = authService.getBrandId();

  // URLs that don't need authentication
  const publicUrls = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/verify-email',
    '/auth/check-username',
    '/auth/check-email',
    '/auth/google',
    '/auth/public-forward',
    '/test/',
    '/api/category/hierarchy',
    '/api/brands/all',
    '/api/brands/statistics',
    '/api/brands/search',
    '/api/brands/by-website',
    '/api/brands/by-name',
    '/api/brands/by-domain'
  ];

  // Check if the request URL is public
  const isPublicUrl = publicUrls.some(url => req.url.includes(url)) || 
                     // Allow access to individual brand endpoints (GET only)
                     (req.method === 'GET' && req.url.match(/\/api\/brands\/\d+$/));

  let authReq = req;

  // Add authentication headers for protected endpoints
  if (!isPublicUrl && authToken) {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authToken}`
    };

    // Add brand ID header if available and required
    if (brandId && (
      req.url.includes('/api/protected') ||
      req.url.includes('/api/brands') ||
      req.url.includes('/auth/profile')
    )) {
      headers['X-Brand-Id'] = brandId;
    }

    authReq = req.clone({
      setHeaders: headers
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        // Only redirect to login for protected endpoints, not public ones
        if (!isPublicUrl) {
          // Attempting token refresh for unauthorized request
          
          // Try to refresh token if available
          const refreshToken = authService.getRefreshToken();
          if (refreshToken && !req.url.includes('/auth/refresh')) {
            return authService.refreshToken().pipe(
              switchMap(() => {
                // Retry the original request with new token
                const newToken = authService.getToken();
                if (newToken) {
                  const retryReq = authReq.clone({
                    setHeaders: {
                      ...authReq.headers,
                      'Authorization': `Bearer ${newToken}`
                    }
                  });
                  return next(retryReq);
                }
                return throwError(() => error);
              }),
              catchError(() => {
                // Refresh failed, redirect to login
                authService.logout();
                router.navigate(['/login']);
                return throwError(() => error);
              })
            );
          } else {
            // No refresh token available, redirect to login
            console.error('No refresh token available. Redirecting to login.');
            authService.logout();
            router.navigate(['/login']);
          }
        } else {
          // For public URLs, just log the error and continue
          console.warn('401 error on public endpoint:', req.url, '- This is normal for unauthenticated requests');
        }
      }

      // Handle 403 Forbidden errors
      if (error.status === 403) {
        console.error('Access forbidden. Insufficient permissions.');
        // Optionally redirect to a "no permission" page
        // router.navigate(['/no-permission']);
      }

      // Handle 400 Bad Request for missing X-Brand-Id
      if (error.status === 400 && error.error?.message?.includes('X-Brand-Id')) {
        console.error('Missing X-Brand-Id header. This request requires a brand identifier.');
      }

      return throwError(() => error);
    })
  );
};
