import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppThemeService } from '../../../../../core/services/app-theme.service';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-display-container">
      <div class="alert border-0 shadow-sm" 
           [class]="alertClass"
           role="alert">
        
        <!-- Error Icon and Content -->
        <div class="d-flex align-items-start">
          <div class="error-icon me-3">
            <i [class]="iconClass" [style.font-size]="iconSize"></i>
          </div>
          
          <div class="error-content flex-grow-1">
            <!-- Title -->
            <h6 class="alert-heading mb-2" *ngIf="title">
              {{ title }}
            </h6>
            
            <!-- Message -->
            <div class="error-message mb-3" *ngIf="message">
              <p class="mb-0" [innerHTML]="message"></p>
            </div>
            
            <!-- Details (collapsible) -->
            <div *ngIf="details && showDetails" class="error-details">
              <hr class="my-2">
              <small class="text-muted">
                <strong>Details:</strong><br>
                {{ details }}
              </small>
            </div>
            
            <!-- Actions -->
            <div class="error-actions d-flex flex-wrap gap-2 mt-3" *ngIf="showRetry || showDetails !== undefined">
              <button *ngIf="showRetry" 
                      class="btn btn-outline-primary btn-sm rounded-pill"
                      (click)="onRetry()">
                <i class="bi bi-arrow-clockwise me-1"></i>
                {{ retryText }}
              </button>
              
              <button *ngIf="details" 
                      class="btn btn-outline-secondary btn-sm rounded-pill"
                      (click)="toggleDetails()">
                <i class="bi" [class.bi-chevron-down]="!showDetails" [class.bi-chevron-up]="showDetails"></i>
                {{ showDetails ? 'Hide Details' : 'Show Details' }}
              </button>
              
              <button *ngIf="showDismiss" 
                      class="btn btn-outline-secondary btn-sm rounded-pill"
                      (click)="onDismiss()">
                <i class="bi bi-x me-1"></i>
                Dismiss
              </button>
            </div>
          </div>
          
          <!-- Close Button -->
          <button *ngIf="dismissible" 
                  type="button" 
                  class="btn-close" 
                  (click)="onDismiss()"
                  [attr.aria-label]="'Close'">
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-display-container {
      background-color: var(--theme-background);
      color: var(--theme-text);
      transition: var(--theme-animations);
    }

    .alert {
      border-radius: var(--theme-border-radius);
      transition: var(--theme-animations);
    }

    .error-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
    }

    .error-content {
      word-break: break-word;
    }

    .error-details {
      background-color: rgba(var(--theme-text), 0.05);
      border-radius: var(--theme-border-radius);
      padding: 0.75rem;
      margin-top: 0.5rem;
    }

    .btn {
      font-weight: 500;
      transition: var(--theme-animations);
      border-radius: var(--theme-border-radius);

      &:hover {
        transform: translateY(-1px);
      }

      &.rounded-pill {
        border-radius: 50rem !important;
      }
    }

    .btn-close {
      background-color: transparent;
      border: none;
      opacity: 0.7;
      transition: var(--theme-animations);

      &:hover {
        opacity: 1;
        transform: scale(1.1);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 575.98px) {
      .error-actions {
        flex-direction: column;
        
        .btn {
          width: 100%;
          justify-content: center;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorDisplayComponent {
  @Input() type: 'error' | 'warning' | 'info' = 'error';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() details: string = '';
  @Input() showRetry: boolean = true;
  @Input() showDismiss: boolean = false;
  @Input() dismissible: boolean = false;
  @Input() retryText: string = 'Try Again';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() retry = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();

  showDetails: boolean = false;

  constructor(
    private themeService: AppThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  get alertClass(): string {
    const baseClass = 'alert-';
    switch (this.type) {
      case 'warning': return `${baseClass}warning`;
      case 'info': return `${baseClass}info`;
      default: return `${baseClass}danger`;
    }
  }

  get iconClass(): string {
    const baseClass = 'bi ';
    switch (this.type) {
      case 'warning': return `${baseClass}bi-exclamation-triangle text-warning`;
      case 'info': return `${baseClass}bi-info-circle text-info`;
      default: return `${baseClass}bi-exclamation-triangle text-danger`;
    }
  }

  get iconSize(): string {
    switch (this.size) {
      case 'sm': return '1rem';
      case 'lg': return '1.5rem';
      default: return '1.25rem';
    }
  }

  onRetry(): void {
    this.retry.emit();
  }

  onDismiss(): void {
    this.dismiss.emit();
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
    this.cdr.markForCheck();
  }
}