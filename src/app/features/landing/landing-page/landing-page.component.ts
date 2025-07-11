import { Component, HostListener, OnDestroy, OnInit, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, takeUntil } from 'rxjs/operators';
import { ThemeService } from '../../core/services/theme.service'; // Adjusted path
import { Router } from '@angular/router'; // Added Router import

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule, // Added
    MatButtonModule,  // Added
    MatIconModule     // Added
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
  // Placeholder for Angular animations if needed for mobile menu
  // animations: [
  //   trigger('mobileMenuOverlayAnimation', [
  //     state('open', style({ transform: 'translateX(0)', opacity: 1 })),
  //     state('closed', style({ transform: 'translateX(100%)', opacity: 0 })),
  //     transition('closed <=> open', animate('300ms ease-in-out'))
  //   ])
  // ]
})
export class LandingPageComponent implements OnInit, OnDestroy {
  // Properties from ToolbarComponent
  isDarkMode: boolean = false;
  isVisible: boolean = true;
  private lastScrollY: number = 0;
  isMobileView: boolean = false;
  private mobileBreakpoint: number = 960;
  isMobileMenuOpen: boolean = false;
  private destroy$ = new Subject<void>();
  private themeSubscription!: Subscription;
  private scrollSubscription!: Subscription;

  private logoPath = 'assets/images/logo.svg';
  private sunIconPath = 'assets/icons/sun.svg';
  private cloudIconPath = 'assets/icons/cloud.svg';
  private arrowForwardIconPath = 'assets/icons/arrow_forward.svg';
  private menuIconPath = 'assets/icons/menu.svg';

  // Injections from ToolbarComponent (and existing if any)
  private themeService = inject(ThemeService);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router); // Added Router injection
  @Inject(PLATFORM_ID) private platformId: Object;

  // Existing LandingPageComponent properties (if any) would go here

  constructor() {
    // Logic from ToolbarComponent's constructor
    this.registerIcons();
    // Existing LandingPageComponent constructor logic (if any) would go here
  }

  ngOnInit(): void {
    // Logic from ToolbarComponent's ngOnInit
    this.themeSubscription = this.themeService.isDarkMode$.pipe(
      startWith(this.themeService.isDarkMode$.getValue()),
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
    // Existing LandingPageComponent ngOnInit logic (if any) would go here
  }

  ngOnDestroy(): void {
    // Logic from ToolbarComponent's ngOnDestroy
    this.destroy$.next();
    this.destroy$.complete();
    // Existing LandingPageComponent ngOnDestroy logic (if any) would go here
  }

  // Methods from ToolbarComponent
  private registerIcons(): void {
    const icons = [
      { name: 'company-logo', path: this.logoPath },
      { name: 'sun', path: this.sunIconPath },
      { name: 'cloud', path: this.cloudIconPath },
      { name: 'arrow-forward', path: this.arrowForwardIconPath },
      { name: 'custom-menu', path: this.menuIconPath }
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

      if (wasMobile && !this.isMobileView && this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?: Event): void {
    this.checkScreenSize();
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  // Placeholder for MapsToLogin as it was not in the provided ToolbarComponent code
  // but mentioned as being called by the Login button.
  MapsToLogin(): void {
    console.log('LandingPageComponent (Toolbar logic): MapsToLogin() called. Navigating to /login.');
    this.router.navigate(['/login']); // Example navigation
  }

  scrollToSection(sectionId: string): void {
    // If the login button directly calls MapsToLogin, this 'login' case might not be hit from that button.
    // However, if scrollToSection('login') is called from elsewhere, this handles it.
    if (sectionId === 'login') {
      this.MapsToLogin();
      if (this.isMobileMenuOpen) { // Ensure menu closes if login is triggered from menu
        this.toggleMobileMenu();
      }
      return;
    }

    console.log(`LandingPageComponent (Toolbar logic): Attempting to scroll to section: ${sectionId}`);

    if (this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }

    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        console.log(`LandingPageComponent (Toolbar logic): Successfully scrolled to section: ${sectionId}`);
      } else {
        console.warn(`LandingPageComponent (Toolbar logic): Element with ID '${sectionId}' not found. Cannot scroll.`);
      }
    } else {
      console.log(`LandingPageComponent (Toolbar logic): Skipping scroll for section '${sectionId}' (not in browser environment).`);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Existing LandingPageComponent methods (if any) would go here
}
