import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';
import { ThemeService } from '../../../core/services/theme.service'; // Adjusted import

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
  private themeService = inject(ThemeService); // Using actual ThemeService
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  // Theme properties
  isDarkMode: boolean = false;

  // Scroll properties
  isVisible: boolean = true;
  private lastScrollY: number = 0;
  private scrollSubject = new Subject<void>();

  // Mobile menu
  isMobileMenuOpen: boolean = false;

  // Subscriptions
  private destroy$ = new Subject<void>();
  private themeSubscription!: Subscription;
  private scrollSubscription!: Subscription;

  // Icon paths
  private logoPath = 'images/logo.svg'; // Updated path
  private sunIconPath = 'icons/sun.svg'; // Updated path
  private cloudIconPath = 'icons/cloud.svg'; // Updated path
  private arrowForwardIconPath = 'icons/arrow_forward.svg'; // Updated path

  constructor() {
    this.registerIcons();
  }

  ngOnInit(): void {
    // Initialize with current theme state
    this.themeSubscription = this.themeService.isDarkMode$.pipe(
        startWith(this.isDarkMode), // Emit initial value
        takeUntil(this.destroy$)
    ).subscribe(isDark => {
      this.isDarkMode = isDark;
      console.log('ToolbarComponent: Dark mode is now', this.isDarkMode);
    });

    // Emit initial value for isDarkMode$ if it's a BehaviorSubject or ReplaySubject(1)
    // For a simple Subject, we might need to push an initial value in the service itself.
    // For the mock, let's ensure it has a starting value.
    if (! (this.themeService.isDarkMode$ as any)._value) {
         (this.themeService.isDarkMode$ as any)._value = false; // Default to light mode
    }


    // Scroll handling
    this.scrollSubscription = this.scrollSubject.pipe(
      debounceTime(50), // Debounce scroll events by 50ms
      takeUntil(this.destroy$)
    ).subscribe(() => this.handleScroll());

    // Initial check for scroll position
    this.checkScrollPosition();
  }

  private registerIcons(): void {
    this.iconRegistry.addSvgIcon(
      'company-logo',
      this.sanitizer.bypassSecurityTrustResourceUrl(this.logoPath)
    );
    this.iconRegistry.addSvgIcon(
      'sun',
      this.sanitizer.bypassSecurityTrustResourceUrl(this.sunIconPath)
    );
    this.iconRegistry.addSvgIcon(
      'cloud',
      this.sanitizer.bypassSecurityTrustResourceUrl(this.cloudIconPath)
    );
    this.iconRegistry.addSvgIcon(
      'arrow-forward',
      this.sanitizer.bypassSecurityTrustResourceUrl(this.arrowForwardIconPath)
    );
    console.log('ToolbarComponent: Registered SVG icons');
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.scrollSubject.next();
  }

  private checkScrollPosition(): void {
    if (typeof window !== 'undefined') {
        this.handleScroll(); // Call immediately to set initial state
    }
  }

  private handleScroll(): void {
    if (typeof window !== 'undefined') {
      const currentScrollY = window.scrollY;
      if (currentScrollY === 0) {
        this.isVisible = true;
      } else if (currentScrollY > this.lastScrollY) {
        // Scrolling down
        this.isVisible = false;
      } else {
        // Scrolling up
        this.isVisible = true;
      }
      this.lastScrollY = currentScrollY;
      // console.log('ToolbarComponent: isVisible =', this.isVisible, 'scrollY =', currentScrollY);
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
    console.log('ToolbarComponent: Mobile menu toggled to', this.isMobileMenuOpen);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    console.log('ToolbarComponent: Unsubscribed from all observables.');
  }
}

// Placeholder for actual ThemeService - this should be in its own file (e.g., theme.service.ts)
// For the purpose of this task, we'll assume it exists and can be imported.
// If it doesn't exist, you'd typically create it like this:
/*
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this._isDarkMode.asObservable();

  constructor() {
    // Optional: Load theme preference from localStorage
    const storedPreference = localStorage.getItem('isDarkMode');
    if (storedPreference) {
      this._isDarkMode.next(JSON.parse(storedPreference));
    }
  }

  toggleDarkMode(): void {
    const newValue = !this._isDarkMode.value;
    this._isDarkMode.next(newValue);
    // Optional: Save theme preference to localStorage
    localStorage.setItem('isDarkMode', JSON.stringify(newValue));
  }
}
*/
