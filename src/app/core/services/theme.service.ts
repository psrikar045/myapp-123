import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private static readonly THEME_STORAGE_KEY = 'app-theme-dark';
  private _isDarkMode: BehaviorSubject<boolean>;

  public isDarkMode$: Observable<boolean>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    let initialDarkMode = false;
    if (isPlatformBrowser(this.platformId)) {
      const storedPreference = localStorage.getItem(ThemeService.THEME_STORAGE_KEY);
      if (storedPreference) {
        initialDarkMode = JSON.parse(storedPreference);
      } else {
        // Default to system preference if no stored preference
        initialDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }
    this._isDarkMode = new BehaviorSubject<boolean>(initialDarkMode);
    this.isDarkMode$ = this._isDarkMode.asObservable();

    // Apply theme class to body for global styles if needed, or let components handle it
    if (isPlatformBrowser(this.platformId)) {
        this._updateBodyClass(initialDarkMode);
    }
  }

  public toggleDarkMode(): void {
    const newDarkModeState = !this._isDarkMode.value;
    this._isDarkMode.next(newDarkModeState);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(ThemeService.THEME_STORAGE_KEY, JSON.stringify(newDarkModeState));
      this._updateBodyClass(newDarkModeState);
    }
  }

  private _updateBodyClass(isDark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
        if (isDark) {
            document.body.classList.add('dark-theme-global'); // Optional: for global body styling
        } else {
            document.body.classList.remove('dark-theme-global');
        }
    }
  }

  public getIsDarkMode(): boolean {
    return this._isDarkMode.value;
  }
}
