import { Injectable, inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, Subject } from 'rxjs';
import { map, filter, takeUntil, take } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';
import { 
  SidenavItem, 
  SidenavConfig, 
  DEFAULT_SIDENAV_CONFIG, 
  UserProfile, 
  EnvironmentInfo 
} from '../models/navigation.models';

@Injectable({
  providedIn: 'root'
})
export class SidenavService implements OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private layoutService = inject(LayoutService);
  private destroy$ = new Subject<void>();

  // Configuration state
  private configSubject = new BehaviorSubject<SidenavConfig>(DEFAULT_SIDENAV_CONFIG);
  public config$ = this.configSubject.asObservable();

  // Navigation items state
  private navigationItemsSubject = new BehaviorSubject<SidenavItem[]>([]);
  public navigationItems$ = this.navigationItemsSubject.asObservable();

  // User profile state
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  // Environment info state
  private environmentInfoSubject = new BehaviorSubject<EnvironmentInfo>({
    name: 'Production',
    color: 'success',
    apiStatus: 'Operational',
    uptime: '99.9%'
  });
  public environmentInfo$ = this.environmentInfoSubject.asObservable();

  // Routes where sidenav should be visible (only for authenticated users)
  // These are the authenticated user workflow pages
  private readonly sidenavVisibleRoutes = [
    '/home',           // Home page after login
    '/brandApi',       // Brand API page (legacy route)
    '/brands/company'  // Brands API page (new route)
  ];

  // Routes where sidenav should never be visible
  // This includes public/marketing pages that should remain clean
  private readonly sidenavHiddenRoutes = [
    '/landing',        // Landing page
    '/pricing',        // Pricing pages (public marketing page)
    '/blog',           // Blog pages (public content)
    '/login',          // Login page
    '/register',       // Register page
    '/forgot-password',// Password reset
    '/auth',           // Auth pages
    '/brands/categories', // All-categories page
    '/developer'       // Developers page
  ];

  // Current route state
  private currentRouteSubject = new BehaviorSubject<string>('');
  
  // Visibility state - controlled by authentication AND specific routes
  public isVisible$: Observable<boolean> = combineLatest([
    this.authService.isAuthenticated$,
    this.currentRouteSubject.asObservable()
  ]).pipe(
    takeUntil(this.destroy$),
    map(([isAuthenticated, currentRoute]) => {
      // Never show sidenav on hidden routes
      if (this.sidenavHiddenRoutes.some(route => currentRoute.startsWith(route))) {
        return false;
      }

      // Only show sidenav for authenticated users on specific visible routes
      return isAuthenticated && this.sidenavVisibleRoutes.some(route => currentRoute.startsWith(route));
    })
  );

  // Responsive state - overlay mode for mobile/tablet
  public isOverlayMode$: Observable<boolean> = combineLatest([
    this.layoutService.isMobileOrTablet$,
    this.config$
  ]).pipe(
    takeUntil(this.destroy$),
    map(([isMobileOrTablet, config]) => isMobileOrTablet || config.overlayMode)
  );

  constructor() {
    this.initializeNavigationItems();
    this.subscribeToRouteChanges();
    this.subscribeToAuthChanges();
    this.subscribeToResponsiveChanges();
    this.initializeRouteTracking();
  }

  /**
   * Initialize the navigation items based on your provided structure
   */
  private initializeNavigationItems(): void {
    const navigationItems: SidenavItem[] = [
      // Home - Single item
      {
        id: 'home',
        label: 'Home',
        icon: 'bi-house',
        route: '/home'
      },
      
      // Dashboard - Collapsible group
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'bi-speedometer2',
        children: [
          {
            id: 'dashboard-overview',
            label: 'Overview',
            route: '/dashboard'
          },
          {
            id: 'dashboard-analytics',
            label: 'Analytics',
            route: '/dashboard/analytics'
          }
        ]
      },

      // Analytics - Single item
      {
        id: 'analytics',
        label: 'Analytics',
        icon: 'bi-graph-up'
        // ,route: '/analytics'
      },

      // Brand - Collapsible group
      {
        id: 'brand',
        label: 'Brand',
        icon: 'bi-award',
        children: [
          {
            id: 'api-key',
            label: 'Brands',
            route: '/brand/api-key'
          },
          {
            id: 'brand-manager',
            label: 'Brands Api',
            route: '/brands/company/:domain'
          },
          {
            id: 'brand-intelligence',
            label: 'Developers',
            route: '/brand/intelligence'
          }
        ]
      },

      // Insights & Reports - Collapsible group
      {
        id: 'insights-reports',
        label: 'Insights & Reports',
        icon: 'bi-file-earmark-text',
        children: [
          {
            id: 'sentiment-news',
            label: 'Sentiment & News',
            route: '/insights/sentiment'
          },
          {
            id: 'data-aggregation',
            label: 'Data Aggregation Log',
            route: '/insights/data-log'
          }
        ]
      },

      // Technology Stack - Collapsible group
      {
        id: 'technology-stack',
        label: 'Technology Stack',
        icon: 'bi-stack',
        children: [
         
        ]
      },

      // AI - Single item
      {
        id: 'ai',
        label: 'AI',
        icon: 'bi-robot',
        children: [
          {
            id: 'ai-tools',
            label: 'AI Tools',
            route: '/tech/ai-tools',
            badge: { text: 'NEW', type: 'success' }
          }
        ]
      },

      // Account - Collapsible group
      {
        id: 'account',
        label: 'Account',
        icon: 'bi-person-circle',
        children: [
          {
            id: 'support',
            label: 'Support',
            route: '/account/support'
          },
          {
            id: 'my-account',
            label: 'My Account',
            route: '/account/profile'
          }
        ]
      }
    ];

    this.navigationItemsSubject.next(navigationItems);
  }

  /**
   * Subscribe to route changes to update active states
   */
  private subscribeToRouteChanges(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (event: NavigationEnd) => {
          if (!this.destroy$.closed) {
            this.updateActiveStates(event.urlAfterRedirects);
          }
        },
        error: (error) => {
          console.error('Error in route changes subscription:', error);
        }
      });
  }

  /**
   * Initialize route tracking for sidenav visibility
   */
  private initializeRouteTracking(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (event: NavigationEnd) => {
          if (!this.destroy$.closed) {
            this.currentRouteSubject.next(event.urlAfterRedirects);
          }
        },
        error: (error) => {
          console.error('Error in route tracking:', error);
        }
      });

    // Set initial route safely
    try {
      if (this.router && !this.destroy$.closed) {
        this.currentRouteSubject.next(this.router.url);
      }
    } catch (error) {
      console.error('Error setting initial route:', error);
      this.currentRouteSubject.next('/');
    }
  }

  /**
   * Subscribe to auth changes to update user profile
   */
  private subscribeToAuthChanges(): void {
    this.authService.userDetails$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (userDetails) => {
          if (!this.destroy$.closed) {
            if (userDetails) {
              const profile: UserProfile = {
                name: `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() || userDetails.username || 'User',
                email: userDetails.email || '',
                role: this.formatRole(userDetails.roles?.[0] || 'USER'),
                avatar: userDetails.token ? this.generateAvatarUrl(userDetails.email) : undefined,
                initials: this.generateInitials(userDetails.firstName, userDetails.lastName, userDetails.username)
              };
              this.userProfileSubject.next(profile);
            } else {
              this.userProfileSubject.next(null);
            }
          }
        },
        error: (error) => {
          console.error('Error in auth changes subscription:', error);
        }
      });
  }

  /**
   * Subscribe to responsive changes for auto-collapse
   */
  private subscribeToResponsiveChanges(): void {
    this.layoutService.isMobileOrTablet$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isMobileOrTablet) => {
          if (!this.destroy$.closed) {
            const currentConfig = this.configSubject.value;
            if (currentConfig.autoCollapseOnMobile && isMobileOrTablet) {
              this.setCollapsed(true);
              // Also update overlay mode
              this.updateConfig({ overlayMode: isMobileOrTablet });
            }
          }
        },
        error: (error) => {
          console.error('Error in responsive changes subscription:', error);
        }
      });
  }

  /**
   * Update active states based on current route
   */
  private updateActiveStates(currentRoute: string): void {
    console.log('SidenavService: Updating active states for route:', currentRoute);
    const items = this.navigationItemsSubject.value;
    const updatedItems = this.setActiveStatesRecursive(items, currentRoute);
    
    // Debug: Log active items
    const activeItems = this.findActiveItems(updatedItems);
    console.log('SidenavService: Active items:', activeItems.map(item => ({ id: item.id, label: item.label, route: item.route })));
    
    this.navigationItemsSubject.next(updatedItems);
  }
  
  private findActiveItems(items: SidenavItem[]): SidenavItem[] {
    const activeItems: SidenavItem[] = [];
    items.forEach(item => {
      if (item.isActive) {
        activeItems.push(item);
      }
      if (item.children) {
        activeItems.push(...this.findActiveItems(item.children));
      }
    });
    return activeItems;
  }

  /**
   * Recursively set active states for navigation items
   */
  private setActiveStatesRecursive(items: SidenavItem[], currentRoute: string): SidenavItem[] {
    return items.map(item => {
      // Improved route matching logic
      let isActive = false;
      if (item.route) {
        // Exact match for root routes
        if (item.route === '/' || item.route === '/home') {
          isActive = currentRoute === item.route || currentRoute === '/home' || currentRoute === '/';
        } else {
          // For other routes, use startsWith but ensure it's a proper path match
          isActive = currentRoute === item.route || 
                    (currentRoute.startsWith(item.route) && 
                     (currentRoute.charAt(item.route.length) === '/' || currentRoute.length === item.route.length));
        }
      }
      
      const updatedItem = { ...item, isActive };

      if (item.children) {
        updatedItem.children = this.setActiveStatesRecursive(item.children, currentRoute);
        
        // Check if any child is active
        const hasActiveChild = updatedItem.children.some(child => 
          child.isActive || (child.children && child.children.some(grandChild => grandChild.isActive))
        );
        
        if (hasActiveChild) {
          updatedItem.isExpanded = true;
          // For collapsed state: if child is active, mark parent as active too
          // This ensures the parent icon shows as active when collapsed
          if (!updatedItem.isActive) {
            updatedItem.isActive = true;
            updatedItem.isParentActive = true; // Flag to distinguish parent vs direct active
          }
        }
      }

      return updatedItem;
    });
  }

  /**
   * Generate user initials
   */
  private generateInitials(firstName?: string, lastName?: string, username?: string): string {
    if (firstName || lastName) {
      return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    }
    return username?.[0]?.toUpperCase() || 'U';
  }

  /**
   * Format role display name
   */
  private formatRole(role: string): string {
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Generate avatar URL (placeholder implementation)
   */
  private generateAvatarUrl(email?: string): string {
    // You can implement gravatar or other avatar service here
    return '/assets/user-small.png';
  }

  // Public methods for controlling sidenav
  
  /**
   * Check if sidenav should be visible for a specific route and auth status
   */
  public shouldShowSidenavForRoute(route: string, isAuthenticated: boolean): boolean {
    // Never show on hidden routes
    if (this.sidenavHiddenRoutes.some(hiddenRoute => route.startsWith(hiddenRoute))) {
      return false;
    }

    // Only show for authenticated users on visible routes
    return isAuthenticated && this.sidenavVisibleRoutes.some(visibleRoute => route.startsWith(visibleRoute));
  }

  /**
   * Toggle sidenav collapsed state
   */
  public toggleCollapsed(): void {
    const currentConfig = this.configSubject.value;
    this.setCollapsed(!currentConfig.collapsed);
  }

  /**
   * Set sidenav collapsed state
   */
  public setCollapsed(collapsed: boolean): void {
    const currentConfig = this.configSubject.value;
    this.configSubject.next({ ...currentConfig, collapsed });
  }

  /**
   * Toggle menu item expanded state
   */
  public toggleItemExpanded(itemId: string): void {
    const items = this.navigationItemsSubject.value;
    const updatedItems = this.toggleItemExpandedRecursive(items, itemId);
    this.navigationItemsSubject.next(updatedItems);
  }

  /**
   * Recursively toggle item expanded state
   */
  private toggleItemExpandedRecursive(items: SidenavItem[], itemId: string): SidenavItem[] {
    return items.map(item => {
      if (item.id === itemId) {
        return { ...item, isExpanded: !item.isExpanded };
      }
      if (item.children) {
        return { ...item, children: this.toggleItemExpandedRecursive(item.children, itemId) };
      }
      return item;
    });
  }

  /**
   * Navigate to route and handle mobile collapse
   */
  public navigateToRoute(route: string): void {
    this.router.navigate([route]);
    
    // Auto-collapse on mobile after navigation
    this.isOverlayMode$
      .pipe(take(1))
      .subscribe(isOverlay => {
        if (isOverlay) {
          this.setCollapsed(true);
        }
      });
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<SidenavConfig>): void {
    const currentConfig = this.configSubject.value;
    this.configSubject.next({ ...currentConfig, ...config });
  }

  /**
   * Cleanup subscriptions
   */
  ngOnDestroy(): void {
    // Signal all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
    
    // Complete all BehaviorSubjects to free memory
    this.configSubject.complete();
    this.navigationItemsSubject.complete();
    this.userProfileSubject.complete();
    this.environmentInfoSubject.complete();
    this.currentRouteSubject.complete();
  }

  /**
   * Get current configuration
   */
  public getCurrentConfig(): SidenavConfig {
    return this.configSubject.value;
  }
}