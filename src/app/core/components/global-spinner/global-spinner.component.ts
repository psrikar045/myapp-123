import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Observable, Subscription, interval } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-global-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="global-spinner-overlay" *ngIf="isLoading$ | async" [@fadeInOut]>
      <div class="spinner-container">
        <div class="spinner-wrapper">
          <!-- Enhanced Modern Spinner with RIVO9 Branding -->
          <div class="RIVO9-spinner">
            <!-- Outer Ring -->
            <div class="spinner-ring outer-ring"></div>
            <!-- Middle Ring -->
            <div class="spinner-ring middle-ring"></div>
            <!-- Inner Ring -->
            <div class="spinner-ring inner-ring"></div>
            <!-- Center Logo -->
            <div class="center-logo">
              <span class="logo-letter">R9</span>
            </div>
          </div>
          
          <!-- Loading Text with Dynamic Messages -->
          <div class="loading-text">
            <span class="loading-message">{{ currentMessage }}</span>
            <div class="loading-progress">
              <div class="progress-dots">
                <span class="dot" [class.active]="dotIndex >= 0"></span>
                <span class="dot" [class.active]="dotIndex >= 1"></span>
                <span class="dot" [class.active]="dotIndex >= 2"></span>
              </div>
            </div>
          </div>
          
          <!-- Brand Text -->
          <div class="brand-text">
            <span class="brand-name">RIVO9</span>
            <span class="brand-tagline">Marketing Hub</span>
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
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
    
    /* Enhanced RIVO9 Spinner */
    .RIVO9-spinner {
      position: relative;
      width: 100px;
      height: 100px;
      margin-bottom: 2rem;
    }
    
    .spinner-ring {
      position: absolute;
      border-radius: 50%;
      border: 3px solid transparent;
    }
    
    .outer-ring {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-top: 3px solid #4f46e5;
      border-right: 3px solid rgba(79, 70, 229, 0.3);
      animation: spin 2s linear infinite;
    }
    
    .middle-ring {
      top: 15px;
      left: 15px;
      width: 70px;
      height: 70px;
      border-top: 3px solid #7c3aed;
      border-left: 3px solid rgba(124, 58, 237, 0.3);
      animation: spin 1.5s linear infinite reverse;
    }
    
    .inner-ring {
      top: 30px;
      left: 30px;
      width: 40px;
      height: 40px;
      border-top: 2px solid #06b6d4;
      border-bottom: 2px solid rgba(6, 182, 212, 0.3);
      animation: spin 1s linear infinite;
    }
    
    .center-logo {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
      animation: pulse 2s ease-in-out infinite;
    }
    
    .logo-letter {
      color: white;
      font-size: 14px;
      font-weight: 800;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.1); }
    }
    
    /* Enhanced Loading Text */
    .loading-text {
      text-align: center;
      margin-bottom: 1rem;
    }
    
    .loading-message {
      font-size: 1.2rem;
      font-weight: 600;
      color: #374151;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
      display: block;
    }
    
    .loading-progress {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .progress-dots {
      display: flex;
      gap: 0.5rem;
    }
    
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #d1d5db;
      transition: all 0.3s ease;
    }
    
    .dot.active {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      transform: scale(1.2);
    }
    
    /* Brand Text */
    .brand-text {
      text-align: center;
      margin-top: 1rem;
    }
    
    .brand-name {
      display: block;
      font-size: 1.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.25rem;
    }
    
    .brand-tagline {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.1em;
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
      background: linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.95) 100%);
    }
    
    [data-bs-theme="dark"] .loading-message {
      color: #f3f4f6;
    }
    
    [data-bs-theme="dark"] .brand-tagline {
      color: #9ca3af;
    }
    
    [data-bs-theme="dark"] .dot {
      background: #4b5563;
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
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ]
})
export class GlobalSpinnerComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  currentMessage = 'Loading';
  dotIndex = 0;
  
  private subscription?: Subscription;
  private messageSubscription?: Subscription;
  private dotSubscription?: Subscription;
  
  private loadingMessages = [
    'Loading',
    'Fetching data',
    'Processing',
    'Almost ready',
    'Preparing content'
  ];
  private messageIndex = 0;

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
          this.startAnimations();
        } else {
          // Restore body scroll
          document.body.style.overflow = '';
          this.stopAnimations();
        }
      });
    }
  }
  
  private startAnimations(): void {
    // Animate progress dots
    this.dotSubscription = interval(500).subscribe(() => {
      this.dotIndex = (this.dotIndex + 1) % 4;
    });
    
    // Cycle through loading messages
    this.messageSubscription = interval(2000).subscribe(() => {
      this.messageIndex = (this.messageIndex + 1) % this.loadingMessages.length;
      this.currentMessage = this.loadingMessages[this.messageIndex];
    });
  }
  
  private stopAnimations(): void {
    if (this.dotSubscription) {
      this.dotSubscription.unsubscribe();
      this.dotSubscription = undefined;
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = undefined;
    }
    // Reset to initial state
    this.dotIndex = 0;
    this.messageIndex = 0;
    this.currentMessage = 'Loading';
  }

  ngOnDestroy(): void {
    // Cleanup - only in browser
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
    
    // Unsubscribe from all subscriptions
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.stopAnimations();
  }
}