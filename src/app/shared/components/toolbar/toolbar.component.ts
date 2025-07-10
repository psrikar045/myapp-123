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
  // If Angular animations were to be used for mobile menu:
  // animations: [
  //   trigger('mobileMenuOverlayAnimation', [
  //     state('void', style({ transform: 'translateX(100%)', opacity: 0 })),
  //     state('*', style({ transform: 'translateX(0)', opacity: 1 })),
  //     transition('void <=> *', animate('300ms ease-in-out'))
  //   ])
  // ]
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

  // Icon paths
  private logoPath = 'assets/images/logo.svg';
  private sunIconPath = 'assets/icons/sun.svg';
  private cloudIconPath = 'assets/icons/cloud.svg';
  private arrowForwardIconPath = 'assets/icons/arrow_forward.svg';
  private menuIconPath = 'assets/icons/menu.svg'; // For custom hamburger icon

  constructor() {
    this.registerIcons();
  }

  ngOnInit(): void {
    // Subscribe to theme changes
    // Ensure themeService.isDarkMode$ is a BehaviorSubject or ReplaySubject(1) in ThemeService
    // or that it otherwise provides the current value upon subscription.
    this.themeSubscription = this.themeService.isDarkMode$.pipe(
      startWith(this.themeService.isDarkMode$.getValue()), // Assumes getValue() exists for BehaviorSubject
      takeUntil(this.destroy$)
    ).subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    if (isPlatformBrowser(this.platformId)) {
      // Initial check for scroll and resize, only in browser
      this.checkScrollPosition();
      this.checkScreenSize(); // Initial check for mobile view

      // Scroll handling
      this.scrollSubscription = fromEvent(window, 'scroll').pipe(
        debounceTime(50),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ).subscribe(() => this.handleScroll());

      // Resize handling - This is one way to handle resize.
      // @HostListener below is another. Choose one or ensure they don't conflict.
      // For this iteration, @HostListener is explicitly requested by the prompt.
      // So, this fromEvent based resize listener could be removed if @HostListener is preferred.
      // However, fromEvent offers more explicit control over debouncing and unsubscription.
      // Let's keep the @HostListener as per prompt and remove this one to avoid duplication.
      // If this fromEvent was kept, @HostListener('window:resize') would be redundant.
      // For now, I will comment out this fromEvent based resize listener to ensure clarity with the prompt's @HostListener requirement.
      /*
      this.resizeSubscription = fromEvent(window, 'resize').pipe(
        debounceTime(100),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ).subscribe(() => this.checkScreenSize());
      */
    }
  }

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

  // This method is called by the @HostListener('window:resize')
  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      const wasMobile = this.isMobileView;
      this.isMobileView = window.innerWidth < this.mobileBreakpoint;

      // If screen size changes from mobile to desktop and mobile menu is open, close it.
      if (wasMobile && !this.isMobileView && this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?: Event): void {
    // Debouncing here can be tricky with HostListener directly.
    // For more complex scenarios or explicit debounce, 'fromEvent(window, 'resize')' in ngOnInit is better.
    // However, for simple updates, this is fine.
    this.checkScreenSize();
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  scrollToSection(sectionId: string): void {
    console.log(`ToolbarComponent: Scrolling to section: ${sectionId}`);
    if (this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
