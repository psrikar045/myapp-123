import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ToolbarService, ToolbarLogo, ToolbarNavItem, ToolbarAction } from '../../shared/services/toolbar.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';
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
  private lastScrollY = 0;
  private showTimeout: any;
  constructor(
    private toolbarService: ToolbarService,
    private authService: AuthService,
    private router: Router
  ) {
    this.logo$ = this.toolbarService.logo;
    this.navItems$ = this.toolbarService.navItems;
    this.actions$ = this.toolbarService.actions;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
        this.showNavigation = !this.currentRoute.startsWith('/my-profile');
      }
    });
  }

  ngOnInit(): void {
    // this.authService.isAuthenticated$.subscribe(isAuthenticated => {
    //   if (isAuthenticated) {
    //     this.toolbarService.setLoggedInToolbar();
    //   } else {
    //     this.toolbarService.setLoggedOutToolbar();
    //   }
    // });
    
  }
login() {
this.authService.checkAuthStatusAndNavigate();
}
  onNavClick(item: ToolbarNavItem) {
    if (item.label === 'Blog') {
      this.router.navigate(['/blog']);
    } else if (item.scrollId && this.router.url.startsWith('/landing')) {
      const el = document.getElementById(item.scrollId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
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
    this.router.navigate(['/all-categories']);
  }
  
  private isHeroSectionInView(): boolean {
    const hero = document.getElementById('hero');
    if (!hero) return false;
    const rect = hero.getBoundingClientRect();
    // Consider in view if at least 40px of hero is visible at the top
    return rect.top <= 80 && rect.bottom > 40;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScrollY = window.scrollY;
    // Add background if scrolled or if hero section is in view
    this.isScrolled = currentScrollY > 0 || this.isHeroSectionInView();
    console.log('window.scrollY:', currentScrollY);
    if (currentScrollY <= 70) {
      // Always show at the top or in hero section
      this.isVisible = true;
      if (this.showTimeout) clearTimeout(this.showTimeout);
    } else if (currentScrollY > this.lastScrollY) {
      // Scrolling down
      this.isVisible = false;
      if (this.showTimeout) clearTimeout(this.showTimeout);
    } else if (currentScrollY < this.lastScrollY) {
      // Scrolling up
      this.isVisible = true;
      if (this.showTimeout) clearTimeout(this.showTimeout);
      this.showTimeout = setTimeout(() => {
        if (window.scrollY > 70) {
          this.isVisible = false;
        }
      }, 6000);
    }
    this.lastScrollY = currentScrollY < 0 ? 0 : currentScrollY;
  }
}
