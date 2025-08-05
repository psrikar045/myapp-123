import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface ToolbarLogo {
  src: string;
  alt: string;
  link: string;
}

export interface ToolbarNavItem {
  label: string;
  route: string;
  scrollId: string;
}

export interface ToolbarAction {
  type: 'theme-toggle' | 'login' | 'get-started' | 'upgrade' | 'profile';
  label?: string;
  icon?: string;
  route?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {
  private currentRoute: string = '';
  private isAuthPage: boolean = false;
  private logo$ = new BehaviorSubject<ToolbarLogo>({
    src: 'assets/images/RIVO9 logo.webp',
    alt: 'RIVO9 Logo',
    link: '/'
  });

  private navItems$ = new BehaviorSubject<ToolbarNavItem[]>([
    { label: 'Brands', route: '/brands/categories', scrollId: '' },
    { label: 'Developers', route: '/developer', scrollId: 'developers-section' },
    { label: 'Pricing', route: '/pricing', scrollId: 'pricing-section' },
    { label: 'Blog', route: '/blog', scrollId: 'blog-section' }
  ]);

  private actions$ = new BehaviorSubject<ToolbarAction[]>([
    { type: 'login', label: 'Login', route: '/login' },
    { type: 'get-started', label: 'Get Started', icon: 'assets/icons/arrow_forward.webp', route: '/login' }
  ]);

  private profileAvatar$ = new BehaviorSubject<string>('assets/images/user-small-1.webp');
  public profileAvatar = this.profileAvatar$.asObservable();

  setProfileAvatar(url: string) {
    this.profileAvatar$.next(url);
  }

  logo = this.logo$.asObservable();
  navItems = this.navItems$.asObservable();
  actions = this.actions$.asObservable();

  constructor(private router: Router) {
    // Listen to route changes to detect auth pages
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
      this.isAuthPage = this.currentRoute.includes('/auth/login') || 
                       this.currentRoute.includes('/auth/signup') || 
                       this.currentRoute.includes('/auth/reset-password') ||
                       this.currentRoute.includes('/login') || 
                       this.currentRoute.includes('/signup') || 
                       this.currentRoute.includes('/reset-password');
      
      // console.log('Route changed:', this.currentRoute, 'isAuthPage:', this.isAuthPage);
    });
  }
  setProfileHeaderOnly() {
     this.logo$.next({
      src: 'assets/images/RIVO9 logo.webp',
      alt: '',
      link: '/'
    });
    this.navItems$.next([]);
    this.actions$.next([]);
  }
  private _showFooter = new BehaviorSubject<boolean>(true); // Default to true
  public showFooter$: Observable<boolean> = this._showFooter.asObservable();
    /**
   * Sets whether the footer should be visible.
   * @param isVisible True to show, false to hide.
   */
  setShowFooter(isVisible: boolean): void {
    this._showFooter.next(isVisible);
  }

  setLoggedInToolbar(): void {
    console.log('Setting logged in toolbar');
    this.logo$.next({
      src: 'assets/images/RIVO9 logo.webp',
      alt: 'RIVO9 Logo',
      link: '/home'
    });
    // Remove Pricing and Blog from logged-in header
    this.navItems$.next([
      // { label: 'Home', route: '/home', scrollId: '' },
      // { label: 'Brands', route: '/brands/categories', scrollId: '' },
      // { label: 'Brand API', route: '/brandApi', scrollId: '' },
      // { label: 'Developers', route: '/developer', scrollId: '' }
    ]);
    this.actions$.next([
      { type: 'upgrade', label: 'Upgrade'  },
      { type: 'profile', label: 'Profile', route: '/profile' }
    ]);
  }

  setLoggedOutToolbar(): void {
    // console.log('Setting logged out toolbar, isAuthPage:', this.isAuthPage);
    this.logo$.next({
      src: 'assets/images/RIVO9 logo.webp',
      alt: 'RIVO9 Logo',
      link: '/landing'
    });
    this.navItems$.next([
      { label: 'Brands', route: '/brands/categories', scrollId: '' },
      { label: 'Developers', route: '/developer', scrollId: '' },
      { label: 'Pricing', route: '/pricing', scrollId: '' },
      { label: 'Blog', route: '/blog', scrollId: '' }
    ]);
    
    // Hide auth buttons on auth pages
    if (this.isAuthPage) {
      this.actions$.next([]);
    } else {
      this.actions$.next([
        { type: 'login', label: 'Login', route: '/auth/login' },
        { type: 'get-started', label: 'Get Started', icon: 'assets/icons/arrow_forward.webp', route: '/auth/login' }
      ]);
    }
  }
}
