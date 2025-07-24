import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ErrorHandlerService, AppError } from '../../services/error-handler.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-boundary-container" *ngIf="(errors$ | async)?.length">
      <div class="error-alerts">
        <div *ngFor="let error of errors$ | async; trackBy: trackByErrorId" 
             class="alert alert-dismissible fade show"
             [ngClass]="getAlertClass(error.type)"
             role="alert">
          
          <!-- Error Icon -->
          <i class="bi me-2" [ngClass]="getIconClass(error.type)"></i>
          
          <!-- Error Message -->
          <span class="error-message">{{ error.message }}</span>
          
          <!-- Timestamp -->
          <small class="error-timestamp ms-2 opacity-75">
            {{ error.timestamp | date:'short' }}
          </small>
          
          <!-- Close Button -->
          <button type="button" 
                  class="btn-close" 
                  [attr.aria-label]="'Close ' + error.type + ' message'"
                  (click)="removeError(error.id)">
          </button>
          
          <!-- Error Details (for development) -->
          <div *ngIf="showDetails && error.details" class="error-details mt-2">
            <details>
              <summary class="text-muted small">Technical Details</summary>
              <pre class="mt-2 small">{{ error.details | json }}</pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-boundary-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      width: 100%;
    }
    
    .error-alerts {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .alert {
      margin-bottom: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border: none;
      border-left: 4px solid;
      animation: slideInRight 0.3s ease-out;
    }
    
    .alert-danger {
      background-color: #f8d7da;
      color: #721c24;
      border-left-color: #dc3545;
    }
    
    .alert-warning {
      background-color: #fff3cd;
      color: #856404;
      border-left-color: #ffc107;
    }
    
    .alert-info {
      background-color: #d1ecf1;
      color: #0c5460;
      border-left-color: #17a2b8;
    }
    
    .alert-success {
      background-color: #d4edda;
      color: #155724;
      border-left-color: #28a745;
    }
    
    .error-message {
      font-weight: 500;
    }
    
    .error-timestamp {
      font-size: 0.75rem;
    }
    
    .error-details pre {
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 0.25rem;
      padding: 0.5rem;
      font-size: 0.7rem;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .btn-close {
      font-size: 0.8rem;
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
      .error-boundary-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }
      
      .alert {
        font-size: 0.9rem;
      }
      
      .error-timestamp {
        display: block;
        margin-top: 0.25rem;
      }
    }
    
    /* Dark Theme Support */
    [data-bs-theme="dark"] .alert-danger {
      background-color: #2c0b0e;
      color: #ea868f;
    }
    
    [data-bs-theme="dark"] .alert-warning {
      background-color: #332701;
      color: #ffda6a;
    }
    
    [data-bs-theme="dark"] .alert-info {
      background-color: #032830;
      color: #6edff6;
    }
    
    [data-bs-theme="dark"] .alert-success {
      background-color: #0a2e0b;
      color: #75b798;
    }
    
    [data-bs-theme="dark"] .error-details pre {
      background-color: rgba(255, 255, 255, 0.1);
      color: #e9ecef;
    }
    
    /* Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
      .alert {
        animation: none;
      }
    }
  `]
})
export class ErrorBoundaryComponent implements OnInit {
  @Input() showDetails = false; // Show technical details in development
  
  errors$: Observable<AppError[]>;

  constructor(
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {
    this.errors$ = this.errorHandler.errors$;
  }

  ngOnInit(): void {
    // Set showDetails based on environment
    this.showDetails = !this.isProduction();
  }

  removeError(id: string): void {
    this.errorHandler.removeError(id);
  }

  trackByErrorId(index: number, error: AppError): string {
    return error.id;
  }

  getAlertClass(type: AppError['type']): string {
    const classMap = {
      error: 'alert-danger',
      warning: 'alert-warning',
      info: 'alert-info',
      success: 'alert-success'
    };
    return classMap[type] || 'alert-info';
  }

  getIconClass(type: AppError['type']): string {
    const iconMap = {
      error: 'bi-exclamation-triangle-fill',
      warning: 'bi-exclamation-triangle',
      info: 'bi-info-circle',
      success: 'bi-check-circle'
    };
    return iconMap[type] || 'bi-info-circle';
  }

  private isProduction(): boolean {
    // Check if we're in production mode
    return typeof window !== 'undefined' && 
           (window as any)['__env__']?.production === true;
  }
}