import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppThemeService } from '../../../../../core/services/app-theme.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-spinner-container d-flex flex-column align-items-center justify-content-center" 
         [style.min-height]="minHeight">
      
      <!-- Spinner -->
      <div class="spinner-container mb-3">
        <div class="spinner-border text-primary" 
             [class]="spinnerSize"
             role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Loading Text -->
      <div class="loading-text text-center">
        <h6 class="text-body-emphasis mb-1" *ngIf="title">{{ title }}</h6>
        <p class="text-body-secondary mb-0" *ngIf="message">{{ message }}</p>
      </div>

      <!-- Progress Bar (if showProgress is true) -->
      <div *ngIf="showProgress" class="progress mt-3" style="width: 200px; height: 4px;">
        <div class="progress-bar bg-primary" 
             role="progressbar" 
             [style.width.%]="progress"
             [attr.aria-valuenow]="progress"
             aria-valuemin="0" 
             aria-valuemax="100">
        </div>
      </div>

    </div>
  `,
  styles: [`
    .loading-spinner-container {
      background-color: var(--theme-background);
      color: var(--theme-text);
      transition: var(--theme-animations);
    }

    .spinner-container {
      position: relative;
    }

    .spinner-border {
      border-color: var(--theme-primary);
      border-right-color: transparent;
    }

    .loading-text {
      max-width: 300px;
    }

    .progress {
      background-color: rgba(var(--theme-text), 0.1);
      border-radius: var(--theme-border-radius);
      overflow: hidden;
    }

    .progress-bar {
      background-color: var(--theme-primary);
      transition: width 0.6s ease;
      border-radius: var(--theme-border-radius);
    }

    /* Responsive adjustments */
    @media (max-width: 575.98px) {
      .loading-text h6 {
        font-size: 1rem;
      }
      
      .loading-text p {
        font-size: 0.875rem;
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() title: string = '';
  @Input() message: string = 'Loading...';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() minHeight: string = '200px';
  @Input() showProgress: boolean = false;
  @Input() progress: number = 0;

  constructor(private themeService: AppThemeService) {}

  get spinnerSize(): string {
    switch (this.size) {
      case 'sm': return 'spinner-border-sm';
      case 'lg': return 'spinner-border-lg';
      default: return '';
    }
  }
}