import { Component, HostListener, OnDestroy, OnInit, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common'; // Import isPlatformBrowser
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
      this.checkScreenSize();

      this.scrollSubscription = fromEvent(window, 'scroll').pipe(
        debounceTime(50),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ).subscribe(() => this.handleScroll());
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

  scrollToSection(sectionId: string): void {
    console.log(`ToolbarComponent: Attempting to scroll to section: ${sectionId}`);

    if (this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }

    // Ensure scrolling logic only runs in the browser
    if (isPlatformBrowser(this.platformId)) {
      // The 'login' case might be handled by a different method (MapsToLogin) as per assumption.
      // This check remains as a safeguard or for other potential uses of scrollToSection('login').
      if (sectionId === 'login') {
        // Potentially navigate to a login page/route or open a modal.
        // This specific action is assumed to be handled by MapsToLogin() if called directly by the login button.
        console.log('Login section scroll/navigation triggered.');
        // Example: this.router.navigate(['/login']);
        return;
      }

      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        console.log(`ToolbarComponent: Successfully scrolled to section: ${sectionId}`);
      } else {
        console.warn(`ToolbarComponent: Element with ID '${sectionId}' not found. Cannot scroll.`);
      }
    } else {
      console.log(`ToolbarComponent: Skipping scroll for section '${sectionId}' (not in browser environment).`);
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
