import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ValidationService } from '../../../core/services/validation.service';
import { SearchModalService } from '../../../shared/services/search-modal.service';
import { SearchHistoryService, SearchedBrand } from '../../../shared/services/search-history.service';
import { SearchModalComponent } from '../../../shared/components/search-modal/search-modal.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { UtilService } from '../../../shared/services/util.service';
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchModalComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-20px) scale(0.95)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class SearchComponent {
 constructor(
   private router: Router, 
  //  private authService: AuthService, 
  //  private searchModalService: SearchModalService,
   private searchHistoryService: SearchHistoryService
 ) {
   // Subscribe to search history changes
   this.searchHistoryService.searchHistory$.subscribe((history:any) => {
     this.brands = history;
   });
 }
  private readonly authService = inject(AuthService);
  private readonly validationService = inject(ValidationService);
  private readonly searchModalService = inject(SearchModalService);
  private readonly utilService = inject(UtilService);

 searchDomainNameOrUrl = '';
 isLoading = false;
 errorMessage = '';
 isSearchFocused = false;
 
 // Animation type selector - change this to switch between animations
 selectedAnimationType: 'default' | 'card-based' | 'minimalist' = 'card-based';
 
 // Analysis type selector
 selectedAnalysisType: 'quick' | 'standard' | 'deep' = 'standard';
  
 // Brands from search history
 brands: SearchedBrand[] = [];

  clearAll() {
    this.searchHistoryService.clearHistory();
  }

  removeBrand(index: number) {
    this.searchHistoryService.removeFromHistory(index);
  }

  // Handle favicon loading error
  onFaviconError(index: number) {
    // Mark favicon as error for this brand
    const updatedBrands = [...this.brands];
    if (updatedBrands[index]) {
      updatedBrands[index] = { ...updatedBrands[index], faviconError: true };
      this.brands = updatedBrands;
    }
  }

  // Test method to add sample search history (for demo purposes)
  addSampleHistory() {
    const sampleBrands = [
      { name: 'Google', url: 'https://google.com' },
      { name: 'Microsoft', url: 'https://microsoft.com' },
      { name: 'Netflix', url: 'https://netflix.com' }
    ];
    
    sampleBrands.forEach(brand => {
      this.addToSearchHistory(brand.name, brand.url, {
        Company: { Name: brand.name, Description: 'Sample data', Founded: '1998' }
      });
    });
  }

  goToResults(brand: string) {
    this.router.navigate(['/search-view', brand.toLowerCase()], { queryParams: { from: 'search' } });
  }
  // Validation methods now use ValidationService

  // Method to clear error message
  private clearError(): void {
    this.errorMessage = '';
  }

  // Method to set error message
  private setError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
    this.searchModalService.hideModal();
  }

  // Method to toggle animation type
  // toggleAnimationType(): void {
  //   if (this.selectedAnimationType === 'default') {
  //     this.selectedAnimationType = 'card-based';
  //   } else if (this.selectedAnimationType === 'card-based') {
  //     this.selectedAnimationType = 'minimalist';
  //   } else {
  //     this.selectedAnimationType = 'default';
  //   }
  // }

  // Method to toggle analysis type
  toggleAnalysisType(): void {
    if (this.selectedAnalysisType === 'quick') {
      this.selectedAnalysisType = 'standard';
    } else if (this.selectedAnalysisType === 'standard') {
      this.selectedAnalysisType = 'deep';
    } else {
      this.selectedAnalysisType = 'quick';
    }
  }

  // Get analysis type description
  getAnalysisTypeDescription(): string {
    switch (this.selectedAnalysisType) {
      case 'quick':
        return 'Quick Analysis (~30 seconds)';
      case 'standard':
        return 'Standard Analysis (~3-5 minutes)';
      case 'deep':
        return 'Deep Analysis (~5-8 minutes)';
      default:
        return 'Standard Analysis';
    }
  }

  // Get estimated time for analysis type
  private getEstimatedTimeForAnalysisType(): string {
    switch (this.selectedAnalysisType) {
      case 'quick':
        return 'This quick process typically takes 30-60 seconds...';
      case 'standard':
        return 'This process typically takes 3-5 minutes...';
      case 'deep':
        return 'This comprehensive process typically takes 5-8 minutes...';
      default:
        return 'This process typically takes 3-5 minutes...';
    }
  }

  // Add searched website to history
  private addToSearchHistory(brandName: string, url: string, apiData: any): void {
    const searchedBrand: Partial<SearchedBrand> & { name: string; url: string } = {
      name: brandName,
      url: url,
      verified: this.isVerifiedBrand(apiData),
      favicon: this.extractFavicon(url, apiData),
      icon: this.generateBrandIcon(brandName)
    };

    this.searchHistoryService.addToHistory(searchedBrand);
  }

  // Check if brand is verified based on API data
  private isVerifiedBrand(apiData: any): boolean {
    // Add logic to determine if brand is verified
    // For now, check if we have comprehensive company data
    return !!(apiData?.Company?.Name && 
             apiData?.Company?.Description && 
             apiData?.Company?.Founded);
  }

  // Extract favicon URL
  private extractFavicon(url: string, apiData: any): string | undefined {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return undefined;
    }
  }

  // Generate brand icon identifier
  private generateBrandIcon(brandName: string): string {
    const knownBrands: { [key: string]: string } = {
      'apple': 'apple',
      'google': 'google',
      'microsoft': 'microsoft',
      'amazon': 'amazon',
      'facebook': 'facebook',
      'meta': 'facebook',
      'netflix': 'netflix',
      'spotify': 'spotify',
      'twitter': 'twitter',
      'instagram': 'instagram',
      'linkedin': 'linkedin',
      'github': 'github',
      'stackoverflow': 'stackoverflow'
    };

    const brandKey = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return knownBrands[brandKey] || 'generic';
  }

  // Method to extract brand name from company name (using ValidationService)
  private extractBrandName(companyName: string): string {
    return this.validationService.extractBrandName(companyName);
  }

  navigateToLanding() {
    this.router.navigate(['/landing']);
  }

