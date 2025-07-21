import { Component, HostListener, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ToolbarService, ToolbarLogo, ToolbarNavItem, ToolbarAction } from '../../shared/services/toolbar.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatMenuModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  logo$: Observable<ToolbarLogo>;
  navItems$: Observable<ToolbarNavItem[]>;
  actions$: Observable<ToolbarAction[]>;
  currentRoute: string = '';
  @Input() showNavigation = true;
  showProfileDropdown = false;
  isVisible = true;
  isScrolled = false;
  isLanding = false;
  private lastScrollY = 0;
  private showTimeout: any;
  private isScrollingUp = false;
  private authSubscription: Subscription | undefined;
  profileAvatarUrl: string = '/landing/user.jfif';
  private avatarSubscription: Subscription | undefined;
  constructor(
    private toolbarService: ToolbarService,
    private authService: AuthService,
    private router: Router,
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
        // Force white header for /developer and /my-profile
        if (this.currentRoute.startsWith('/developer') || this.currentRoute.startsWith('/my-profile')) {
          this.isScrolled = true;
        }
        // Add or remove body attribute for my-profile page
        if (isPlatformBrowser(this.platformId)) {
          if (this.currentRoute.startsWith('/my-profile')) {
            document.body.setAttribute('data-profile-page', 'true');
          } else {
            document.body.removeAttribute('data-profile-page');
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.toolbarService.setLoggedInToolbar();
      } else {
        this.toolbarService.setLoggedOutToolbar();
      }
    });
    this.avatarSubscription = this.toolbarService.profileAvatar.subscribe(url => {
      this.profileAvatarUrl = url;
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.avatarSubscription?.unsubscribe();
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
    event.stopPropagation();
    this.showProfileDropdown = false;
    this.router.navigate(['/my-profile']);
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
    } else if (this.currentRoute.startsWith('/developer') || this.currentRoute.startsWith('/my-profile')) {
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

  onGetStartedClick() {
    this.router.navigate(['/login'], { queryParams: { register: 'true' } });
  }
}
