import { Component, HostListener, OnDestroy, OnInit, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, takeUntil } from 'rxjs/operators';
import { ThemeService } from '../../../core/services/theme.service'
import { Router } from '@angular/router'; // Added Router import

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
  // REMOVED: Angular animations placeholder for mobile menu
})
export class LandingPageComponent implements OnInit, OnDestroy {
  // Properties from ToolbarComponent
  isDarkMode: boolean = false;
  isVisible: boolean = true;
  private lastScrollY: number = 0;
  isMobileView: boolean = false;
  private mobileBreakpoint: number = 960;
  // REMOVED: isMobileMenuOpen property
  private destroy$ = new Subject<void>();
  private themeSubscription!: Subscription;
  private scrollSubscription!: Subscription;

  private logoPath = 'images/logo.svg';
  private sunIconPath = 'icons/sun.svg';
  private cloudIconPath = 'icons/cloud.svg';
  private arrowForwardIconPath = 'icons/arrow_forward.svg';
  // REMOVED: private menuIconPath = 'images/icons/menu.svg';

  // Injections from ToolbarComponent (and existing if any)
  private themeService = inject(ThemeService);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  @Inject(PLATFORM_ID) private platformId!: Object;

  constructor() {
    this.registerIcons();
  }

  ngOnInit(): void {
    this.themeSubscription = this.themeService.isDarkMode$.pipe(
      // startWith(this.themeService.isDarkMode$.getValue()),
      takeUntil(this.destroy$)
    ).subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    if (isPlatformBrowser(this.platformId)) {
      this.checkScrollPosition();
      this.checkScreenSize();

      this.scrollSubscription = fromEvent(window, 'scroll').pipe(
        debounceTime(50),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ).subscribe(() => this.handleScroll());
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Methods from ToolbarComponent
  private registerIcons(): void {
    const icons = [
      { name: 'company-logo', path: this.logoPath },
      { name: 'sun', path: this.sunIconPath },
      { name: 'cloud', path: this.cloudIconPath },
      { name: 'arrow-forward', path: this.arrowForwardIconPath },
      // REMOVED: { name: 'custom-menu', path: this.menuIconPath } // Removed as hamburger icon is removed
    ];
    icons.forEach(icon => {
      this.iconRegistry.addSvgIcon(
        icon.name,
        this.sanitizer.bypassSecurityTrustResourceUrl(icon.path)
      );
    });
    console.log('LandingPageComponent (Toolbar logic): Registered SVG icons.');
  }

  private checkScrollPosition(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.lastScrollY = window.scrollY;
      this.handleScroll();
    }
  }

  private handleScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentScrollY = window.scrollY;
      if (currentScrollY === 0) {
        this.isVisible = true;
      } else if (currentScrollY > this.lastScrollY) {
        this.isVisible = false;
      } else {
        this.isVisible = true;
      }
      this.lastScrollY = currentScrollY < 0 ? 0 : currentScrollY;
    }
  }

  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      const wasMobile = this.isMobileView;
      this.isMobileView = window.innerWidth < this.mobileBreakpoint;

      // The condition to close mobile menu if it was open and now is no longer mobile view
      // is removed as there is no mobile menu to close.
      // if (wasMobile && !this.isMobileView && this.isMobileMenuOpen) {
      //   this.isMobileMenuOpen = false;
      // }
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?: Event): void {
    this.checkScreenSize();
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  // Renamed MapsToLogin to navigateToLogin for consistency with HTML
  navigateToLogin(): void {
    console.log('LandingPageComponent: Navigating to login page...');
    // REMOVED: Check and toggle mobile menu as there is no mobile menu
    this.router.navigate(['/login']);
  }

  scrollToSection(sectionId: string): void {
    console.log(`LandingPageComponent: Attempting to scroll to section: ${sectionId}`);

    if (sectionId === 'login') {
      this.navigateToLogin(); // Direct call to navigateToLogin
      return; // Exit after navigation
    }

    // REMOVED: Check and toggle mobile menu as there is no mobile menu
    // if (this.isMobileMenuOpen) {
    //   this.toggleMobileMenu();
    // }

    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(sectionId);
      if (element) {
        console.log(`LandingPageComponent: Scrolling smoothly to physical section: #${sectionId}`);
        element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      } else {
        console.warn(`LandingPageComponent: Element with ID '${sectionId}' not found for scrolling.`);
      }
    } else {
      console.log(`LandingPageComponent: Skipping scroll on server for section: ${sectionId}`);
    }
  }

  // REMOVED: toggleMobileMenu() method
}