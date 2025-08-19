import { Component, HostListener, Input, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { ToolbarService, ToolbarLogo, ToolbarNavItem, ToolbarAction } from '../../shared/services/toolbar.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';
import { SidenavService } from '../services/sidenav.service';
import { AppThemeService } from '../../core/services/app-theme.service';
import { AppThemePanelService } from '../../shared/services/app-theme-panel.service';
import { Observable, Subscription, Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  logo$: Observable<ToolbarLogo>;
  computedLogo$: Observable<ToolbarLogo>;
  navItems$: Observable<ToolbarNavItem[]>;
  actions$: Observable<ToolbarAction[]>;
  currentRoute: string = '';
  @Input() showNavigation = true;
  @Input() headerType: 'default' | 'minimal' | 'transparent' = 'default';
  
  // Responsive state
  showProfileDropdown = false;
  isVisible = true;
  isScrolled = false;
  isLanding = false;
  isMobile$:any;
  
  // Theme state
  isDarkMode$: Observable<boolean>;
  isAdvancedThemeEnabled$: Observable<boolean>;
  currentTheme: any = 'light';
  
  // Theme features availability
  themeFeatures$!: Observable<boolean>;
  
  // Private properties
  private lastScrollY = 0;
  private showTimeout: any;
  private isScrollingUp = false;
  private authSubscription: Subscription | undefined;
  private destroy$ = new Subject<void>();
  profileAvatarUrl: string = 'assets/landing/user.webp';
  private avatarSubscription: Subscription | undefined;
  constructor(
    private toolbarService: ToolbarService,
    public authService: AuthService,
    private router: Router,
    private layoutService: LayoutService,
    public sidenavService: SidenavService,
    private appThemeService: AppThemeService,
    private appThemePanelService: AppThemePanelService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.logo$ = this.toolbarService.logo;
    this.navItems$ = this.toolbarService.navItems;
    this.actions$ = this.toolbarService.actions;
    this.isDarkMode$ = this.appThemeService.isDarkMode$;
    this.isAdvancedThemeEnabled$ = this.appThemeService.canAccessAdvancedFeatures$;
    this.themeFeatures$ = this.appThemeService.canAccessAdvancedFeatures$;
    // Create computed logo based on sidenav state
    this.computedLogo$ = combineLatest([
      this.toolbarService.logo,
      this.sidenavService.config$,
      this.authService.isAuthenticated$,
      this.sidenavService.isVisible$,
       // ]).pipe(
    //   map(([originalLogo, sidenavConfig, isAuthenticated, sidenavVisible]) => {
    //     // Only show conditional logo when authenticated and sidenav is visible
      this.layoutService.isMobileOrTablet$
    ]).pipe(
      map(([originalLogo, sidenavConfig, isAuthenticated, sidenavVisible, isMobile]) => {
        // Mobile view: always show full RIVO9 logo centered
        if (isMobile) {
          return { ...originalLogo, src: 'assets/images/RIVO9 logo.webp' };
        }
        // Desktop: conditional (icon when collapsed, full when expanded)
   
        if (isAuthenticated && sidenavVisible) {
          return {
            ...originalLogo,
            src: sidenavConfig.collapsed 
              ? 'assets/landing/logo icon.png'  // Collapsed state - show icon
              : 'assets/images/RIVO9 logo.webp' // Expanded state - show full logo
          };
        }
        // When not authenticated or sidenav not visible, use original logo
        return originalLogo;
      })
    );
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
        this.showNavigation = true;
        this.isLanding = this.currentRoute === '/' || this.currentRoute.startsWith('/landing');
        // Force white header for /developer and /profile
        if (this.currentRoute.startsWith('/developer') || this.currentRoute.startsWith('/profile')) {
          this.isScrolled = true;
        }
        // Add or remove body attribute for profile page
        if (isPlatformBrowser(this.platformId)) {
          if (this.currentRoute.startsWith('/profile')) {
            document.body.setAttribute('data-profile-page', 'true');
          } else {
            document.body.removeAttribute('data-profile-page');
          }
        }
      }
    });
  }

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        if (isAuthenticated) {
          this.toolbarService.setLoggedInToolbar();
        } else {
          this.toolbarService.setLoggedOutToolbar();
        }
      });
 this.isMobile$ = this.layoutService.isMobileOrTablet$
    // Subscribe to profile avatar changes
    this.toolbarService.profileAvatar
      .pipe(takeUntil(this.destroy$))
      .subscribe(url => {
        this.profileAvatarUrl = url;
      });

    // Subscribe to layout configuration changes
    this.layoutService.layoutConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.headerType = config.headerType;
      });

    // Subscribe to theme changes using isDarkMode$ for simplicity
    this.appThemeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.currentTheme = isDark ? 'dark' : 'light';
      });

    // Subscribe to sidenav config changes - no positioning adjustments needed since header is now full width
    this.sidenavService.config$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        // Header remains full width regardless of sidenav state
      });

    // Initialize responsive behavior
    this.initializeResponsiveBehavior();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
  }

  private initializeResponsiveBehavior(): void {
    // Close mobile menu when clicking outside or on nav links
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('click', (event) => {
        const navbarCollapse = document.getElementById('navbarNav');
        const navbarToggler = document.querySelector('.navbar-toggler');
        
        if (navbarCollapse && navbarToggler && 
            !navbarCollapse.contains(event.target as Node) && 
            !navbarToggler.contains(event.target as Node)) {
          const bsCollapse = (window as any).bootstrap?.Collapse?.getInstance(navbarCollapse);
          if (bsCollapse) {
            bsCollapse.hide();
          }
        }
      });

      // Handle zoom level changes
      this.handleZoomChanges();
    }
  }

  private handleZoomChanges(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Listen for resize events that might indicate zoom changes
    window.addEventListener('resize', () => {
      this.adjustLayoutForZoom();
    });

    // Initial adjustment
    this.adjustLayoutForZoom();
  }

  private adjustLayoutForZoom(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const navbar = document.querySelector('.navbar') as HTMLElement;
    if (!navbar) return;

    // Force recalculation of layout - header now always stays full width
    requestAnimationFrame(() => {
      // Ensure proper positioning
      navbar.style.position = 'fixed';
      navbar.style.top = '0';
      navbar.style.left = '0';
      navbar.style.right = '0';
      navbar.style.width = '100%';
      navbar.style.maxWidth = '100%';
      navbar.style.zIndex = '1100';
    });
  }

  /**
   * Adjust header positioning based on sidenav collapsed state
   * Header now always stays full width regardless of sidenav state
   */
  private adjustHeaderForSidenavState(isCollapsed: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const navbar = document.querySelector('.navbar') as HTMLElement;
    if (!navbar) return;

    // Header always maintains full width - sidenav positioning is handled separately
    navbar.style.left = '0';
    navbar.style.width = '100%';
    navbar.style.maxWidth = '100%';
  }
