import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  url?: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private errorLog: ErrorInfo[] = [];

  constructor() {}

  /**
   * Handle HTTP errors
   */
  handleHttpError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
      errorCode = 'CLIENT_ERROR';
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad request';
          errorCode = 'BAD_REQUEST';
          break;
        case 401:
          errorMessage = 'You are not authorized to access this resource';
          errorCode = 'UNAUTHORIZED';
          break;
        case 403:
          errorMessage = 'Access denied';
          errorCode = 'FORBIDDEN';
          break;
        case 404:
          errorMessage = 'The requested resource was not found';
          errorCode = 'NOT_FOUND';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation error';
          errorCode = 'VALIDATION_ERROR';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later';
          errorCode = 'RATE_LIMIT';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later';
          errorCode = 'SERVER_ERROR';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable';
          errorCode = 'SERVICE_UNAVAILABLE';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.statusText}`;
          errorCode = `HTTP_${error.status}`;
      }
    }

    const errorInfo: ErrorInfo = {
      message: errorMessage,
      code: errorCode,
      details: error,
      timestamp: new Date(),
      url: error.url || undefined
    };

    this.logError(errorInfo);
    this.showErrorNotification(errorMessage);

    return throwError(() => errorInfo);
  }

  /**
   * Handle application errors
   */
  handleError(error: any, context?: string): void {
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'APP_ERROR';

    if (error instanceof Error) {
      errorMessage = error.message;
      errorCode = error.name;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    const errorInfo: ErrorInfo = {
      message: errorMessage,
      code: errorCode,
      details: { error, context },
      timestamp: new Date()
    };

    this.logError(errorInfo);
    this.showErrorNotification(errorMessage);
  }

  /**
   * Handle validation errors
   */
  handleValidationErrors(errors: Record<string, string[]>): void {
    const errorMessages = Object.values(errors).flat();
    const message = errorMessages.length > 1 
      ? `Multiple validation errors occurred`
      : errorMessages[0];

    const errorInfo: ErrorInfo = {
      message,
      code: 'VALIDATION_ERROR',
      details: errors,
      timestamp: new Date()
    };

    this.logError(errorInfo);
    this.showErrorNotification(message);
  }

  /**
   * Show success notification
   */
  showSuccess(message: string, duration = 3000): void {
    this.showBootstrapToast(message, 'success', duration);
  }

  /**
   * Show warning notification
   */
  showWarning(message: string, duration = 5000): void {
    this.showBootstrapToast(message, 'warning', duration);
  }

  /**
   * Show info notification
   */
  showInfo(message: string, duration = 4000): void {
    this.showBootstrapToast(message, 'info', duration);
  }

  /**
   * Show error notification
   */
  private showErrorNotification(message: string, duration = 6000): void {
    this.showBootstrapToast(message, 'error', duration);
  }

  /**
   * Show Bootstrap toast notification
   */
  private showBootstrapToast(message: string, type: 'success' | 'error' | 'warning' | 'info', duration = 4000): void {
    const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
    const toastId = 'toast-' + Date.now();
    
    const iconMap = {
      success: 'check-circle-fill',
      error: 'exclamation-triangle-fill',
      warning: 'exclamation-triangle-fill',
      info: 'info-circle-fill'
    };
    
    const bgColorMap = {
      success: 'success',
      error: 'danger',
      warning: 'warning',
      info: 'primary'
    };
    
    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center text-white bg-${bgColorMap[type]} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <i class="bi bi-${iconMap[type]} me-2"></i>
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Initialize and show toast
    const toastElement = document.getElementById(toastId);
    if (toastElement) {
      const toast = new (window as any).bootstrap.Toast(toastElement, {
        autohide: true,
        delay: duration
      });
      toast.show();
      
      // Remove toast element after it's hidden
      toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
      });
    }
  }

  /**
   * Create toast container if it doesn't exist
   */
  private createToastContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
  }

  /**
   * Log error to console and store in memory
   */
  private logError(errorInfo: ErrorInfo): void {
    console.error('Error occurred:', errorInfo);
    
    // Store in memory (limit to last 100 errors)
    this.errorLog.unshift(errorInfo);
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(0, 100);
    }

    // In production, you might want to send errors to a logging service
    if (this.isProduction()) {
      this.sendToLoggingService(errorInfo);
    }
  }

  /**
   * Get error log
   */
  getErrorLog(): ErrorInfo[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Check if running in production
   */
  private isProduction(): boolean {
    return false; // Replace with actual environment check
  }

  /**
   * Send error to external logging service
   */
  private sendToLoggingService(errorInfo: ErrorInfo): void {
    // Implement external logging service integration
    // e.g., Sentry, LogRocket, etc.
    console.log('Would send to logging service:', errorInfo);
  }

  /**
   * Create user-friendly error messages
   */
  getUserFriendlyMessage(error: any): string {
    if (error?.code) {
      switch (error.code) {
        case 'NETWORK_ERROR':
          return 'Please check your internet connection and try again';
        case 'TIMEOUT_ERROR':
          return 'The request took too long. Please try again';
        case 'UNAUTHORIZED':
          return 'Please log in to continue';
        case 'FORBIDDEN':
          return 'You don\'t have permission to perform this action';
        case 'NOT_FOUND':
          return 'The requested item could not be found';
        case 'VALIDATION_ERROR':
          return 'Please check your input and try again';
        case 'SERVER_ERROR':
          return 'Something went wrong on our end. Please try again later';
        default:
          return error.message || 'An unexpected error occurred';
      }
    }

    return error?.message || 'An unexpected error occurred';
  }

  /**
   * Retry mechanism for failed operations
   */
  retry<T>(
    operation: () => Observable<T>,
    maxRetries = 3,
    delay = 1000
  ): Observable<T> {
    return new Observable(observer => {
      let attempts = 0;

      const attempt = () => {
        operation().subscribe({
          next: value => observer.next(value),
          complete: () => observer.complete(),
          error: error => {
            attempts++;
            if (attempts < maxRetries) {
              setTimeout(attempt, delay * attempts);
            } else {
              observer.error(error);
            }
          }
        });
      };

      attempt();
    });
  }
}