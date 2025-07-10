import { Component, HostListener, OnDestroy, OnInit, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, takeUntil } from 'rxjs/operators';
import { ThemeService } from '../../../core/services/theme.service';
// import { trigger, state, style, animate, transition } from '@angular/animations'; // For Angular animations

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
  // Example for Angular animations if mobile menu needs it:
  // animations: [
  //   trigger('mobileMenuOverlayAnimation', [
  //     state('open', style({ transform: 'translateX(0)', opacity: 1 })),
  //     state('closed', style({ transform: 'translateX(100%)', opacity: 0 })),
  //     transition('closed <=> open', animate('300ms ease-in-out'))
  //   ])
  // ]
})
export class ToolbarComponent implements OnInit, OnDestroy {
  // Injections
  private themeService = inject(ThemeService);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  @Inject(PLATFORM_ID) private platformId!: Object;

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
  // public mobileMenuState: 'open' | 'closed' = 'closed'; // For Angular animations

  // Subscriptions
  private destroy$ = new Subject<void>();
  private themeSubscription!: Subscription;
  private scrollSubscription!: Subscription;
  // private resizeSubscription!: Subscription; // Replaced by @HostListener as per previous iteration

  // Icon paths
  private logoPath = 'images/logo.svg';
  private sunIconPath = 'icons/sun.svg';
  private cloudIconPath = 'icons/cloud.svg';
  private arrowForwardIconPath = 'icons/arrow_forward.svg';
  private menuIconPath = 'icons/menu.svg';

  constructor() {
    this.registerIcons();
  }

  ngOnInit(): void {
    this.themeSubscription = this.themeService.isDarkMode$.pipe(
      // Ensure isDarkMode$ in ThemeService is BehaviorSubject or similar to get current value
      // startWith(this.themeService.isDarkMode$.getValue()),
      takeUntil(this.destroy$)
    ).subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    if (isPlatformBrowser(this.platformId)) {
      this.checkScrollPosition();
      this.checkScreenSize(); // Initial check for mobile view

      this.scrollSubscription = fromEvent(window, 'scroll').pipe(
        debounceTime(50),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ).subscribe(() => this.handleScroll());

      // @HostListener('window:resize') is used for resize handling as per previous steps.
      // If fromEvent were preferred for resize, it would be set up here similarly to scroll.
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

  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      const wasMobile = this.isMobileView;
      this.isMobileView = window.innerWidth < this.mobileBreakpoint;

      if (wasMobile && !this.isMobileView && this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
        // this.mobileMenuState = 'closed'; // For Angular animations
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?: Event): void {
    // Debouncing can be added here if performance issues arise from frequent resize events,
    // though typically direct calls are fine for updating a boolean.
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
    // if (this.isMobileMenuOpen) { // For Angular animations
    //   this.mobileMenuState = 'open';
    // } else {
    //   this.mobileMenuState = 'closed';
    // }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
