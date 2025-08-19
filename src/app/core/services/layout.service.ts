import { Injectable, inject, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { Observable, BehaviorSubject, Subject ,combineLatest} from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';
export interface LayoutConfig {
  showHeader: boolean;
  showFooter: boolean;
  containerClass: string;
  headerType: 'default' | 'minimal' | 'transparent';
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService implements OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();
  
  // Layout state management
  private showHeaderSubject = new BehaviorSubject<boolean>(true);
  private showFooterSubject = new BehaviorSubject<boolean>(true);
  private layoutConfigSubject = new BehaviorSubject<LayoutConfig>({
    showHeader: true,
    showFooter: true,
    containerClass: 'container',
    headerType: 'default'
  });
  
  // // Public observables
  // public showHeader$ = this.showHeaderSubject.asObservable();
  // public showFooter$ = this.showFooterSubject.asObservable();
  // public layoutConfig$ = this.layoutConfigSubject.asObservable();
    // Public observables
  public showHeader$ = this.showHeaderSubject.asObservable();
  // Combine route-based footer visibility with authentication state
  public showFooter$ = combineLatest([
    this.showFooterSubject.asObservable(),
    this.authService.isAuthenticated$
  ]).pipe(
    map(([routeShowFooter, isAuthenticated]) => {
      // Hide footer if user is authenticated, regardless of route
      return routeShowFooter && !isAuthenticated;
    }),
    shareReplay(1)
  );
  public layoutConfig$ = this.layoutConfigSubject.asObservable();

  // Predefined breakpoints from Angular Material

  // Predefined breakpoints from Angular Material
  // You can customize these as needed.
  // Using strings like '(max-width: 599.98px)' for custom queries.
  // We'll use a mobile-first approach, so min-width queries are generally preferred.

  public isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset) // Typically (max-width: 599.98px) and (orientation: portrait), (max-width: 959.98px) and (orientation: landscape)
    .pipe(
      map(result => result.matches),
      shareReplay(1)
    );

  public isTablet$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Tablet) // Typically (min-width: 600px) and (max-width: 839.98px) and (orientation: portrait), (min-width: 960px) and (max-width: 1279.98px) and (orientation: landscape)
    .pipe(
      map(result => result.matches),
      shareReplay(1)
    );

  public isWeb$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Web) // Typically (min-width: 840px) and (orientation: portrait), (min-width: 1280px) and (orientation: landscape)
    .pipe(
      map(result => result.matches),
      shareReplay(1)
    );

  // Custom breakpoints for a mobile-first approach
  // These can be more granular and align with the global CSS breakpoints.

  // Mobile: screens < 600px wide
  public isMobile$: Observable<boolean> = this.breakpointObserver
    .observe('(max-width: 599.98px)')
    .pipe(
      map(result => result.matches),
      shareReplay(1)
    );

  // Tablet: screens >= 600px and < 960px
  public isTabletPortrait$: Observable<boolean> = this.breakpointObserver
    .observe('(min-width: 600px) and (max-width: 959.98px)')
    .pipe(
      map(result => result.matches),
      shareReplay(1)
    );

  // Desktop: screens >= 960px
  public isDesktop$: Observable<boolean> = this.breakpointObserver
    .observe('(min-width: 960px)')
    .pipe(
      map(result => result.matches),
      shareReplay(1)
    );

  // Example of combining: Is Small Screen (Mobile or Tablet Portrait from Breakpoints.Handset)
  public isSmallScreen$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
    .pipe(
      map(result => result.matches),
      shareReplay(1)
    );

  // Bootstrap-compatible breakpoints
  public isXs$: Observable<boolean> = this.breakpointObserver
    .observe('(max-width: 575.98px)')
    .pipe(map(result => result.matches), shareReplay(1));

  public isSm$: Observable<boolean> = this.breakpointObserver
    .observe('(min-width: 576px) and (max-width: 767.98px)')
    .pipe(map(result => result.matches), shareReplay(1));

  public isMd$: Observable<boolean> = this.breakpointObserver
    .observe('(min-width: 768px) and (max-width: 991.98px)')
    .pipe(map(result => result.matches), shareReplay(1));

  public isLg$: Observable<boolean> = this.breakpointObserver
    .observe('(min-width: 992px) and (max-width: 1199.98px)')
    .pipe(map(result => result.matches), shareReplay(1));

  public isXl$: Observable<boolean> = this.breakpointObserver
    .observe('(min-width: 1200px) and (max-width: 1399.98px)')
    .pipe(map(result => result.matches), shareReplay(1));

  public isXxl$: Observable<boolean> = this.breakpointObserver
    .observe('(min-width: 1400px)')
    .pipe(map(result => result.matches), shareReplay(1));

  // Utility breakpoints
  public isMobileOrTablet$: Observable<boolean> = this.breakpointObserver
    .observe('(max-width: 991.98px)')
    .pipe(map(result => result.matches), shareReplay(1));

  public isDesktopOrLarger$: Observable<boolean> = this.breakpointObserver
    .observe('(min-width: 992px)')
    .pipe(map(result => result.matches), shareReplay(1));

  constructor() {
    // Listen to route changes to update layout configuration
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(event => event as NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(event => {
        // Use setTimeout to defer layout updates to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          // Check if service is still active before updating
          if (!this.destroy$.closed) {
            this.updateLayoutForRoute(event.url);
          }
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Layout control methods
  setHeaderVisibility(show: boolean): void {
    this.showHeaderSubject.next(show);
    this.updateLayoutConfig({ showHeader: show });
  }

  setFooterVisibility(show: boolean): void {
    this.showFooterSubject.next(show);
    this.updateLayoutConfig({ showFooter: show });
  }

  setLayoutConfig(config: Partial<LayoutConfig>): void {
    const currentConfig = this.layoutConfigSubject.value;
    const newConfig = { ...currentConfig, ...config };
    this.layoutConfigSubject.next(newConfig);
    
    // Update individual subjects
    this.showHeaderSubject.next(newConfig.showHeader);
    this.showFooterSubject.next(newConfig.showFooter);
  }

  private updateLayoutConfig(updates: Partial<LayoutConfig>): void {
    const currentConfig = this.layoutConfigSubject.value;
    const newConfig = { ...currentConfig, ...updates };
    this.layoutConfigSubject.next(newConfig);
  }

  private updateLayoutForRoute(url: string): void {
    // console.log('LayoutService: Updating layout for route:', url);
    
    // Define route-specific layout configurations
    const routeConfigs: { [key: string]: Partial<LayoutConfig> } = {
      '/': {
        showHeader: true,
        showFooter: true,
        containerClass: 'container-fluid',
        headerType: 'default'
      },
      // Auth routes - no header/footer
      '/auth/login': {
        showHeader: false,
        showFooter: false,
        containerClass: 'container-fluid',
        headerType: 'minimal'
      },
      '/auth/reset-password': {
        showHeader: false,
        showFooter: false,
        containerClass: 'container-fluid',
        headerType: 'minimal'
      },
      '/login': {
        showHeader: false,
        showFooter: false,
        containerClass: 'container-fluid',
        headerType: 'minimal'
      },
      '/signup': {
        showHeader: false,
        showFooter: false,
        containerClass: 'container-fluid',
        headerType: 'minimal'
      },
      '/register': {
        showHeader: false,
        showFooter: false,
        containerClass: 'container-fluid',
        headerType: 'minimal'
      },
      '/forgot-password': {
        showHeader: false,
        showFooter: false,
        containerClass: 'container-fluid',
        headerType: 'minimal'
      },
      '/reset-password': {
        showHeader: false,
        showFooter: false,
        containerClass: 'container-fluid',
        headerType: 'minimal'
      },
      // Public routes - header + footer
      '/landing': {
        showHeader: true,
        showFooter: true,
        containerClass: 'container-fluid',
        headerType: 'default'
      },
      '/brands': {
        showHeader: true,
        showFooter: true,
        containerClass: 'container-fluid',
        headerType: 'default'
      },
      '/blog': {
        showHeader: true,
        showFooter: true,
        containerClass: 'container-fluid',
        headerType: 'default'
      },
      '/pricing': {
        showHeader: true,
        showFooter: true,
        containerClass: 'container-fluid',
        headerType: 'default'
      },
      '/developer': {
        showHeader: true,
        showFooter: true,
        containerClass: 'container-fluid',
        headerType: 'default'
      },
      // Authenticated routes - header only, no footer
      '/home': {
        showHeader: true,
        showFooter: false,
        containerClass: 'container',
        headerType: 'default'
      },
      '/dashboard': {
        showHeader: true,
        showFooter: false,
        containerClass: 'container-fluid',
        headerType: 'default'
      },
      '/profile': {
        showHeader: true,
        showFooter: false,
        containerClass: 'container-fluid',
        headerType: 'default'
      },
      '/admin': {
        showHeader: true,
        showFooter: false,
        containerClass: 'container-fluid',
        headerType: 'default'
      },
      '/search': {
        showHeader: false,
        showFooter: false,
        containerClass: 'container-fluid',
        headerType: 'minimal'
      },
      '/search/view': {
        showHeader: true,
        showFooter: true,
        containerClass: 'container-fluid',
        headerType: 'default'
      },
      '/brandApi': {
        showHeader: true,
        showFooter: false,
        containerClass: 'container-fluid',
        headerType: 'default'
      },
      '/all-categories': {
        showHeader: true,
        showFooter: false,
        containerClass: 'container-fluid',
        headerType: 'default'
      },
      '/pricing/choose': {
        showHeader: true,
        showFooter: false,
        containerClass: 'container-fluid',
        headerType: 'default'
      },
      '/pricing/my-plan': {
        showHeader: true,
        showFooter: false,
        containerClass: 'container-fluid',
        headerType: 'default'
      }
    };

    // Find matching route configuration (order matters - more specific routes first)
    const sortedRoutes = Object.keys(routeConfigs).sort((a, b) => b.length - a.length);
    const matchingRoute = sortedRoutes.find(route => {
      if (route === '/') {
        return url === '/' || url === '/landing';
      }
      return url.startsWith(route);
    });

    if (matchingRoute) {
      // console.log('LayoutService: Matched route:', matchingRoute, 'Config:', routeConfigs[matchingRoute]);
      this.setLayoutConfig(routeConfigs[matchingRoute]);
    } else {
      // console.log('LayoutService: No matching route, using default config');
      // Default configuration
      this.setLayoutConfig({
        showHeader: true,
        showFooter: true,
        containerClass: 'container',
        headerType: 'default'
      });
    }
  }

  // Utility methods for responsive behavior
  getCurrentBreakpoint(): Observable<string> {
    return this.breakpointObserver
      .observe([
        '(max-width: 575.98px)',
        '(min-width: 576px) and (max-width: 767.98px)',
        '(min-width: 768px) and (max-width: 991.98px)',
        '(min-width: 992px) and (max-width: 1199.98px)',
        '(min-width: 1200px) and (max-width: 1399.98px)',
        '(min-width: 1400px)'
      ])
      .pipe(
        map(result => {
          if (result.breakpoints['(max-width: 575.98px)']) return 'xs';
          if (result.breakpoints['(min-width: 576px) and (max-width: 767.98px)']) return 'sm';
          if (result.breakpoints['(min-width: 768px) and (max-width: 991.98px)']) return 'md';
          if (result.breakpoints['(min-width: 992px) and (max-width: 1199.98px)']) return 'lg';
          if (result.breakpoints['(min-width: 1200px) and (max-width: 1399.98px)']) return 'xl';
          if (result.breakpoints['(min-width: 1400px)']) return 'xxl';
          return 'unknown';
        }),
        shareReplay(1)
      );
  }
}
