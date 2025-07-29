import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: Date;
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private errorsSubject = new BehaviorSubject<AppError[]>([]);
  public errors$ = this.errorsSubject.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  addError(message: string, type: AppError['type'] = 'error', details?: any): string {
    const error: AppError = {
      id: this.generateId(),
      message,
      type,
      timestamp: new Date(),
      details
    };

    const currentErrors = this.errorsSubject.value;
    this.errorsSubject.next([...currentErrors, error]);

    // Auto-remove success and info messages after 5 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        this.removeError(error.id);
      }, 5000);
    }

    return error.id;
  }

  removeError(id: string): void {
    const currentErrors = this.errorsSubject.value;
    const filteredErrors = currentErrors.filter(error => error.id !== id);
    this.errorsSubject.next(filteredErrors);
  }

  clearAllErrors(): void {
    this.errorsSubject.next([]);
  }

  // Convenience methods
  showError(message: string, details?: any): string {
    return this.addError(message, 'error', details);
  }

  showWarning(message: string, details?: any): string {
    return this.addError(message, 'warning', details);
  }

  showInfo(message: string, details?: any): string {
    return this.addError(message, 'info', details);
  }

  showSuccess(message: string, details?: any): string {
    return this.addError(message, 'success', details);
  }

  // Handle HTTP errors
  handleHttpError(error: any): string {
    let message = 'An unexpected error occurred';
    
    if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    return this.showError(message, error);
  }
}