import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subject, takeUntil, combineLatest } from 'rxjs';

import { SidenavService } from '../../services/sidenav.service';
import { SidenavItemComponent } from './sidenav-item/sidenav-item.component';
import { SidenavItem, SidenavConfig, UserProfile, EnvironmentInfo } from '../../models/navigation.models';
import { AppThemeService } from '../../../core/services/app-theme.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterModule, SidenavItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="sidenav"
           [class.collapsed]="config?.collapsed"
           [class.overlay-mode]="isOverlayMode"
           [class.visible]="isVisible"
           [attr.data-bs-theme]="isDarkMode ? 'dark' : 'light'"
           [style.width]="getSidenavWidth()">
      
      <!-- Sidenav Header Section -->
      <div class="sidenav-header">
        <!-- Logo Section - Show when expanded -->
        <div class="sidenav-logo" 
             *ngIf="!config?.collapsed"
             (click)="onLogoClick()">
          <div class="logo-container">
            <img src="assets/images/logo.webp" alt="Logo" class="logo-expanded">
          </div>
        </div>

        <!-- Toggle Button - Show when expanded (right side) -->
        <button class="sidenav-toggle-btn" 
                *ngIf="!config?.collapsed"
                type="button"
                (click)="toggleSidenav()"
                [attr.aria-label]="'Collapse sidebar'"
                [attr.aria-expanded]="true">
          <i class="bi-chevron-left"></i>
        </button>

        <!-- Collapsed State - Show only toggle button centered -->
        <div class="collapsed-header" *ngIf="config?.collapsed">
          <button class="sidenav-toggle-btn collapsed-toggle" 
                  type="button"
                  (click)="toggleSidenav()"
                  [attr.aria-label]="'Expand sidebar'"
                  [attr.aria-expanded]="false">
            <i class="bi-chevron-right"></i>
          </button>
        </div>
      </div>




      <!-- Navigation Section -->
      <nav class="sidenav-nav" 
           role="navigation" 
           aria-label="Main navigation">
        <div class="sidenav-nav-content">
          <ul class="sidenav-menu" role="menubar">
            <app-sidenav-item 
              *ngFor="let item of navigationItems; trackBy: trackByItemId"
              [item]="item"
              [level]="0"
              [collapsed]="config?.collapsed || false"
              role="menuitem">
            </app-sidenav-item>
          </ul>
        </div>
      </nav>

      <!-- Footer Section -->
      <div class="sidenav-footer" *ngIf="!config?.collapsed">
        <div class="footer-actions">
          <button class="btn btn-outline-secondary btn-sm w-100" 
                  type="button"
                  (click)="onHelpClick()">
            <i class="bi-question-circle me-2"></i>
            Help & Support
          </button>
        </div>
        <div class="footer-version">
          <small class="text-muted">v1.0.0</small>
        </div>
      </div>

      <!-- Collapsed User Avatar -->
      <!-- <div class="sidenav-collapsed-avatar" 
           *ngIf="userProfile && config?.collapsed"
           [attr.title]="getUserTooltip()"
           data-bs-toggle="tooltip"
           data-bs-placement="right"
           (click)="onProfileClick()">
        <img *ngIf="userProfile.avatar" 
             [src]="userProfile.avatar" 
             [alt]="userProfile.name"
             class="avatar-image-small"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        <span class="avatar-initials-small" 
              [style.display]="userProfile.avatar ? 'none' : 'flex'">
          {{ userProfile.initials }}
        </span> -->
        <!-- Status indicator -->
        <!-- <div class="user-status-indicator" title="Online"></div>
      </div> -->
    </aside>

    <!-- Backdrop for mobile overlay -->
    <div class="sidenav-backdrop" 
         *ngIf="isOverlayMode && !config?.collapsed && isVisible"
         (click)="closeSidenav()"
         [@fadeInOut]="isVisible ? 'visible' : 'hidden'"></div>
  `,
  styleUrls: ['./sidenav.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('visible', style({
        opacity: 1,
        visibility: 'visible'
      })),
      state('hidden', style({
        opacity: 0,
        visibility: 'hidden'
      })),
      transition('visible => hidden', animate('200ms ease-out')),
      transition('hidden => visible', animate('200ms ease-in'))
    ])
  ]
})
export class SidenavComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private sidenavService = inject(SidenavService);
  private appThemeService = inject(AppThemeService);
  private authService = inject(AuthService);

  // Component state
  config: SidenavConfig | null = null;
  navigationItems: SidenavItem[] = [];
  userProfile: UserProfile | null = null;
  environmentInfo: EnvironmentInfo | null = null;
  isVisible: boolean = false;
  isOverlayMode: boolean = false;
  isDarkMode: boolean = false;

  ngOnInit(): void {
    this.subscribeToSidenavConfig();
    this.subscribeToNavigationItems();
    this.subscribeToUserProfile();
    this.subscribeToEnvironmentInfo();
    this.subscribeToVisibility();
    this.subscribeToOverlayMode();
    this.subscribeToTheme();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToSidenavConfig(): void {
    this.sidenavService.config$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.config = config;
      });
  }

  private subscribeToNavigationItems(): void {
    this.sidenavService.navigationItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.navigationItems = items;
      });
  }

  private subscribeToUserProfile(): void {
    this.sidenavService.userProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        this.userProfile = profile;
      });
  }

  private subscribeToEnvironmentInfo(): void {
    this.sidenavService.environmentInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(info => {
        this.environmentInfo = info;
      });
  }

  private subscribeToVisibility(): void {
    this.sidenavService.isVisible$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isVisible => {
        this.isVisible = isVisible;
      });
  }

  private subscribeToOverlayMode(): void {
    this.sidenavService.isOverlayMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOverlay => {
        this.isOverlayMode = isOverlay;
      });
  }

  private subscribeToTheme(): void {
    this.appThemeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;
      });
  }

  // Event handlers
  toggleSidenav(): void {
    this.sidenavService.toggleCollapsed();
  }

  closeSidenav(): void {
    if (this.isOverlayMode) {
      this.sidenavService.setCollapsed(true);
    }
  }

  onLogoClick(): void {
    this.sidenavService.navigateToRoute('/home');
  }

  onHelpClick(): void {
    // this.sidenavService.navigateToRoute('/support/help');
  }

  onProfileClick(): void {
    this.sidenavService.navigateToRoute('/profile');
  }

  getUserTooltip(): string {
    if (!this.userProfile) return '';
    return `${this.userProfile.name} - ${this.userProfile.role}\n${this.userProfile.email}`;
  }

  // Utility methods
  getSidenavWidth(): string {
    if (!this.config) return '280px';
    return this.config.collapsed ? this.config.width.collapsed : this.config.width.expanded;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'operational':
        return 'text-success';
      case 'degraded':
        return 'text-warning';
      case 'down':
        return 'text-danger';
      default:
        return 'text-muted';
    }
  }

  trackByItemId(index: number, item: SidenavItem): string {
    return item.id;
  }

  // Keyboard navigation
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOverlayMode && !this.config?.collapsed) {
      this.closeSidenav();
    }
  }

  // Close sidenav when clicking outside on mobile
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.isOverlayMode && !this.config?.collapsed) {
      const target = event.target as HTMLElement;
      const sidenav = document.querySelector('.sidenav');
      const toggleButton = document.querySelector('.mobile-menu-toggle'); // Add this button in header
      
      if (sidenav && !sidenav.contains(target) && !toggleButton?.contains(target)) {
        this.closeSidenav();
      }
    }
  }
}