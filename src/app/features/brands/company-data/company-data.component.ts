import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppThemeService } from '../../../core/services/app-theme.service';
import { ValidationService } from '../../../core/services/validation.service';
import { SearchModalService, AnimationType } from '../../../shared/services/search-modal.service';
import { SearchModalComponent } from '../../../shared/components/search-modal/search-modal.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import {NgxJsonViewerModule} from 'ngx-json-viewer';
@Component({
  selector: 'app-company-data',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchModalComponent, NgxJsonViewerModule ],
  templateUrl: './company-data.component.html',
  styleUrl: './company-data.component.css'
})
export class CompanyDataComponent implements OnInit, OnDestroy {
  showBrandDetails = false;
  activeTab = 0;
  tabs = ['Company', 'Logo', 'Colors', 'Fonts', 'Images'];
  
  // Form data
  websiteUrl = '';
  isLoading = false;
  errorMessage = '';
  
  // Animation type selector - default to minimalist but flexible
  selectedAnimationType: AnimationType = 'card-based';
  
  isDarkMode = false;
  private themeSubscription!: Subscription;
  private readonly appThemeService = inject(AppThemeService);
  private readonly validationService = inject(ValidationService);
  private readonly searchModalService = inject(SearchModalService);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.themeSubscription = this.appThemeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    // Get initial dark mode state
    this.appThemeService.isDarkMode$.subscribe(isDark => this.isDarkMode = isDark);
  }

  setActiveTab(idx: number) {
    this.activeTab = idx;
  }

  // Method to toggle animation type (cycles through all three)
  toggleAnimationType(): void {
    if (this.selectedAnimationType === 'default') {
      this.selectedAnimationType = 'card-based';
    } else if (this.selectedAnimationType === 'card-based') {
      this.selectedAnimationType = 'minimalist';
    } else {
      this.selectedAnimationType = 'default';
    }
  }

  // Get toggle button text
  getToggleText(): string {
    switch (this.selectedAnimationType) {
      case 'default':
        return 'Switch to Cards';
      case 'card-based':
        return 'Switch to Minimal';
      case 'minimalist':
        return 'Switch to Default';
      default:
        return 'Switch Mode';
    }
  }

  // Method to set specific animation type (for flexibility)
  setAnimationType(type: AnimationType): void {
    this.selectedAnimationType = type;
  }

  // Method to handle modal cancellation
  onModalCancel(): void {
    this.searchModalService.forceHideModal();
    this.isLoading = false;
    this.appThemeService.isDarkMode$.subscribe(isDark => this.isDarkMode = isDark);
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
searchResult: any = null;
  async onAnalyzeClick() {
    this.errorMessage = '';
    this.isLoading = true;

    try {
      // Validate the URL/domain using ValidationService
      const validationResult = await this.validationService.validateUrlOrDomain(this.websiteUrl);
      
      if (!validationResult.isValid) {
        this.errorMessage = validationResult.error || 'Invalid input';
        this.isLoading = false;
        return;
      }

      const finalUrl = validationResult.finalUrl!;

      // Use startBrandAnalysis with optimized settings
      this.searchModalService.startBrandAnalysis({
        url: finalUrl,
        title: '🎯 Brand Analysis in Progress',
        description: `We're performing comprehensive brand analysis on ${finalUrl}`,
        estimatedTime: 'Maximum processing time: 30 seconds',
        isDarkMode: this.isDarkMode,
        animationType: this.selectedAnimationType, // Flexible animation selection
        analysisType: 'standard' // Default analysis type
      });

      // Call API with improved error handling
      this.authService.privateForward(finalUrl).subscribe({
        next: (data: any) => {
          console.log('API Response received:', data);
          
          // Complete the analysis immediately when API responds
          this.searchModalService.completeBrandAnalysis();
          
          // Process the response after modal completion
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              this.isLoading = false;
              this.showBrandDetails = true;
              
              if (data && data?.Company && data?.Company?.Name) {
                this.searchResult = data;
              } else {
                this.setError('No brand information found for this website');
              }
            }, 600); // Slightly longer than modal hide delay for smooth transition
          } else {
            // Fallback for SSR - process immediately
            this.isLoading = false;
            this.showBrandDetails = true;
            
            if (data && data?.Company && data?.Company?.Name) {
              this.searchResult = data;
            } else {
              this.setError('No brand information found for this website');
            }
          }
        },
        error: (error: any) => {
          console.error('API Error:', error);
          this.setError('Failed to fetch brand information. Please try again.');
        }
      });
      // // Simulate the analysis completion
      // setTimeout(() => {
      //   this.searchModalService.completeBrandAnalysis();
        
      //   setTimeout(() => {
      //     this.showBrandDetails = true;
      //     this.isLoading = false;
      //   }, 1000);
      // }, 10000); // 10 seconds for demo

    } catch (error) {
      this.setError('An unexpected error occurred. Please try again.');
    }
  }

  private setError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
    this.searchModalService.forceHideModal();
  }
  getLogoEntries(logoObject: any): { key: string; value: any }[] {
  if (!logoObject) {
    return [];
  }
  return Object.entries(logoObject).map(([key, value]) => ({ key, value }));
  }
  isValidImageUrl(url: any): boolean {
    return typeof url === 'string' && url.length > 0 && (url.startsWith('http') || url.startsWith('data:image') || url.endsWith('.svg') || url.endsWith('.png') || url.endsWith('.webp') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.gif'));
  }
  generateLogoLabel(key: string): string {
    // You can customize these mappings for better labels
    switch (key) {
      case 'Logo': return 'Main Logo';
      case 'Symbol': return 'Brand Symbol';
      case 'Icon': return 'Favicon / Icon';
      case 'Banner': return 'Banner Image';
      default:
        // Capitalize first letter and add space before uppercase letters (e.g., 'mobileLogo' -> 'Mobile Logo')
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
  }
  generateAltText(companyName: string | null, key: string): string {
    const companyPart = companyName ? `${companyName} ` : '';
    const keyPart = this.generateLogoLabel(key).toLowerCase(); // Use the human-friendly label
    return `${companyPart}${keyPart}`;
  }
  hasDisplayableLogos(logoObject: any): boolean {
    if (!logoObject) {
      return false;
    }
    return Object.values(logoObject).some(url => this.isValidImageUrl(url));
  }
}
