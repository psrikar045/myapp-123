import { Component, HostListener, Input, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { ToolbarService, ToolbarLogo, ToolbarNavItem, ToolbarAction } from '../../shared/services/toolbar.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';
import { Observable, Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  logo$: Observable<ToolbarLogo>;
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
  
  // Private properties
  private lastScrollY = 0;
  private showTimeout: any;
  private isScrollingUp = false;
  private authSubscription: Subscription | undefined;
  private destroy$ = new Subject<void>();
  profileAvatarUrl: string = '/landing/user.jfif';
  private avatarSubscription: Subscription | undefined;
  constructor(
    private toolbarService: ToolbarService,
    private authService: AuthService,
    private router: Router,
    private layoutService: LayoutService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.logo$ = this.toolbarService.logo;
    this.navItems$ = this.toolbarService.navItems;
    this.actions$ = this.toolbarService.actions;
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
    }
  }
login() {
this.authService.checkAuthStatusAndNavigate();
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
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }
  goToProfile(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.showProfileDropdown = false;
    this.router.navigate(['/profile']);
  }
  logout() {
    this.authService.logout();
  }
  
  onUpgradeClick() {
    this.router.navigate(['/pricing']);
  }

  onLogoClick() {
    if (this.currentRoute.startsWith('/landing')) {
      this.router.navigate(['/landing']);
    } else if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/landing']);
    }
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
    this.router.navigate(['/login'], { queryParams: { register: 'true' } });
  }
}
