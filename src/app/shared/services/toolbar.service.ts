import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToolbarLogo {
  src: string;
  alt: string;
  link: string;
}

export interface ToolbarNavItem {
  label: string;
  route: string;
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
    { label: 'Brands', route: '/brands' },
    { label: 'Developers', route: '/developers' },
    { label: 'Pricing', route: '/pricing' },
    { label: 'Blog', route: '/blog' }
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
  setLoggedInToolbar(): void {
    this.logo$.next({
      src: 'landing/logo icon.png',
      alt: 'Marketify',
      link: '/home'
    });
    this.navItems$.next([
      { label: 'Home', route: '/home' },
      { label: 'Brand API', route: '/brand-api' },
      { label: 'Logo link', route: '/logo-link' },
      { label: 'Search API', route: '/search-api' }
    ]);
    this.actions$.next([
      { type: 'upgrade', label: 'Upgrade' },
      { type: 'profile', label: 'Profile' }
    ]);
  }

  setLoggedOutToolbar(): void {
    this.logo$.next({
      src: 'landing/logo icon.png',
      alt: 'Marketify',
      link: '/'
    });
    this.navItems$.next([
      { label: 'Brands', route: '/brands' },
      { label: 'Developers', route: '/developers' },
      { label: 'Pricing', route: '/pricing' },
      { label: 'Blog', route: '/blog' }
    ]);
    this.actions$.next([
      { type: 'login', label: 'Login', route: '/login' },
      { type: 'get-started', label: 'Get Started', icon: 'assets/icons/arrow_forward.svg', route: '/my-profile' }
    ]);
  }
}
