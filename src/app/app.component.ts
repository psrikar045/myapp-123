import { Component, OnInit } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { filter, map, Observable } from 'rxjs';
import { MainLayoutComponent } from './shared/components/layout/main-layout.component';
import { GlobalSpinnerComponent } from './core/components/global-spinner/global-spinner.component';
import { ErrorBoundaryComponent } from './core/components/error-boundary/error-boundary.component';
import { ToolbarService } from './shared/services/toolbar.service';
import { ThemeUtilsService } from './shared/services/theme-utils.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    MainLayoutComponent, 
    GlobalSpinnerComponent, 
    ErrorBoundaryComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router, 
    private toolbarService: ToolbarService,
    private themeUtilsService: ThemeUtilsService
  ) {}

  ngOnInit() {
    // Initialize theme utilities (if method exists)
    // this.themeUtilsService.initializeTheme();
    
    // Logic to update footer visibility based on route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects)
    ).subscribe(url => {
      // Define routes where footer should be hidden
      const authRoutes = ['/login', '/reset-password', '/forgot-password', '/search'];
      const hideFooter = authRoutes.some(route => url.includes(route));
      this.toolbarService.setShowFooter(!hideFooter);
    });
  }
}
