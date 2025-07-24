import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-spinner-container" [class.overlay]="overlay">
      <div class="spinner-wrapper">
        <div class="spinner-border" 
             [class]="'spinner-border-' + size + ' text-' + color" 
             role="status">
          <span class="visually-hidden">{{ message }}</span>
        </div>
        <p class="loading-message mt-2 mb-0" *ngIf="showMessage">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      
      &.overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        z-index: 9999;
      }
    }
    
    .spinner-wrapper {
      text-align: center;
    }
    
    .loading-message {
      color: #6c757d;
      font-size: 0.9rem;
    }
    
    .spinner-border-sm {
      width: 1.5rem;
      height: 1.5rem;
    }
    
    .spinner-border-lg {
      width: 4rem;
      height: 4rem;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color: string = 'primary';
  @Input() message: string = 'Loading...';
  @Input() showMessage: boolean = true;
  @Input() overlay: boolean = false;
}