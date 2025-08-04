import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type AnimationType = 'default' | 'card-based' | 'minimalist';

export interface SearchModalConfig {
  url: string;
  title?: string;
  description?: string;
  estimatedTime?: string;
  isDarkMode?: boolean;
  animationType?: AnimationType;
}

export interface BrandAnalysisConfig extends SearchModalConfig {
  analysisType?: 'standard' | 'deep' | 'quick';
  customProgressSteps?: Array<{step: string, progress: number, delay: number}>;
}

export interface ProgressStep {
  id: string;
  title: string;
  icon: string;
  status: 'pending' | 'in-progress' | 'complete';
}

export interface SearchModalState {
  isVisible: boolean;
  progress: number;
  currentStep: string;
  config: SearchModalConfig | null;
  progressSteps: ProgressStep[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchModalService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private readonly defaultProgressSteps: ProgressStep[] = [
    { id: 'url-analysis', title: 'URL Analysis & Validation', icon: '🔍', status: 'pending' },
    { id: 'website-check', title: 'Website Scanning & Data Extraction', icon: '🌐', status: 'pending' },
    { id: 'brand-extraction', title: 'Brand Intelligence & Recognition', icon: '🏢', status: 'pending' },
    { id: 'data-processing', title: 'Final Processing & Report Generation', icon: '📊', status: 'pending' }
  ];

  private modalStateSubject = new BehaviorSubject<SearchModalState>({
    isVisible: false,
    progress: 0,
    currentStep: '',
    config: null,
    progressSteps: [...this.defaultProgressSteps]
  });

  public modalState$: Observable<SearchModalState> = this.modalStateSubject.asObservable();

  constructor() {}

  /**
   * Show the search modal with configuration
   */
  showModal(config: SearchModalConfig): void {
    this.modalStateSubject.next({
      isVisible: true,
      progress: 0,
      currentStep: 'Initializing search...',
      progressSteps: [...this.defaultProgressSteps],
      config: {
        title: this.getAnimationTitle(config.animationType, config.url),
        description: this.getAnimationDescription(config.animationType, config.url),
        estimatedTime: 'This usually takes 3-5 minutes...',
        isDarkMode: false,
        animationType: 'default',
        ...config
      }
    });
  }

  /**
   * Update the progress and step
   */
  updateProgress(step: string, progress: number): void {
    const currentState = this.modalStateSubject.value;
    if (currentState.isVisible) {
      // Update progress steps for card-based animation
      const updatedSteps = this.updateProgressSteps(currentState.progressSteps, progress);
      
      this.modalStateSubject.next({
        ...currentState,
        progress: Math.min(100, Math.max(0, progress)),
        currentStep: step,
        progressSteps: updatedSteps
      });
    }
  }

  /**
   * Get animation-specific title
   */
  private getAnimationTitle(animationType?: AnimationType, url?: string): string {
    switch (animationType) {
      case 'card-based':
        return '🎯 Brand Detective';
      case 'minimalist':
        return '✨ Processing';
      default:
        return '🔍 Searching...';
    }
  }

  /**
   * Get animation-specific description
   */
  private getAnimationDescription(animationType?: AnimationType, url?: string): string {
    switch (animationType) {
      case 'card-based':
        return `We're investigating ${url} for you!`;
      case 'minimalist':
        return 'Analyzing your request with precision...';
      default:
        return `We're analyzing your request to find brand information for you`;
    }
  }

  /**
   * Update progress steps based on current progress
   */
  private updateProgressSteps(steps: ProgressStep[], progress: number): ProgressStep[] {
    return steps.map((step, index) => {
      const stepProgress = (index + 1) * 25; // Each step represents 25% progress
      
      if (progress >= stepProgress) {
        return { ...step, status: 'complete' as const };
      } else if (progress >= stepProgress - 25 && progress < stepProgress) {
        return { ...step, status: 'in-progress' as const };
      } else {
        return { ...step, status: 'pending' as const };
      }
    });
  }

  /**
   * Hide the modal
   */
  hideModal(): void {
    this.modalStateSubject.next({
      isVisible: false,
      progress: 0,
      currentStep: '',
      config: null,
      progressSteps: [...this.defaultProgressSteps]
    });
  }

  /**
   * Toggle theme mode
   */
  toggleTheme(): void {
    const currentState = this.modalStateSubject.value;
    if (currentState.config) {
      this.modalStateSubject.next({
        ...currentState,
        config: {
          ...currentState.config,
          isDarkMode: !currentState.config.isDarkMode
        }
      });
    }
  }

  /**
   * Set theme mode
   */
  setTheme(isDarkMode: boolean): void {
    const currentState = this.modalStateSubject.value;
    if (currentState.config) {
      this.modalStateSubject.next({
        ...currentState,
        config: {
          ...currentState.config,
          isDarkMode
        }
      });
    }
  }

  /**
   * Get current modal state
   */
  getCurrentState(): SearchModalState {
    return this.modalStateSubject.value;
  }

  /**
   * Check if modal is currently visible
   */
  isVisible(): boolean {
    return this.modalStateSubject.value.isVisible;
  }

  /**
   * Start brand analysis with progressive updates
   * This method handles the entire modal flow with realistic timing
   */
  startBrandAnalysis(config: BrandAnalysisConfig): void {
    // Show modal with initial configuration
    this.showModal({
      url: config.url,
      title: config.title || '🔍 Brand Analysis in Progress',
      description: config.description || `We're performing deep analysis on your website to extract comprehensive brand information`,
      estimatedTime: config.estimatedTime || 'This process typically takes 3-5 minutes...',
      isDarkMode: config.isDarkMode || false,
      animationType: config.animationType || 'default'
    });

    // Use custom progress steps if provided, otherwise use default
    const progressSteps = config.customProgressSteps || this.getDefaultProgressSteps(config.analysisType);
    
    // Execute progress steps
    progressSteps.forEach(({step, progress, delay}) => {
      setTimeout(() => {
        // Check if service is still active before updating progress
        if (!this.destroy$.closed) {
          this.updateProgress(step, progress);
        }
      }, delay);
    });
  }

  /**
   * Get default progress steps based on analysis type
   */
  private getDefaultProgressSteps(analysisType: 'standard' | 'deep' | 'quick' = 'standard'): Array<{step: string, progress: number, delay: number}> {
    switch (analysisType) {
      case 'quick':
        return [
          {step: 'Initializing quick analysis...', progress: 5, delay: 0},
          {step: 'Extracting basic information...', progress: 35, delay: 1000},
          {step: 'Processing results...', progress: 75, delay: 3000},
          {step: 'Finalizing...', progress: 85, delay: 5000}
        ];
      
      case 'deep':
        return [
          {step: 'Initializing deep analysis engine...', progress: 5, delay: 0},
          {step: 'Connecting to website and analyzing structure...', progress: 10, delay: 2000},
          {step: 'Extracting metadata and content...', progress: 20, delay: 8000},
          {step: 'Running AI brand detection algorithms...', progress: 35, delay: 20000},
          {step: 'Cross-referencing brand databases...', progress: 50, delay: 45000},
          {step: 'Analyzing company information and patterns...', progress: 65, delay: 80000},
          {step: 'Performing social media analysis...', progress: 75, delay: 120000},
          {step: 'Finalizing comprehensive report...', progress: 85, delay: 180000}
        ];
      
      default: // standard
        return [
          {step: 'Initializing brand analysis engine...', progress: 5, delay: 0},
          {step: 'Connecting to website and analyzing structure...', progress: 15, delay: 2000},
          {step: 'Extracting metadata and content...', progress: 25, delay: 8000},
          {step: 'Running AI brand detection algorithms...', progress: 40, delay: 20000},
          {step: 'Cross-referencing brand databases...', progress: 55, delay: 45000},
          {step: 'Analyzing company information and patterns...', progress: 70, delay: 80000},
          {step: 'Finalizing brand data extraction...', progress: 85, delay: 120000}
        ];
    }
  }

  /**
   * Complete brand analysis with final progress update
   */
  completeBrandAnalysis(): void {
    this.updateProgress('Processing and validating results...', 95);
    
    setTimeout(() => {
      // Check if service is still active before hiding modal
      if (!this.destroy$.closed) {
        this.hideModal();
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}