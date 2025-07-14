import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { ThemeService } from '../../core/services/theme.service';
import { ValidationService } from '../../core/services/validation.service';
import { SearchModalService, SearchModalComponent, AnimationType } from '../../shared';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-company-data',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SearchModalComponent],
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
  selectedAnimationType: AnimationType = 'minimalist';
  
  isDarkMode = false;
  private themeSubscription!: Subscription;
  private readonly themeService = inject(ThemeService);
  private readonly validationService = inject(ValidationService);
  private readonly searchModalService = inject(SearchModalService);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    this.isDarkMode = this.themeService.getIsDarkMode();
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
    this.searchModalService.hideModal();
    this.isLoading = false;
    this.isDarkMode = this.themeService.getIsDarkMode();
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

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

      // Use startBrandAnalysis instead of showModal for better code reuse
      this.searchModalService.startBrandAnalysis({
        url: finalUrl,
        title: '🎯 Brand Analysis in Progress',
        description: `We're performing comprehensive brand analysis on ${finalUrl}`,
        estimatedTime: 'This process typically takes 3-5 minutes...',
        isDarkMode: this.isDarkMode,
        animationType: this.selectedAnimationType, // Flexible animation selection
        analysisType: 'standard' // Default analysis type
      });
   this.authService.privateForward(finalUrl).subscribe({
        next: (data: any) => {
          console.log(data);
          this.searchModalService.completeBrandAnalysis();
          
          setTimeout(() => {
            this.isLoading = false;
            this.showBrandDetails = true;
            if (data && data?.Company && data?.Company?.Name) {
            
            } else {
              this.setError('No brand information found for this website');
            }
          }, 500);
        },
        error: (error:any) => {
          console.error('API Error:', error);
          this.isLoading = false;
          this.searchModalService.hideModal();
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
      this.errorMessage = 'An unexpected error occurred. Please try again.';
      this.isLoading = false;
      this.searchModalService.hideModal();
    }
  }

  private setError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
    this.searchModalService.hideModal();
  }
}
