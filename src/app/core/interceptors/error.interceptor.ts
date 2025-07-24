import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from '../services/error-handler.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const errorHandler = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';
      let shouldRedirect = false;

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Network Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Bad Request - Please check your input';
            break;
          case 401:
            errorMessage = 'Your session has expired. Please log in again.';
            shouldRedirect = true;
            break;
          case 403:
            errorMessage = 'You do not have permission to access this resource';
            break;
          case 404:
            errorMessage = 'The requested resource was not found';
            break;
          case 422:
            errorMessage = error.error?.message || 'Validation failed';
            break;
          case 429:
            errorMessage = 'Too many requests. Please try again later.';
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || `HTTP Error ${error.status}: ${error.statusText}`;
        }
      }

      // Log error for debugging
      console.error('HTTP Error Interceptor:', {
        status: error.status,
        message: errorMessage,
        url: req.url,
        error: error
      });

      // Show error to user (except for 401 which will redirect)
      if (!shouldRedirect) {
        errorHandler.showError(errorMessage, {
          status: error.status,
          url: req.url,
          timestamp: new Date()
        });
      }

      // Handle authentication errors
      if (shouldRedirect) {
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url }
        });
      }

      return throwError(() => error);
    })
  );
};