import { Injectable, Renderer2, RendererFactory2, inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common'; // <-- Ensure isPlatformBrowser is imported

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$: Observable<boolean> = this._isDarkMode.asObservable();
  private renderer: Renderer2;
  private readonly platformId = inject(PLATFORM_ID); // <-- Inject PLATFORM_ID

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    // Only attempt to load from localStorage and apply to body if in browser
    if (isPlatformBrowser(this.platformId)) { // <-- Add this check
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this._isDarkMode.next(savedTheme === 'dark');
      } else {
        // Check system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        this._isDarkMode.next(prefersDark);
      }
      // Apply initial theme to body based on loaded state
      this.applyThemeToBody(this._isDarkMode.value);

      // Subscribe to changes ONLY in browser to update localStorage
      this.isDarkMode$.subscribe(isDark => {
        this.applyThemeToBody(isDark);
        // Guard this localStorage operation as well
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }
      });
    } else {
      // For SSR, default to light mode or a theme based on initial server state if desired
      // Or just let it be its initial BehaviorSubject value (false for light)
      this._isDarkMode.next(false); // Default to light mode for SSR
    }
  }

  toggleDarkMode(): void {
    // This method will only update the BehaviorSubject.
    // The subscription (which updates localStorage) is already platform-guarded.
    this._isDarkMode.next(!this._isDarkMode.value);
  }

  getIsDarkMode(): boolean {
    return this._isDarkMode.value;
  }

  private applyThemeToBody(isDark: boolean): void {
    // This method needs to ensure document.body is available
    if (isPlatformBrowser(this.platformId)) { // <-- Add this check
      if (isDark) {
        this.renderer.addClass(document.body, 'dark-theme');
      } else {
        this.renderer.removeClass(document.body, 'dark-theme');
      }
    }
  }
}
