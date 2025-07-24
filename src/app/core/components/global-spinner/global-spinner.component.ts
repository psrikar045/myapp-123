import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-global-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="global-spinner-overlay" *ngIf="isLoading$ | async" [@fadeInOut]>
      <div class="spinner-container">
        <div class="spinner-wrapper">
          <!-- Modern CSS Spinner -->
          <div class="modern-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          
          <!-- Loading Text -->
          <div class="loading-text">
            <span class="loading-dots">Loading</span>
          </div>
          
          <!-- Brand Logo (Optional) -->
          <div class="brand-logo" *ngIf="showLogo">
            <img src="/assets/images/logo.png" alt="Marketify" />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .global-spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease-in-out;
    }
    
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    
    .spinner-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }
    
    /* Modern CSS Spinner */
    .modern-spinner {
      position: relative;
      width: 80px;
      height: 80px;
    }
    
    .spinner-ring {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 4px solid transparent;
      border-top: 4px solid var(--bs-primary, #007bff);
      border-radius: 50%;
      animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }
    
    .spinner-ring:nth-child(1) {
      animation-delay: -0.45s;
    }
    
    .spinner-ring:nth-child(2) {
      animation-delay: -0.3s;
      border-top-color: rgba(0, 123, 255, 0.7);
    }
    
    .spinner-ring:nth-child(3) {
      animation-delay: -0.15s;
      border-top-color: rgba(0, 123, 255, 0.5);
    }
    
    .spinner-ring:nth-child(4) {
      border-top-color: rgba(0, 123, 255, 0.3);
    }
    
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    
    /* Loading Text */
    .loading-text {
      font-size: 1.1rem;
      font-weight: 500;
      color: #6c757d;
      letter-spacing: 0.5px;
    }
    
    .loading-dots::after {
      content: '';
      animation: dots 1.5s steps(4, end) infinite;
    }
    
    @keyframes dots {
      0%, 20% {
        content: '';
      }
      40% {
        content: '.';
      }
      60% {
        content: '..';
      }
      80%, 100% {
        content: '...';
      }
    }
    
    /* Brand Logo */
    .brand-logo {
      margin-top: 1rem;
      opacity: 0.7;
    }
    
    .brand-logo img {
      max-width: 120px;
      height: auto;
      filter: grayscale(100%);
    }
    
    /* Fade Animation */
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    /* Dark Theme Support */
    [data-bs-theme="dark"] .global-spinner-overlay {
      background: rgba(33, 37, 41, 0.95);
    }
    
    [data-bs-theme="dark"] .loading-text {
      color: #adb5bd;
    }
    
    [data-bs-theme="dark"] .brand-logo img {
      filter: grayscale(100%) brightness(0.8);
    }
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
      .modern-spinner {
        width: 60px;
        height: 60px;
      }
      
      .loading-text {
        font-size: 1rem;
      }
      
      .brand-logo img {
        max-width: 100px;
      }
    }
    
    /* Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
      .spinner-ring {
        animation: none;
        border-top: 4px solid var(--bs-primary, #007bff);
      }
      
      .loading-dots::after {
        animation: none;
        content: '...';
      }
      
      .global-spinner-overlay {
        animation: none;
      }
    }
  `],
  animations: []
})
export class GlobalSpinnerComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  showLogo = true;
  private subscription?: Subscription;

  constructor(
    private spinnerService: SpinnerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isLoading$ = this.spinnerService.loading$;
  }

  ngOnInit(): void {
    // Only run in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.subscription = this.isLoading$.subscribe(loading => {
        if (loading) {
          // Prevent body scroll when loading
          document.body.style.overflow = 'hidden';
        } else {
          // Restore body scroll
          document.body.style.overflow = '';
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Cleanup - only in browser
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}