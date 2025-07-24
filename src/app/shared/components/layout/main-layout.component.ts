import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../footer/footer.component';
import { SpinnerComponent } from '../../../core/components/spinner/spinner.component';
import { SpinnerService } from '../../../core/services/spinner.service';
import { LayoutService } from '../../../core/services/layout.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SpinnerComponent
  ],
  template: `
    <!-- Loading Spinner -->
    <app-spinner *ngIf="spinnerService.loading$ | async"></app-spinner>
    
    <!-- Main Layout Container -->
    <div class="main-layout" [attr.data-bs-theme]="currentTheme">
      <!-- Header -->
      <app-header 
        *ngIf="showHeader$ | async"
        class="main-header">
      </app-header>
      
      <!-- Main Content Area -->
      <main 
        class="main-content"
        [class.with-header]="showHeader$ | async"
        [class.with-footer]="showFooter$ | async"
        role="main">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Footer -->
      <app-footer 
        *ngIf="showFooter$ | async"
        class="main-footer">
      </app-footer>
    </div>
  `,
  styles: [`
    .main-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .main-header {
      flex-shrink: 0;
      z-index: var(--z-fixed);
    }
    
    .main-content {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
      
      &.with-header {
        padding-top: 72px; /* Header height */
      }
      
      &.with-footer {
        padding-bottom: 0; /* Footer handles its own spacing */
      }
    }
    
    .main-footer {
      flex-shrink: 0;
      margin-top: auto;
    }
    
    /* Responsive adjustments */
    @media (max-width: 767.98px) {
      .main-content.with-header {
        padding-top: 60px; /* Smaller header on mobile */
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Inject services
  public spinnerService = inject(SpinnerService);
  private layoutService = inject(LayoutService);
  private themeService = inject(ThemeService);
  
  // Layout state
  showHeader$ = this.layoutService.showHeader$;
  showFooter$ = this.layoutService.showFooter$;
  currentTheme = 'light';
  
  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => this.currentTheme = isDark ? 'dark' : 'light');
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}