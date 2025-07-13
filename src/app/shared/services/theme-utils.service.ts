import { Injectable, Renderer2, RendererFactory2, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ThemeUtilsService {
  private renderer: Renderer2;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeService = inject(ThemeService);

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    
    // Apply theme to logo when theme changes
    if (isPlatformBrowser(this.platformId)) {
      this.themeService.isDarkMode$.subscribe(isDark => {
        this.updateLogoColors(isDark);
      });
      
      // Apply initial theme
      this.updateLogoColors(this.themeService.getIsDarkMode());
    }
  }

  /**
   * Updates the logo SVG colors based on the current theme
   * @param isDarkMode Whether dark mode is active
   */
  updateLogoColors(isDarkMode: boolean): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Find all logo SVGs in the document
    const logoSvgs = document.querySelectorAll('img[src*="logo.svg"]');
    
    logoSvgs.forEach(logo => {
      // For img tags, we can add a class to handle via CSS
      if (isDarkMode) {
        this.renderer.addClass(logo, 'dark-theme-logo');
      } else {
        this.renderer.removeClass(logo, 'dark-theme-logo');
      }
    });
    
    // For inline SVGs, we would need to target specific paths
    const inlineSvgLogos = document.querySelectorAll('svg.logo');
    inlineSvgLogos.forEach(svg => {
      const textPaths = svg.querySelectorAll('path[fill="black"]');
      textPaths.forEach(path => {
        this.renderer.setAttribute(path, 'fill', isDarkMode ? '#e0e0e0' : '#333');
      });
    });
  }
  
  /**
   * Gets the appropriate logo URL based on the current theme
   * @returns Observable of the logo URL
   */
  getThemeAwareLogo(): Observable<string> {
    return this.themeService.isDarkMode$.pipe(
      map(isDark => isDark ? 'images/logo-dark.svg' : 'images/logo.svg')
    );
  }
}