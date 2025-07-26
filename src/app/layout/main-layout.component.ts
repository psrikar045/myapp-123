import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ChangeDetectionStrategy, ViewContainerRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { HeaderComponent } from './header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { GlobalSpinnerComponent } from '../core/components/global-spinner/global-spinner.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { SpinnerService } from '../core/services/spinner.service';
import { LayoutService } from '../core/services/layout.service';
import { AppThemeService } from '../core/services/app-theme.service';
import { AppThemePanelService } from '../shared/services/app-theme-panel.service';
import { AppThemePanelComponent } from '../shared/components/app-theme-panel/app-theme-panel.component';
import { SidenavService } from './services/sidenav.service';
import { AuthService } from '../core/services/auth.service';
import { SettingsService } from '../shared/services/settings.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    GlobalSpinnerComponent,
    SidenavComponent,
    AppThemePanelComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);
  
  // Inject services
  public spinnerService = inject(SpinnerService);
  private layoutService = inject(LayoutService);
  private appThemeService = inject(AppThemeService);
  private appThemePanelService = inject(AppThemePanelService);
  public sidenavService = inject(SidenavService); // Made public for template access
  private authService = inject(AuthService);
  private settingsService = inject(SettingsService);
  private viewContainerRef = inject(ViewContainerRef);
  
  // Layout state
  showHeader$ = this.layoutService.showHeader$;
  showFooter$ = this.layoutService.showFooter$;
  isThemePanelOpen$ = this.appThemePanelService.isOpen$;
  currentTheme = 'light';
  
  // Sidenav state - now handled via observables in template

  
  ngOnInit(): void {
    // Subscribe to theme changes with setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.appThemeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        setTimeout(() => {
          this.currentTheme = isDark ? 'dark' : 'light';
          this.cdr.detectChanges();
        });
      });

    // Debug layout state changes
    this.showHeader$
      .pipe(takeUntil(this.destroy$))
      .subscribe(showHeader => {
        console.log('MainLayout: showHeader changed to:', showHeader);
      });

    this.showFooter$
      .pipe(takeUntil(this.destroy$))
      .subscribe(showFooter => {
        console.log('MainLayout: showFooter changed to:', showFooter);
      });

    // Sidenav state is now handled directly via observables in template with async pipe
    // This ensures OnPush change detection works properly with the toggle functionality
  }

  ngAfterViewInit(): void {
    // Set the ViewContainerRef for the settings service
    this.settingsService.setViewContainerRef(this.viewContainerRef);
    

  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}