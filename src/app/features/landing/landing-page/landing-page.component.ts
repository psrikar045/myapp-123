import { Component, HostListener, OnDestroy, OnInit, inject, PLATFORM_ID, Inject, ViewChild } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, Subscription, fromEvent, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ThemeService } from '../../../core/services/theme.service';
import { LayoutService } from '../../../core/services/layout.service'; // Import LayoutService
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule, // Add MatSidenavModule
    MatListModule     // Add MatListModule for nav items in sidenav
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isDarkMode: boolean = false;
  isVisible: boolean = true;
  private lastScrollY: number = 0;

  // Replace isMobileView with Observable from LayoutService
  isMobile$: Observable<boolean>;

  private destroy$ = new Subject<void>();
  private themeSubscription!: Subscription;
  private scrollSubscription!: Subscription;

  private logoPath = 'public/images/logo.svg'; // Ensure correct path
  private sunIconPath = 'public/icons/sun.svg'; // Ensure correct path
  private cloudIconPath = 'public/icons/cloud.svg'; // Ensure correct path
  private arrowForwardIconPath = 'public/icons/arrow_forward.svg'; // Ensure correct path
  private menuIconPath = 'public/icons/menu.svg'; // Ensure correct path for menu icon

  private themeService = inject(ThemeService);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  public layoutService = inject(LayoutService); // Inject LayoutService
  @Inject(PLATFORM_ID) private platformId!: Object;

  constructor() {
    this.isMobile$ = this.layoutService.isMobile$; // Initialize isMobile$
    this.registerIcons();
  }

  ngOnInit(): void {
    this.themeSubscription = this.themeService.isDarkMode$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    if (isPlatformBrowser(this.platformId)) {
      this.checkScrollPosition();
      // REMOVED: this.checkScreenSize(); // Screen size is now handled by LayoutService

      this.scrollSubscription = fromEvent(window, 'scroll').pipe(
        debounceTime(50),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ).subscribe(() => this.handleScroll());

      // Close sidenav if screen size changes from mobile to desktop
      this.layoutService.isDesktop$.pipe(takeUntil(this.destroy$)).subscribe(isDesktop => {
        if (isDesktop && this.sidenav && this.sidenav.opened) {
          this.sidenav.close();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private registerIcons(): void {
    const icons = [
      { name: 'company-logo', path: this.logoPath },
      { name: 'sun', path: this.sunIconPath },
      { name: 'cloud', path: this.cloudIconPath },
      { name: 'arrow-forward', path: this.arrowForwardIconPath },
      { name: 'menu', path: this.menuIconPath } // Register menu icon
    ];
    icons.forEach(icon => {
      this.iconRegistry.addSvgIcon(
        icon.name,
        this.sanitizer.bypassSecurityTrustResourceUrl(icon.path)
      );
    });
    console.log('LandingPageComponent: Registered SVG icons including menu.');
  }

  private checkScrollPosition(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.lastScrollY = window.scrollY;
      this.handleScroll(); // Initial check
    }
  }

  private handleScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentScrollY = window.scrollY;
      if (currentScrollY === 0) {
        this.isVisible = true;
      } else if (currentScrollY > this.lastScrollY) {
        this.isVisible = false; // Scrolling down
      } else {
        this.isVisible = true; // Scrolling up
      }
      this.lastScrollY = currentScrollY < 0 ? 0 : currentScrollY;
    }
  }

  // REMOVED: checkScreenSize() and onWindowResize() as LayoutService handles this.

  toggleSidenav(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  closeSidenav(): void {
    if (this.sidenav && this.sidenav.opened) {
      this.sidenav.close();
    }
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  navigateToLogin(): void {
    console.log('LandingPageComponent: Navigating to login page...');
    this.closeSidenav(); // Close sidenav before navigating
    this.router.navigate(['/login']);
  }

  scrollToSection(sectionId: string): void {
    console.log(`LandingPageComponent: Attempting to scroll to section: ${sectionId}`);
    this.closeSidenav(); // Close sidenav before scrolling

    if (sectionId === 'login') {
      this.navigateToLogin();
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(sectionId);
      if (element) {
        console.log(`LandingPageComponent: Scrolling smoothly to physical section: #${sectionId}`);
        element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      } else {
        console.warn(`LandingPageComponent: Element with ID '${sectionId}' not found for scrolling.`);
        // Fallback or alternative navigation if element not found, e.g. for 'get-started'
        if (sectionId === 'get-started') {
          // Potentially navigate to a route or scroll to a known fallback element
          console.log("LandingPageComponent: 'get-started' section not found, consider alternative action.");
        }
      }
    } else {
      console.log(`LandingPageComponent: Skipping scroll on server for section: ${sectionId}`);
    }
  }
}