login() {
this.authService.checkAuthStatusAndNavigate();
// Close mobile menu after login action
this.closeMobileMenu();
}
  onNavClick(item: ToolbarNavItem) {
    if (item.label === 'Blog') {
      this.router.navigate(['/blog']);
    } else if (item.scrollId && this.router.url.startsWith('/landing')) {
      if (isPlatformBrowser(this.platformId)) {
        const el = document.getElementById(item.scrollId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
    
    // Close mobile menu after navigation
    this.closeMobileMenu();
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }
  goToProfile(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.closeProfileDropdown();
    this.router.navigate(['/profile']);
    // Close mobile menu after navigation
    this.closeMobileMenu();
  }
  
  closeProfileDropdown() {
    this.showProfileDropdown = false;
    // Force close Bootstrap dropdown
    const dropdownElement = document.querySelector('.profile-dropdown');
    if (dropdownElement) {
      dropdownElement.classList.remove('show');
    }
    const dropdownToggle = document.querySelector('#profileDropdown');
    if (dropdownToggle) {
      dropdownToggle.setAttribute('aria-expanded', 'false');
    }
  }
  logout() {
    // Close profile dropdown immediately
    this.closeProfileDropdown();
    
    // Close mobile menu
    this.closeMobileMenu();
    
    // Perform logout
    this.authService.logout();
    
    // Force immediate toolbar update
    this.toolbarService.setLoggedOutToolbar();
    
    // Header is already full width, no positioning adjustment needed
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const navbar = document.querySelector('.navbar') as HTMLElement;
        if (navbar) {
          // Header maintains full width regardless of authentication state
          navbar.style.left = '0';
          navbar.style.width = '100%';
          navbar.style.maxWidth = '100%';
        }
      }, 0);
    }
  }
  
  onUpgradeClick() {
    this.router.navigate(['/pricing']);
    // Close mobile menu after navigation
    this.closeMobileMenu();
  }

  onLogoClick() {
    if (this.currentRoute.startsWith('/landing')) {
      this.router.navigate(['/landing']);
    } else if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/landing']);
    }
    // Close mobile menu after logo navigation
    this.closeMobileMenu();
  }
  
  private isHeroSectionInView(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const hero = document.getElementById('hero');
    if (!hero) return false;
    const rect = hero.getBoundingClientRect();
    // Consider in view if at least 40px of hero is visible at the top
    return rect.top <= 80 && rect.bottom > 40;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!isPlatformBrowser(this.platformId)) return;
    const currentScrollY = window.scrollY;
    // Only update isScrolled for background/shadow, but always keep isVisible true
    if (this.isLanding) {
      this.isScrolled = currentScrollY > 0;
    } else if (this.currentRoute.startsWith('/developer') || this.currentRoute.startsWith('/profile')) {
      this.isScrolled = true;
    } else {
      this.isScrolled = currentScrollY > 0;
    }
    this.isVisible = true;
    this.lastScrollY = currentScrollY < 0 ? 0 : currentScrollY;
  }

  isUpgradeActive(): boolean {
    return this.authService.isAuthenticated() && this.currentRoute.startsWith('/pricing');
  }

  isNavItemActive(item: ToolbarNavItem): boolean {
    // Handle route-based navigation
    if (item.route && item.route !== '') {
      return this.currentRoute.startsWith(item.route);
    }
    
    // Handle scroll-based navigation for landing page
    if (this.currentRoute === '/' || this.currentRoute.startsWith('/landing')) {
      // For landing page, we could check scroll position or active section
      // For now, return false since these are scroll-based
      return false;
    }
    
    // Handle special cases
    if (item.label === 'Home' && this.currentRoute === '/home') {
      return true;
    }
    
    return false;
  }

  onGetStartedClick() {
    this.router.navigate(['/auth/login'], { queryParams: { register: 'true' } });
    // Close mobile menu after navigation
    this.closeMobileMenu();
  }

  toggleSidenav() {
    this.sidenavService.toggleCollapsed();
    
    // Header remains full width - no adjustment needed
  }

  /**
   * Close the mobile navigation menu
   */
  private closeMobileMenu() {
    if (!isPlatformBrowser(this.platformId)) return;

    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      const bsCollapse = (window as any).bootstrap?.Collapse?.getInstance(navbarCollapse);
      if (bsCollapse) {
        bsCollapse.hide();
      } else {
        // Fallback if bootstrap instance is not available
        navbarCollapse.classList.remove('show');
        navbarCollapse.setAttribute('aria-expanded', 'false');
        
        // Also update the toggler button state
        const navbarToggler = document.querySelector('.navbar-toggler');
        if (navbarToggler) {
          navbarToggler.setAttribute('aria-expanded', 'false');
          navbarToggler.classList.add('collapsed');
        }
      }
    }
  }

  toggleTheme() {
    this.appThemeService.toggleDarkMode();
  }

  // Open unified theme panel (replaces both basic and advanced theme panels)
  openThemePanel() {
    this.appThemePanelService.open();
  }

  // Check if advanced theme features are available
  get isAdvancedThemeAvailable(): boolean {
    return this.appThemeService.canAccessAdvancedFeatures();
  }
}
