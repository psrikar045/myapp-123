import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface AppThemeConfig {
  // Core theme settings (always available)
  mode: 'light' | 'dark' | 'auto';
  
  // Advanced settings (available after login)
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily: 'default' | 'serif' | 'mono';
  fontWeight: 'light' | 'normal' | 'medium' | 'bold';
  lineHeight: 'tight' | 'normal' | 'relaxed';
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  spacing: 'compact' | 'normal' | 'comfortable';
  animations: boolean;
  shadows: boolean;
  blur: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  preset: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  config: Partial<AppThemeConfig>;
}

@Injectable({
  providedIn: 'root'
})
export class AppThemeService {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  
  private readonly STORAGE_KEY = 'app-theme-config';
  
  // Default configuration
  private readonly defaultConfig: AppThemeConfig = {
    mode: 'light',
    primaryColor: '#4A50E0',
    accentColor: '#6366f1',
    fontSize: 'medium',
    fontFamily: 'default',
    fontWeight: 'normal',
    lineHeight: 'normal',
    borderRadius: 'medium',
    spacing: 'normal',
    animations: true,
    shadows: true,
    blur: true,
    highContrast: false,
    reducedMotion: false,
    preset: 'default'
  };

  // Built-in presets
  private readonly presets: ThemePreset[] = [
    {
      id: 'default-light',
      name: 'Default Light',
      description: 'Clean and modern light theme',
      isPremium: false,
      config: { mode: 'light', preset: 'default-light' }
    },
    {
      id: 'default-dark',
      name: 'Default Dark',
      description: 'Elegant dark theme',
      isPremium: false,
      config: { mode: 'dark', preset: 'default-dark' }
    },
    {
      id: 'ocean-blue',
      name: 'Ocean Blue',
      description: 'Calming blue tones with modern aesthetics',
      isPremium: true,
      config: {
        mode: 'light',
        primaryColor: '#0ea5e9',
        accentColor: '#06b6d4',
        preset: 'ocean-blue'
      }
    },
    {
      id: 'forest-green',
      name: 'Forest Green',
      description: 'Natural green theme for productivity',
      isPremium: true,
      config: {
        mode: 'light',
        primaryColor: '#059669',
        accentColor: '#10b981',
        preset: 'forest-green'
      }
    },
    {
      id: 'sunset-orange',
      name: 'Sunset Orange',
      description: 'Warm and energetic orange theme',
      isPremium: true,
      config: {
        mode: 'light',
        primaryColor: '#ea580c',
        accentColor: '#f97316',
        preset: 'sunset-orange'
      }
    },
    {
      id: 'midnight-purple',
      name: 'Midnight Purple',
      description: 'Sophisticated dark purple theme',
      isPremium: true,
      config: {
        mode: 'dark',
        primaryColor: '#8b5cf6',
        accentColor: '#a855f7',
        preset: 'midnight-purple'
      }
    },
    {
      id: 'high-contrast',
      name: 'High Contrast',
      description: 'Maximum accessibility with high contrast',
      isPremium: true,
      config: {
        mode: 'light',
        primaryColor: '#000000',
        accentColor: '#333333',
        highContrast: true,
        preset: 'high-contrast'
      }
    }
  ];

  // State management
  private _themeConfig = new BehaviorSubject<AppThemeConfig>(this.defaultConfig);
  private _isAuthenticated = new BehaviorSubject<boolean>(false);

  // Public observables
  public themeConfig$ = this._themeConfig.asObservable();
  public isAuthenticated$ = this._isAuthenticated.asObservable();
  
  // Computed observables
  public isDarkMode$ = this.themeConfig$.pipe(
    map(config => config.mode === 'dark' || (config.mode === 'auto' && this.isSystemDarkMode()))
  );

  public availablePresets$ = combineLatest([this.isAuthenticated$]).pipe(
    map(([isAuth]) => this.presets.filter(preset => !preset.isPremium || isAuth))
  );

