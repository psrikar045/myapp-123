import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { ThemeService } from '../../../core/services/theme.service';
import { Subscription } from 'rxjs';
import { UtilService } from '../../../shared/services/util.service';
import { Router, ActivatedRoute } from '@angular/router';

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

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    this.isDarkMode = this.themeService.getIsDarkMode();
    const rawResult = this.utilService.searchResult;
    // If coming from all-categories, map BrandDataResponse to expected structure
    if (rawResult && !rawResult.Company) {
      // Try to get logo from assets where assetType is 'logo', then images, then any asset
      let logoUrl = '';
      let bannerUrl = '';
      let fontAssets: any[] = [];
      let imageAssets: any[] = [];
      if (rawResult.assets && rawResult.assets.length > 0) {
        const logoAsset = rawResult.assets.find((a: any) => a.assetType && a.assetType.toLowerCase() === 'logo');
        if (logoAsset && logoAsset.originalUrl) {
          logoUrl = logoAsset.originalUrl;
        }
        const bannerAsset = rawResult.assets.find((a: any) => a.assetType && a.assetType.toLowerCase() === 'banner');
        if (bannerAsset && bannerAsset.originalUrl) {
          bannerUrl = bannerAsset.originalUrl;
        }
        fontAssets = rawResult.assets.filter((a: any) => a.assetType && a.assetType.toLowerCase() === 'font');
        imageAssets = rawResult.assets.filter((a: any) => a.assetType && a.assetType.toLowerCase() === 'image');
      }
      if (!logoUrl && rawResult.images && rawResult.images.length > 0 && rawResult.images[0].accessUrl) {
        logoUrl = rawResult.images[0].accessUrl;
      }
      if (!logoUrl && rawResult.assets && rawResult.assets.length > 0) {
        logoUrl = rawResult.assets[0].accessUrl || rawResult.assets[0].originalUrl || '';
      }
      // Map fonts to expected structure for the template
      const fonts = (rawResult.fonts || []).map((f: any) => ({
        ...f,
        family: f.fontName || f.family || '',
        name: f.fontName || f.name || ''
      }));
      // Combine image assets and any images array
      const images = [...imageAssets, ...(rawResult.images || [])];
      let socialLinks = rawResult.socialLinks || {};
      // If socialLinks is an array (from search page API), convert to object for compatibility
      if (Array.isArray(socialLinks)) {
        socialLinks = socialLinks.reduce((acc: any, link: any) => {
          if (link && link.platform && link.url) {
            acc[link.platform.toLowerCase()] = link.url;
          }
          return acc;
        }, {});
      }
      this.searchResult = {
        Company: {
          Name: rawResult.name,
          Description: rawResult.description,
          Industry: rawResult.industry,
          Location: rawResult.location,
          Founded: rawResult.founded,
          CompanyType: rawResult.companyType,
          Employees: rawResult.employees,
          Website: rawResult.website,
        },
        Logo: {
          ...(logoUrl ? { Logo: logoUrl } : {}),
          ...(bannerUrl ? { Banner: bannerUrl } : {})
        },
        Colors: rawResult.colors ? rawResult.colors.map((c: any) => ({ hex: c.hexCode, name: c.colorName, brightness: c.brightness })) : [],
        Fonts: fonts,
        Images: images,
        SocialLinks: socialLinks,
      };
    } else if (rawResult && rawResult.Company && Array.isArray(rawResult.SocialLinks)) {
      // If API returns SocialLinks as an array (from search page), convert to object
      const socialLinksObj = rawResult.SocialLinks.reduce((acc: any, link: any) => {
        if (link && link.platform && link.url) {
          acc[link.platform.toLowerCase()] = link.url;
        }
        return acc;
      }, {});
      this.searchResult = {
        ...rawResult,
        SocialLinks: socialLinksObj,
      };
    } else {
      this.searchResult = rawResult;
    }
    // Remove sessionStorage usage; just read the query param when needed
  }
  getSocialLinksArray(socialLinks: any): { platform: string, url: string }[] {
    if (!socialLinks) {
      return [];
    }
    // If already an array (from search page API), return as is (filtering for valid links)
    if (Array.isArray(socialLinks)) {
      return socialLinks
        .filter(link => link && typeof link.url === 'string' && link.url.startsWith('http'))
        .map(link => ({ platform: link.platform, url: link.url }));
    }
    // Otherwise, treat as object
    return Object.entries(socialLinks)
      .filter(([key, value]) => typeof value === 'string' && value.startsWith('http'))
      .map(([platform, url]) => ({ platform, url: url as string }));
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
  if (typeof imageItem === 'object' && imageItem !== null) {
    // Always prioritize sourceUrl
    if (imageItem.sourceUrl) {
      return imageItem.sourceUrl;
    }
    if (imageItem.accessUrl) {
      return imageItem.accessUrl;
    }
    if (imageItem.originalUrl) {
      return imageItem.originalUrl;
    }
    if (imageItem.src) {
    return imageItem.src;
    }
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
  // Add this method to support array-based socialLinks
  getSocialLinksArrayFromList(socialLinks: any[]): { platform: string, url: string }[] {
    if (!Array.isArray(socialLinks)) {
      return [];
    }
    return socialLinks
      .filter(link => link && typeof link.url === 'string' && link.url.startsWith('http'))
      .map(link => ({ platform: link.platform, url: link.url }));
  }
  // Returns a deduplicated array of social links from both possible sources
  getCombinedSocialLinks(): { platform: string, url: string }[] {
    const links1 = this.getSocialLinksArray(this.searchResult?.Company?.SocialLinks);
    const links2 = this.getSocialLinksArray(this.searchResult?.SocialLinks);
    const combined: { [platform: string]: { platform: string, url: string } } = {};
    // Add from links2 first (prioritize SocialLinks)
    for (const link of links2) {
      if (link.platform) {
        combined[link.platform.toLowerCase()] = link;
      }
    }
    // Add from links1 if not already present
    for (const link of links1) {
      if (link.platform && !combined[link.platform.toLowerCase()]) {
        combined[link.platform.toLowerCase()] = link;
      }
    }
    return Object.values(combined);
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
    // Use query param to determine navigation source
    const navSource = this.route.snapshot.queryParamMap.get('from');
    if (navSource === 'brands') {
      this.router.navigate(['/all-categories']);
    } else {
      this.router.navigate(['/search']);
    }
  }
}
