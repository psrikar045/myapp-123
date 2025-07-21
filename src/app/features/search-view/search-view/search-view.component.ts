import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { ThemeService } from '../../../core/services/theme.service';
import { Subscription } from 'rxjs';
import { UtilService } from '../../../shared/services/util.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-view',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './search-view.component.html',
  styleUrl: './search-view.component.css'
})
export class SearchViewComponent implements OnInit, OnDestroy {
  showBrandDetails = false;
  activeTab = 0;
  tabs = ['Company', 'Logo', 'Colors', 'Fonts', 'Images'];
  searchResult: any = null;
  isDarkMode = false;
  private themeSubscription!: Subscription;
  private readonly themeService = inject(ThemeService);
  private readonly utilService = inject(UtilService);
  filters = ['All', 'Logos', 'Colors', 'Font', 'Images'];//, 'Icons'
  activeFilter = 'All';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    this.isDarkMode = this.themeService.getIsDarkMode();
    this.searchResult = this.utilService.searchResult; // Get search result from UtilService
  }
  getSocialLinksArray(socialLinks: any): { platform: string, url: string }[] {
    if (!socialLinks) {
      return [];
    }
    return Object.entries(socialLinks)
      .filter(([key, value]) => typeof value === 'string' && value.startsWith('http')) // Ensure it's a string URL
      .map(([platform, url]) => ({ platform: platform, url: url as string }));
  }
  getSocialIconClass(platform: string): string | null {
    switch (platform.toLowerCase()) {
      case 'twitter': return 'bi bi-twitter';
      case 'linkedin': return 'bi bi-linkedin';
      case 'facebook': return 'bi bi-facebook';
      case 'youtube': return 'bi bi-youtube';
      case 'instagram': return 'bi bi-instagram';
      case 'pinterest': return 'bi bi-pinterest'; 
      case 'tiktok': return 'bi bi-tiktok';
      default: return 'bi bi-link-45deg'; // If no specific icon is found, return bi bi-link-45deg
    }
  }
  getSocialAriaLabel(platform: string): string {
    // Simple conversion for common PascalCase like "LinkedIn" -> "LinkedIn"
    // For other cases, it will convert "SomePlatform" to "Some Platform" and capitalize words.
    return platform.replace(/([A-Z])/g, ' $1').trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
  getLogoEntries(logoObject: any): { key: string; value: any }[] {
    if (!logoObject) { return []; }
    // Object.entries() returns an array of [key, value] pairs
    return Object.entries(logoObject).map(([key, value]) => ({ key, value }));
  }
  isValidImageUrl(url: any): boolean {
    return typeof url === 'string' && url.length > 0 && (url.startsWith('http') || url.startsWith('data:image') || /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(url));
  }
  generateLogoLabel(key: string): string {
    switch (key) {
      case 'Logo': return 'Main Logo';
      case 'Symbol': return 'Brand Symbol';
      case 'Icon': return 'Favicon / Icon';
      case 'Banner': return 'Banner Image';
      default: return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
  }
  generateAltText(companyName: string | null, entryKey: string): string {
    const companyPart = companyName ? `${companyName} ` : '';
    const keyPart = this.generateLogoLabel(entryKey).toLowerCase();
    return `${companyPart}${keyPart}`;
  }
  hasDisplayableLogos(logoObject: any): boolean {
    if (!logoObject) { return false; }
    return Object.values(logoObject).some(url => this.isValidImageUrl(url));
  }

  hasDisplayableColors(colorsArray: any[]): boolean {
    return colorsArray && colorsArray.length > 0 && colorsArray.some(color => !!color.hex);
  }
  hasDisplayableFonts(fontsArray: any[]): boolean {
    return fontsArray && fontsArray.length > 0 && fontsArray.some(font => !!font.family || !!font.name);
  }
getFontDisplayName(fontItem: any): string {
  return fontItem.family || fontItem.name || 'Unknown Font';
}

getFontDetailsText(fontItem: any): string | null {
  const details = [];
  if (fontItem.usage) details.push(`Usage: ${fontItem.usage}`);
  if (fontItem.weight) details.push(`Weight: ${fontItem.weight}`);
  return details.length > 0 ? `(${details.join(', ')})` : null;
}
getImageSource(imageItem: any): string | null {
  if (typeof imageItem === 'string') {
    return imageItem;
  }
  if (typeof imageItem === 'object' && imageItem !== null && imageItem.src) {
    return imageItem.src;
  }
  return null;
}
getImageAltText(companyName: string | null, imageItem: any): string {
    const defaultAlt = 'Company Image';
    const companyPart = companyName ? `${companyName} ` : '';

    if (imageItem && typeof imageItem === 'object') {
        if (imageItem.description) {
            return `${companyPart}${imageItem.description}`;
        }
        if (imageItem.alt) { // Check for an explicit 'alt' property
            return `${companyPart}${imageItem.alt}`;
        }
        if (imageItem.src) {
            // Extract filename from URL for generic alt text
            const fileName = imageItem.src.substring(imageItem.src.lastIndexOf('/') + 1);
            return `${companyPart}Image: ${fileName}`;
        }
    } else if (typeof imageItem === 'string') { // If imageItem is just the URL string
        const fileName = imageItem.substring(imageItem.lastIndexOf('/') + 1);
        return `${companyPart}Image: ${fileName}`;
    }
    return `${companyPart}${defaultAlt}`;
}
hasDisplayableImages(imagesArray: any[]): boolean {
  if (!imagesArray) { return false; } // Handle null/undefined array
  return imagesArray.some(item => {
    const src = this.getImageSource(item);
    return this.isValidImageUrl(src);
  });
}
  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  onAnalyzeClick() {
    this.showBrandDetails = true;
  }

  setActiveTab(idx: number) {
    this.activeTab = idx;
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
  }

  showSection(section: string): boolean {
    return this.activeFilter === 'All' || this.activeFilter === section;
  }

  goBackToSearch() {
    this.router.navigate(['/search']);
  }
}
