import { Injectable } from '@angular/core';

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
  type: 'theme-toggle' | 'login' | 'get-started';
  label?: string;
  icon?: string;
  route?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {
  logo: ToolbarLogo = {
    src: 'assets/logo icon.png',
    alt: 'Marketify',
    link: '/'
  };

  navItems: ToolbarNavItem[] = [
    { label: 'Brands', route: '/brands' },
    { label: 'Developers', route: '/developers' },
    { label: 'Pricing', route: '/pricing' },
    { label: 'Blog', route: '/blog' }
  ];

  actions: ToolbarAction[] = [
    // { type: 'theme-toggle', icon: 'assets/icons/fire.svg' }, // Hide fire toggle for now
    { type: 'login', label: 'Login', route: '/login' },
    { type: 'get-started', label: 'Get Start', icon: 'assets/icons/arrow_forward.svg', route: '/get-started' }
  ];

  constructor() { }
}
