import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { filter, map, Observable } from 'rxjs';
import { MainLayoutComponent } from './layout/main-layout.component';
import { GlobalSpinnerComponent } from './core/components/global-spinner/global-spinner.component';
import { ErrorBoundaryComponent } from './core/components/error-boundary/error-boundary.component';
import { ToolbarService } from './shared/services/toolbar.service';
import { AppThemeService } from './core/services/app-theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    MainLayoutComponent, 
    GlobalSpinnerComponent, 
    ErrorBoundaryComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  
  // Device compatibility settings
  public static readonly DEVICE_COMPATIBILITY = {
    enableTouchOptimizations: true,
    enableMobileGestures: true,
    enableTabletLayout: true,
    enableDesktopFeatures: true
  };

  constructor(
    private router: Router, 
    private toolbarService: ToolbarService,
    private appThemeService: AppThemeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Initialize unified theme system
    // Theme service initializes automatically in constructor
    
    // Initialize device compatibility features
    this.initializeDeviceCompatibility();
    
    // Layout is now handled by LayoutService automatically based on routes
  }

  private initializeDeviceCompatibility(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const config = AppComponent.DEVICE_COMPATIBILITY;
    
    // Apply device-specific optimizations
    if (config.enableTouchOptimizations) {
      document.documentElement.setAttribute('data-touch-enabled', 'true');
    }
    
    if (config.enableMobileGestures) {
      document.documentElement.setAttribute('data-mobile-gestures', 'true');
    }
    
    if (config.enableTabletLayout) {
      document.documentElement.setAttribute('data-tablet-layout', 'true');
    }
    
    if (config.enableDesktopFeatures) {
      document.documentElement.setAttribute('data-desktop-features', 'true');
    }
    
    // Detect device type and apply appropriate classes
    this.detectAndApplyDeviceType();
  }

  private detectAndApplyDeviceType(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;
    
    // Apply device-specific classes
    if (isMobile) {
      document.documentElement.classList.add('device-mobile');
      document.documentElement.setAttribute('data-device-type', 'mobile');
    } else if (isTablet) {
      document.documentElement.classList.add('device-tablet');
      document.documentElement.setAttribute('data-device-type', 'tablet');
    } else if (isDesktop) {
      document.documentElement.classList.add('device-desktop');
      document.documentElement.setAttribute('data-device-type', 'desktop');
    }
    
    // Add viewport size classes
    this.updateViewportClasses();
    
    // Listen for resize events to update viewport classes
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', () => this.updateViewportClasses());
    }
  }

  private updateViewportClasses(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Remove existing viewport classes
    document.documentElement.classList.remove(
      'viewport-xs', 'viewport-sm', 'viewport-md', 'viewport-lg', 'viewport-xl', 'viewport-xxl'
    );
    
    // Add appropriate viewport class
    if (width < 576) {
      document.documentElement.classList.add('viewport-xs');
    } else if (width < 768) {
      document.documentElement.classList.add('viewport-sm');
    } else if (width < 992) {
      document.documentElement.classList.add('viewport-md');
    } else if (width < 1200) {
      document.documentElement.classList.add('viewport-lg');
    } else if (width < 1400) {
      document.documentElement.classList.add('viewport-xl');
    } else {
      document.documentElement.classList.add('viewport-xxl');
    }
    
    // Add orientation class
    document.documentElement.classList.remove('orientation-portrait', 'orientation-landscape');
    document.documentElement.classList.add(height > width ? 'orientation-portrait' : 'orientation-landscape');
  }
}
