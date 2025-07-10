import { Component, HostListener, OnDestroy, OnInit, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, takeUntil, filter } from 'rxjs/operators';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit, OnDestroy {
  // Injections
  private themeService = inject(ThemeService);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  @Inject(PLATFORM_ID) private platformId: Object;

  // Theme properties
  isDarkMode: boolean = false;

  // Scroll properties
  isVisible: boolean = true;
  private lastScrollY: number = 0;

  // Resize properties
  isMobileView: boolean = false;
  private mobileBreakpoint: number = 960; // Breakpoint for mobile view

  // Mobile menu
  isMobileMenuOpen: boolean = false;

  // Subscriptions
  private destroy$ = new Subject<void>();
  private themeSubscription!: Subscription;
  private scrollSubscription!: Subscription;
  private resizeSubscription!: Subscription;

  // Icon paths - now prefixed with assets/
  private logoPath = 'assets/images/logo.svg';
  private sunIconPath = 'assets/icons/sun.svg';
  private cloudIconPath = 'assets/icons/cloud.svg';
  private arrowForwardIconPath = 'assets/icons/arrow_forward.svg';
  private menuIconPath = 'assets/icons/menu.svg'; // For custom hamburger icon

  constructor() {
    this.registerIcons();
  }

  ngOnInit(): void {
    this.themeSubscription = this.themeService.isDarkMode$.pipe(
      startWith(this.themeService.isDarkMode$.getValue()), // Ensure initial value
      takeUntil(this.destroy$)
    ).subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    if (isPlatformBrowser(this.platformId)) {
      // Initial check for scroll and resize, only in browser
      this.checkScrollPosition();
      this.checkScreenSize();

      // Scroll handling
      this.scrollSubscription = fromEvent(window, 'scroll').pipe(
        debounceTime(50), // Debounce scroll events
        distinctUntilChanged(), // Only emit if value has changed (though scrollY always changes, good practice)
        takeUntil(this.destroy$)
      ).subscribe(() => this.handleScroll());

      // Resize handling
      this.resizeSubscription = fromEvent(window, 'resize').pipe(
        debounceTime(100), // Debounce resize events
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ).subscribe(() => this.checkScreenSize());
    }
  }

  private registerIcons(): void {
    const icons = [
      { name: 'company-logo', path: this.logoPath },
      { name: 'sun', path: this.sunIconPath },
      { name: 'cloud', path: this.cloudIconPath },
      { name: 'arrow-forward', path: this.arrowForwardIconPath },
      { name: 'custom-menu', path: this.menuIconPath } // Register custom menu icon
    ];
    icons.forEach(icon => {
      this.iconRegistry.addSvgIcon(
        icon.name,
        this.sanitizer.bypassSecurityTrustResourceUrl(icon.path)
      );
    });
    console.log('ToolbarComponent: Registered SVG icons with assets/ prefix.');
  }

  // No HostListener for scroll, using fromEvent in ngOnInit for better control and SSR safety
  // No HostListener for resize, using fromEvent in ngOnInit

  private checkScrollPosition(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.lastScrollY = window.scrollY; // Initialize lastScrollY
      this.handleScroll(); // Call immediately to set initial state
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
      this.lastScrollY = currentScrollY < 0 ? 0 : currentScrollY; // Ensure lastScrollY isn't negative
    }
  }

  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobileView = window.innerWidth < this.mobileBreakpoint;
      // If resizing to desktop view and mobile menu is open, close it
      if (!this.isMobileView && this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?: Event): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }


  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  scrollToSection(sectionId: string): void {
    console.log(`ToolbarComponent: Scrolling to section: ${sectionId}`);
    if (this.isMobileMenuOpen) {
      this.toggleMobileMenu(); // Close menu after selection
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    console.log('ToolbarComponent: Unsubscribed from all observables.');
  }
}
