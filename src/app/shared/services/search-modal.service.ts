import { Injectable, OnDestroy, NgZone } from '@angular/core';
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
  private progressTimeouts: number[] = []; // Store timeout IDs for cancellation
  private isApiCompleted = false; // Track API completion status
  private analysisStartTime = 0; // Track when analysis started
  
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

  constructor(private ngZone: NgZone) {}

  /**
   * Show the search modal with configuration
   */
  showModal(config: SearchModalConfig): void {
    this.ngZone.run(() => {
      this.modalStateSubject.next({
        isVisible: true,
        progress: 0,
        currentStep: 'Initializing search...',
        progressSteps: [...this.defaultProgressSteps],
        config: {
          title: this.getAnimationTitle(config.animationType, config.url),
          description: this.getAnimationDescription(config.animationType, config.url),
          estimatedTime: this.getAnimationEstimatedTime(config.animationType),
          isDarkMode: false,
          animationType: 'default',
          ...config
        }
      });
    });
  }

  /**
   * Update the progress and step
   */
  updateProgress(step: string, progress: number): void {
    this.ngZone.run(() => {
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
    });
  }

  /**
   * Get animation-specific title
   */
  private getAnimationTitle(animationType?: AnimationType, url?: string): string {
    switch (animationType) {
      case 'card-based':
        return '🎯 Brand Detective - Fast Analysis';
      case 'minimalist':
        return '✨ Processing - Quick Results';
      default:
        return '🔍 Brand Analysis in Progress';
    }
  }

  /**
   * Get animation-specific description
   */
  private getAnimationDescription(animationType?: AnimationType, url?: string): string {
    switch (animationType) {
      case 'card-based':
        return `We're investigating ${url} for you! This process typically completes within 30 seconds.`;
      case 'minimalist':
        return 'Analyzing your request with precision and efficiency...';
      default:
        return `We're analyzing your request to find brand information for you`;
    }
  }

  /**
   * Get animation-specific estimated time
   */
  private getAnimationEstimatedTime(animationType?: AnimationType): string {
    switch (animationType) {
      case 'card-based':
        return 'Step-by-step analysis - Maximum 30 seconds';
      case 'minimalist':
        return 'Streamlined processing - Maximum 30 seconds';
      default:
        return 'Maximum processing time: 30 seconds';
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
    this.ngZone.run(() => {
      // Cancel all pending progress timeouts
      this.clearProgressTimeouts();
      
      // Reset state flags
      this.isApiCompleted = false;
      this.analysisStartTime = 0;
      
      this.modalStateSubject.next({
        isVisible: false,
        progress: 0,
        currentStep: '',
        config: null,
        progressSteps: [...this.defaultProgressSteps]
      });
    });
  }

  /**
   * Clear all pending progress timeouts
   */
  private clearProgressTimeouts(): void {
    if (typeof window !== 'undefined') {
      this.progressTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    }
    this.progressTimeouts = [];
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
    // Reset state for new analysis
    this.clearProgressTimeouts();
    this.isApiCompleted = false;
    this.analysisStartTime = Date.now();

    // Show modal with initial configuration
    this.showModal({
      url: config.url,
      title: config.title || this.getAnimationTitle(config.animationType, config.url),
      description: config.description || this.getAnimationDescription(config.animationType, config.url),
      estimatedTime: config.estimatedTime || this.getAnimationEstimatedTime(config.animationType),
      isDarkMode: config.isDarkMode || false,
      animationType: config.animationType || 'default'
    });

    // Use custom progress steps if provided, otherwise use default optimized steps
    const progressSteps = config.customProgressSteps || this.getOptimizedProgressSteps(config.analysisType);
    
    // Execute progress steps with cancellation support
    progressSteps.forEach(({step, progress, delay}) => {
      // Check if we're in browser environment before using setTimeout
      if (typeof window !== 'undefined') {
        const timeoutId = window.setTimeout(() => {
          // Only update progress if API hasn't completed and service is active
          if (!this.isApiCompleted && !this.destroy$.closed && this.modalStateSubject.value.isVisible) {
            this.ngZone.run(() => {
              this.updateProgress(step, progress);
            });
          }
        }, delay);
        
        this.progressTimeouts.push(timeoutId);
      }
    });
  }

  /**
   * Get optimized progress steps based on analysis type (max 30 seconds)
   */
  private getOptimizedProgressSteps(analysisType: 'standard' | 'deep' | 'quick' = 'standard'): Array<{step: string, progress: number, delay: number}> {
    switch (analysisType) {
      case 'quick':
        return [
          {step: 'Initializing quick analysis...', progress: 15, delay: 0},
          {step: 'Connecting to website...', progress: 35, delay: 1500},
          {step: 'Extracting brand information...', progress: 65, delay: 4000},
          {step: 'Processing results...', progress: 85, delay: 8000},
          {step: 'Finalizing analysis...', progress: 95, delay: 12000}
        ];
      
      case 'deep':
        return [
          {step: 'Initializing comprehensive analysis...', progress: 10, delay: 0},
          {step: 'Connecting to website and analyzing structure...', progress: 20, delay: 2000},
          {step: 'Extracting metadata and content...', progress: 35, delay: 5000},
          {step: 'Running AI brand detection algorithms...', progress: 50, delay: 10000},
          {step: 'Cross-referencing brand databases...', progress: 65, delay: 15000},
          {step: 'Analyzing company information...', progress: 80, delay: 20000},
          {step: 'Performing final validation...', progress: 90, delay: 25000},
          {step: 'Generating comprehensive report...', progress: 95, delay: 28000}
        ];
      
      default: // standard
        return [
          {step: 'Initializing brand analysis...', progress: 15, delay: 0},
          {step: 'Connecting to website...', progress: 30, delay: 2000},
          {step: 'Extracting brand data...', progress: 50, delay: 6000},
          {step: 'Processing brand information...', progress: 70, delay: 12000},
          {step: 'Validating results...', progress: 85, delay: 18000},
          {step: 'Finalizing analysis...', progress: 95, delay: 25000}
        ];
    }
  }

  /**
   * Complete brand analysis with immediate modal closure
   */
  completeBrandAnalysis(): void {
    this.ngZone.run(() => {
      // Mark API as completed to stop further progress updates
      this.isApiCompleted = true;
      
      // Clear any pending progress timeouts
      this.clearProgressTimeouts();
      
      // Calculate actual processing time for user feedback
      const processingTime = this.analysisStartTime > 0 ? 
        Math.round((Date.now() - this.analysisStartTime) / 1000) : 0;
      
      // Show completion message with actual time
      const completionMessage = processingTime > 0 ? 
        `Analysis completed in ${processingTime} seconds` : 
        'Analysis completed successfully';
      
      // Update to 100% progress with completion message
      this.updateProgress(completionMessage, 100);
      
      // Hide modal immediately after brief completion display
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          if (!this.destroy$.closed && this.modalStateSubject.value.isVisible) {
            this.hideModal();
          }
        }, 500); // Reduced to 500ms for better performance
      }
    });
  }

  /**
   * Force hide modal immediately (for error cases)
   */
  forceHideModal(): void {
    this.ngZone.run(() => {
      this.isApiCompleted = true;
      this.clearProgressTimeouts();
      this.hideModal();
    });
  }

  /**
   * Handle API timeout scenario
   */
  handleApiTimeout(): void {
    this.ngZone.run(() => {
      this.isApiCompleted = true;
      this.clearProgressTimeouts();
      this.updateProgress('Request timeout - Please try again', 100);
      
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          if (!this.destroy$.closed && this.modalStateSubject.value.isVisible) {
            this.hideModal();
          }
        }, 1500);
      }
    });
  }

  ngOnDestroy(): void {
    // Clear all pending timeouts before destroying
    this.clearProgressTimeouts();
    this.destroy$.next();
    this.destroy$.complete();
  }
}