import { Component, Input, OnInit } from '@angular/core';
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

  onNavClick(item: ToolbarNavItem) {
    if (item.scrollId && this.router.url.startsWith('/landing')) {
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
  logout(event: Event) {
  console.log('logout');
  }
}