handleKeyDown(event:any){
  if (event.key === 'Enter') {
    this.findBrandInfo(event);
  }
}

onSearchFocus(): void {
  this.isSearchFocused = true;
}

onSearchBlur(): void {
  this.isSearchFocused = false;
}
  async findBrandInfo(event: any) {
    event.preventDefault();
    
    // Clear previous error and start loading
    this.clearError();
    this.isLoading = true;

    // Validate input using ValidationService
    const validationResult = await this.validationService.validateUrlOrDomain(this.searchDomainNameOrUrl);
    
    if (!validationResult.isValid) {
      this.setError(validationResult.error || 'Invalid input');
      this.isLoading = false;
      return;
    }

    const finalUrl = validationResult.finalUrl!;
    // Update the input field with the proper URL
    this.searchDomainNameOrUrl = finalUrl;

      // Start brand analysis with progressive updates
      this.searchModalService.startBrandAnalysis({
        url: finalUrl,
        title: 'Brand Analysis in Progress',
        description: `We're performing deep analysis on your website to extract comprehensive brand information`,
        estimatedTime: this.getEstimatedTimeForAnalysisType(),
        isDarkMode: false, // You can detect user's preference here
        animationType: this.selectedAnimationType, // Will use the selected animation type
        analysisType: this.selectedAnalysisType // Can be 'quick', 'standard', or 'deep'
      });

      // Call the API
      this.authService.publicForward(finalUrl).subscribe({
        next: (data: any) => {
          console.log(data);
          this.searchModalService.completeBrandAnalysis();
          
          setTimeout(() => {
            this.isLoading = false;
            
            if (data && data?.Company && data?.Company?.Name) {
              const brandName = this.extractBrandName(data?.Company?.Name);
              console.log('Extracted brand name:', brandName);
              
              // Add to search history
              this.addToSearchHistory(brandName, finalUrl, data);
              this.utilService.searchResult = data; // Store result in UtilService for later use
              this.goToResults(brandName);
            } else {
              this.setError('No brand information found for this website');
            }
          }, 1000);
        },
        error: (error) => {
          console.error('API Error:', error);
          this.isLoading = false;
          this.searchModalService.hideModal();
          this.utilService.searchResult = null; // Clear previous search result
          this.setError('Failed to fetch brand information. Please try again.');
        }
      });

    } catch (error:any) {
      console.error('Validation Error:', error);
      this.setError('An error occurred while validating the input. Please try again.');
    }
  }
