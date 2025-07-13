import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private logo$ = new BehaviorSubject<ToolbarLogo>({
    src: 'landing/logo icon.png',
    alt: 'Marketify',
    link: '/'
  });

  private navItems$ = new BehaviorSubject<ToolbarNavItem[]>([
    { label: 'Brands', route: '', scrollId: 'brands-section' },
    { label: 'Developers', route: '', scrollId: 'developers-section' },
    { label: 'Pricing', route: '', scrollId: 'pricing-section' },
    { label: 'Blog', route: '', scrollId: 'blog-section' }
  ]);

  private actions$ = new BehaviorSubject<ToolbarAction[]>([
    { type: 'login', label: 'Login', route: '/login' },
    { type: 'get-started', label: 'Get Started', icon: 'assets/icons/arrow_forward.svg', route: '/my-profile' }
  ]);

  logo = this.logo$.asObservable();
  navItems = this.navItems$.asObservable();
  actions = this.actions$.asObservable();

  constructor() { }
  setProfileHeaderOnly() {
     this.logo$.next({
      src: 'assets/logo icon.png',
      alt: 'Marketify',
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
    this.logo$.next({
      src: 'landing/logo icon.png',
      alt: 'Marketify',
      link: '/home'
    });
    this.navItems$.next([
      { label: 'Home', route: '/home', scrollId: '' },
      { label: 'Brand API', route: '/brandApi', scrollId: '' },
      { label: 'Logo link', route: '/logo-link', scrollId: '' },
      { label: 'Search API', route: '/search-api', scrollId: '' }
    ]);
    this.actions$.next([
      { type: 'upgrade', label: 'Upgrade' },
      { type: 'profile', label: 'Profile', route: '/my-profile' }
    ]);
  }

  setLoggedOutToolbar(): void {
    this.logo$.next({
      src: 'landing/logo icon.png',
      alt: 'Marketify',
      link: '/'
    });
    this.navItems$.next([
      { label: 'Brands', route: '', scrollId: 'brands-section' },
      { label: 'Developers', route: '', scrollId: 'developers-section' },
      { label: 'Pricing', route: '', scrollId: 'pricing-section' },
      { label: 'Blog', route: '', scrollId: 'blog-section' }
    ]);
    this.actions$.next([
      { type: 'login', label: 'Login', route: '/login' },
      { type: 'get-started', label: 'Get Started', icon: 'assets/icons/arrow_forward.svg', route: '/my-profile' }
    ]);
  }
}