  public canAccessAdvancedFeatures$ = this.isAuthenticated$;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
      this.subscribeToAuth();
    }
  }

  private initializeTheme(): void {
    // Load saved configuration
    const savedConfig = this.loadFromStorage();
    if (savedConfig) {
      this._themeConfig.next({ ...this.defaultConfig, ...savedConfig });
    }

    // Apply initial theme
    this.applyTheme(this._themeConfig.value);

    // Listen for system theme changes
    if (isPlatformBrowser(this.platformId) && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this._themeConfig.value.mode === 'auto') {
          this.applyTheme(this._themeConfig.value);
        }
      });
    }
  }

  private subscribeToAuth(): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this._isAuthenticated.next(isAuth);
      
      // If user logs out, reset to basic theme
      if (!isAuth) {
        this.resetToBasicTheme();
      }
    });
  }

  private isSystemDarkMode(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private loadFromStorage(): Partial<AppThemeConfig> | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(config: AppThemeConfig): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Handle storage errors silently
    }
  }

  private applyTheme(config: AppThemeConfig): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const root = document.documentElement;
    const isDark = config.mode === 'dark' || (config.mode === 'auto' && this.isSystemDarkMode());

    // Set Bootstrap theme attribute
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');

    // Apply CSS custom properties
    root.style.setProperty('--theme-mode', config.mode);
    root.style.setProperty('--theme-primary', config.primaryColor);
    root.style.setProperty('--theme-accent', config.accentColor);
    root.style.setProperty('--theme-font-size', this.getFontSizeValue(config.fontSize));
    root.style.setProperty('--theme-font-family', this.getFontFamilyValue(config.fontFamily));
    root.style.setProperty('--theme-font-weight', this.getFontWeightValue(config.fontWeight));
    root.style.setProperty('--theme-line-height', this.getLineHeightValue(config.lineHeight));
    root.style.setProperty('--theme-border-radius', this.getBorderRadiusValue(config.borderRadius));
    root.style.setProperty('--theme-spacing', this.getSpacingValue(config.spacing));
    root.style.setProperty('--theme-animations', config.animations ? 'all 0.3s ease' : 'none');
    root.style.setProperty('--theme-shadows', config.shadows ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none');
    root.style.setProperty('--theme-blur', config.blur ? 'blur(10px)' : 'none');

    // Apply body classes
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${config.fontSize}`);
    document.body.classList.add(`theme-font-${config.fontFamily}`);
    
    if (config.highContrast) document.body.classList.add('theme-high-contrast');
    if (config.reducedMotion) document.body.classList.add('theme-reduced-motion');

    // Set theme colors for dynamic elements
    this.updateThemeColors(config, isDark);
  }

  private updateThemeColors(config: AppThemeConfig, isDark: boolean): void {
    const root = document.documentElement;
    
    if (isDark) {
      root.style.setProperty('--theme-background', '#0d1117');
      root.style.setProperty('--theme-surface', '#161b22');
      root.style.setProperty('--theme-text', '#e6edf3');
    } else {
      root.style.setProperty('--theme-background', '#ffffff');
      root.style.setProperty('--theme-surface', '#f8f9fa');
      root.style.setProperty('--theme-text', '#212529');
    }
  }

  // Helper methods for CSS values
  private getFontSizeValue(size: string): string {
    const sizes = { small: '14px', medium: '16px', large: '18px', 'extra-large': '20px' };
    return sizes[size as keyof typeof sizes] || sizes.medium;
  }

  private getFontFamilyValue(family: string): string {
    const families = {
      default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: 'Georgia, "Times New Roman", serif',
      mono: '"Fira Code", "Cascadia Code", Consolas, monospace'
    };
    return families[family as keyof typeof families] || families.default;
  }

  private getFontWeightValue(weight: string): string {
    const weights = { light: '300', normal: '400', medium: '500', bold: '600' };
    return weights[weight as keyof typeof weights] || weights.normal;
  }

  private getLineHeightValue(height: string): string {
    const heights = { tight: '1.25', normal: '1.5', relaxed: '1.75' };
    return heights[height as keyof typeof heights] || heights.normal;
  }

  private getBorderRadiusValue(radius: string): string {
    const radii = { none: '0', small: '0.25rem', medium: '0.5rem', large: '1rem', full: '9999px' };
    return radii[radius as keyof typeof radii] || radii.medium;
  }

  private getSpacingValue(spacing: string): string {
    const spacings = { compact: '0.75', normal: '1', comfortable: '1.25' };
    return spacings[spacing as keyof typeof spacings] || spacings.normal;
  }

  // Public API methods
  public getCurrentConfig(): AppThemeConfig {
    return { ...this._themeConfig.value };
  }

  public updateConfig(updates: Partial<AppThemeConfig>): void {
    const currentConfig = this._themeConfig.value;
    const newConfig = { ...currentConfig, ...updates };
    
    this._themeConfig.next(newConfig);
    this.applyTheme(newConfig);
    this.saveToStorage(newConfig);
  }

  public toggleDarkMode(): void {
    const currentMode = this._themeConfig.value.mode;
    const newMode = currentMode === 'dark' ? 'light' : 'dark';
    this.updateConfig({ mode: newMode });
  }

  public applyPreset(presetId: string): void {
    const preset = this.presets.find(p => p.id === presetId);
    if (!preset) return;

    // Check if user can access premium presets
    if (preset.isPremium && !this._isAuthenticated.value) {
      console.warn('Premium preset requires authentication');
      return;
    }

    this.updateConfig(preset.config);
  }

  public resetToBasicTheme(): void {
    const basicConfig: AppThemeConfig = {
      ...this.defaultConfig,
      mode: this._themeConfig.value.mode // Keep current light/dark preference
    };
    
    this._themeConfig.next(basicConfig);
    this.applyTheme(basicConfig);
    this.saveToStorage(basicConfig);
  }

  public getAvailablePresets(): ThemePreset[] {
    const isAuth = this._isAuthenticated.value;
    return this.presets.filter(preset => !preset.isPremium || isAuth);
  }

  public canAccessAdvancedFeatures(): boolean {
    return this._isAuthenticated.value;
  }

  // Reset theme to defaults
  public resetToDefaults(): void {
    this._themeConfig.next({ ...this.defaultConfig });
    this.applyTheme(this.defaultConfig);
    this.saveToStorage(this.defaultConfig);
  }

  // Additional methods for compatibility with old theme service
  public setAutoTheme(): void {
    this.updateConfig({ mode: 'auto' });
  }

  public setTheme(isDark: boolean): void {
    this.updateConfig({ mode: isDark ? 'dark' : 'light' });
  }

  public isAdvancedThemeEnabled(): boolean {
    return this.canAccessAdvancedFeatures();
  }

  public enableAdvancedTheme(enabled: boolean): void {
    // This method is for compatibility - advanced features are controlled by authentication
    console.log(`Advanced theme ${enabled ? 'enabled' : 'disabled'} - controlled by authentication status`);
  }
}