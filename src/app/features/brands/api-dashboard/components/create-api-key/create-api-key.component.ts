import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { addDays } from 'date-fns';


import { ApiKeyService } from '../../services/api-key.service';
import { AppThemeService } from '../../../../../core/services/app-theme.service';
import { ErrorHandlerService } from '../../../../../shared/services/error-handler.service';
import { SCOPE_GROUPS, ScopeGroup, ScopeDefinition } from '../../models/scope.model';
import { ApiKey, RateLimitTier } from '../../models/api-key.model';
import { DatePickerPopupComponent, DatePickerConfig } from '../../../../../shared/components/date-picker-popup/date-picker-popup.component';

// Wizard Step Interface
interface WizardStep {
  id: 'basic' | 'limits' | 'permissions' | 'summary';
  title: string;
  subtitle: string;
  icon: string;
  isComplete: boolean;
  isActive: boolean;
  isAccessible: boolean;
  fields: string[];
}


@Component({
  selector: 'app-create-api-key',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePickerPopupComponent],
  templateUrl: './create-api-key.component.html',
  styleUrls: ['./create-api-key.component.scss']
})
export class CreateApiKeyComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();
  
  // Form
  createForm: FormGroup;
  
  // Data
  scopeGroups: ScopeGroup[] = SCOPE_GROUPS;
  rateLimitTiers: any[] = [
    {
      tier: 'BASIC',
      description: 'Perfect for development and testing',
      requestsPerDay: 1000,
      requestsPerMinute: 10
    },
    {
      tier: 'STANDARD',
      description: 'Great for small to medium applications',
      requestsPerDay: 10000,
      requestsPerMinute: 100
    },
    {
      tier: 'PREMIUM',
      description: 'For high-volume production applications',
      requestsPerDay: 100000,
      requestsPerMinute: 1000
    },
    {
      tier: 'ENTERPRISE',
      description: 'Unlimited access for enterprise solutions',
      requestsPerDay: Number.MAX_SAFE_INTEGER,
      requestsPerMinute: Number.MAX_SAFE_INTEGER
    }
  ];
  
  // UI State
  loading = false;
  error: string | any = null;
  success = false;
  createdApiKey: ApiKey | any = null;
  copyButtonText = 'Copy';
  showBackToTop = false;

  // Wizard State
  wizardMode = true; // Toggle between wizard and classic mode
  currentStep = 0;
  steps: WizardStep[] |any = [
    {
      id: 'basic',
      title: 'Basic Information',
      subtitle: 'Name and environment settings',
      icon: 'bi-info-circle-fill',
      isComplete: false,
      isActive: true,
      isAccessible: true,
      fields: ['name', 'environment', 'prefix']
    },
    {
      id: 'limits',
      title: 'Rate Limits',
      subtitle: 'Tier and expiration settings',
      icon: 'bi-speedometer2',
      isComplete: false,
      isActive: false,
      isAccessible: false,
      fields: ['tier', 'expirationDate']
    },
    {
      id: 'permissions',
      title: 'Permissions',
      subtitle: 'Select API scopes',
      icon: 'bi-shield-check',
      isComplete: false,
      isActive: false,
      isAccessible: false,
      fields: ['scopes']
    },
    {
      id: 'summary',
      title: 'Review & Create',
      subtitle: 'Confirm your settings',
      icon: 'bi-check-circle-fill',
      isComplete: false,
      isActive: false,
      isAccessible: false,
      fields: []
    }
  ];
  
  // Scope Selection
  selectedScopes = new Set<string>();
  
  // Date picker configuration
  datePickerConfig: DatePickerConfig = {
    minDate: new Date(), // Can't select past dates
    maxDate: addDays(new Date(), 365 * 2), // Max 2 years from now
    placeholder: 'Select expiration date (optional)',
    clearable: true,
    position: 'bottom-left',
    showTime: false // Can be changed to true for time selection
  };

  /**
   * Format date for backend API (LocalDateTime format)
   */
  private formatDateForBackend(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Ensure the date is valid
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date provided');
    }
    
    // Format as ISO string for LocalDateTime (Java backend expects this format)
    return dateObj.toISOString();
  }
  
  // Expose Array constructor and Infinity for template
  Array = Array;
  Infinity = Infinity;

  constructor(
    private fb: FormBuilder,
    private apiKeyService: ApiKeyService,
    private themeService: AppThemeService,
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {
    this.createForm = this.initializeForm();
  }

  ngOnInit(): void {
    // Set default tier
    this.createForm.patchValue({
      tier: this.rateLimitTiers[0],
      environment: 'development'
    });

    // Add scroll listener for back to top button
    this.setupScrollListener();

    // Initialize wizard state
    this.updateStepStatus();

    // Listen to form changes to update wizard status
    this.createForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.wizardMode) {
        this.updateStepStatus();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the form
   */
  private initializeForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(1000)]],
      prefix: ['', [Validators.maxLength(10), Validators.pattern(/^[a-zA-Z0-9_-]*$/)]],
      environment: ['development', Validators.required], // Keep for UI, not sent to backend
      tier: [null, Validators.required],
      expirationDate: [null] // Optional expiration date
    });
  }

  /**
   * Submit the form
   */
  onSubmit(): void {
    if (this.createForm.invalid || this.selectedScopes.size === 0) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.createForm.value;
    
    try {
      // Create request payload matching ApiKeyCreateRequestDTO
      const createRequest: any = {
        name: formValue.name.trim(),
        description: formValue.description?.trim() || undefined,
        prefix: formValue.prefix?.trim() || undefined,
        rateLimitTier: formValue.tier?.tier || 'BASIC',
        scopes: Array.from(this.selectedScopes)
      };

      // Add expiration date if provided
      if (formValue.expirationDate) {
        createRequest.expiresAt = this.formatDateForBackend(formValue.expirationDate);
      }

      // Remove undefined properties to keep payload clean
      Object.keys(createRequest).forEach(key => {
        if (createRequest[key] === undefined) {
          delete createRequest[key];
        }
      });

      // Log the request payload for debugging
      console.log('API Key Create Request Payload:', createRequest);

      this.apiKeyService.createApiKey(createRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.createdApiKey = response.apiKey;
            this.success = true;
            this.loading = false;
            
            // Show success message
            this.errorHandler.showSuccess('API key created successfully! Make sure to copy and save it securely.');
            
            // Auto-redirect to account hub after 5 seconds, or user can click "Back to Account Hub"
            setTimeout(() => {
              if (this.success) { // Only redirect if still on success page
                this.goBackToAccountHub();
              }
            }, 2000);
          },
          error: (error) => {
            console.error('Error creating API key:', error);
            this.error = error.error?.message || 'Failed to create API key. Please try again.';
            this.errorHandler.showWarning(this.error);
            this.loading = false;
          }
        });
    } catch (error) {
      console.error('Error preparing API key request:', error);
      this.error = 'Invalid form data. Please check your inputs and try again.';
      this.loading = false;
    }
  }

  /**
   * Mark all form fields as touched
   */
  private markFormGroupTouched(): void {
    Object.keys(this.createForm.controls).forEach(key => {
      this.createForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Check if field has error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.createForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get field error message
   */
  getFieldError(fieldName: string): string {
    const field = this.createForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must be no more than ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['pattern']) {
        if (fieldName === 'prefix') return 'Prefix can only contain letters, numbers, hyphens, and underscores';
        return `${fieldName} format is invalid`;
      }
    }
    return '';
  }

  /**
   * Generate a suggested name
   */
  generateName(): void {
    const environments = ['dev', 'staging', 'prod'];
    const adjectives = ['quick', 'smart', 'secure', 'fast', 'reliable'];
    const nouns = ['api', 'key', 'access', 'token'];
    
    const env = this.createForm.get('environment')?.value || 'dev';
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    const suggestedName = `${adjective}-${noun}-${env}-${Date.now().toString().slice(-4)}`;
    this.createForm.patchValue({ name: suggestedName });
  }

  /**
   * Toggle scope selection
   */
  toggleScope(scopeKey: string): void {
    if (this.selectedScopes.has(scopeKey)) {
      this.selectedScopes.delete(scopeKey);
    } else {
      this.selectedScopes.add(scopeKey);
    }
  }

  /**
   * Select rate limit tier
   */
  selectRateLimitTier(tier: any): void {
    this.createForm.patchValue({ tier: tier });
    this.scrollToSection('permissions-section');
  }

  /**
   * Scroll to a specific section
   */
  scrollToSection(sectionId: string): void {
    // Add a small delay to allow form update to complete
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        // Calculate offset to account for fixed header
        const headerOffset = 100; // Adjust based on your header height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  /**
   * Check if scope is selected
   */
  isScopeSelected(scopeKey: string): boolean {
    return this.selectedScopes.has(scopeKey);
  }

  /**
   * Select all scopes in a group
   */
  selectAllInGroup(group: ScopeGroup): void {
    group.scopes.forEach(scope => {
      if (!scope.adminOnly) {
        this.selectedScopes.add(scope.key);
      }
    });
  }

  /**
   * Deselect all scopes in a group
   */
  deselectAllInGroup(group: ScopeGroup): void {
    group.scopes.forEach(scope => {
      this.selectedScopes.delete(scope.key);
    });
  }

  /**
   * Format number with commas
   */
  formatNumber(num: number): string {
    if (num === Infinity || num === Number.MAX_SAFE_INTEGER) return 'Unlimited';
    return num.toLocaleString();
  }

  /**
   * Copy API key to clipboard
   */
  /**
   * Enhanced copy API key with visual feedback
   */
  copyApiKey(): void {
    if (this.createdApiKey?.key && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.createdApiKey.key).then(() => {
        this.copyButtonText = 'Copied!';
        this.errorHandler.showInfo('API key copied to clipboard');
        setTimeout(() => {
          this.copyButtonText = 'Copy';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy API key:', err);
        // Fallback for older browsers
        this.fallbackCopyTextToClipboard(this.createdApiKey.key);
      });
    }
  }

  /**
   * Fallback copy method for older browsers
   */
  private fallbackCopyTextToClipboard(text: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          this.copyButtonText = 'Copied!';
          this.errorHandler.showInfo('API key copied to clipboard');
          setTimeout(() => {
            this.copyButtonText = 'Copy';
          }, 2000);
        } else {
          this.errorHandler.showWarning('Failed to copy API key to clipboard');
        }
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        this.errorHandler.showWarning('Failed to copy API key to clipboard');
      }

      document.body.removeChild(textArea);
    }
  }

  /**
   * Go back to account hub
   */
  goBackToAccountHub(): void {
    this.router.navigate(['/brands/api-dashboard']);
  }

  /**
   * Go back to previous page
   */
  goBack(): void {
    this.router.navigate(['/brands/api-dashboard']);
  }

  /**
   * Create another API key
   */
  createAnother(): void {
    // Reset form and state
    this.success = false;
    this.createdApiKey = null;
    this.error = null;
    this.selectedScopes.clear();
    this.createForm.reset();
    this.createForm.patchValue({
      tier: this.rateLimitTiers[0],
      environment: 'development'
    });
    
    // Reset wizard state
    this.currentStep = 0;
    this.updateStepStatus();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Setup scroll listener for back to top button
   */
  private setupScrollListener(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', () => {
        this.showBackToTop = window.pageYOffset > 300;
      });
    }
  }

  /**
   * Scroll to top
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==================== WIZARD MODE METHODS ====================

  /**
   * Toggle between wizard and classic mode
   */
  toggleWizardMode(): void {
    this.wizardMode = !this.wizardMode;
    if (this.wizardMode) {
      this.updateStepStatus();
    }
  }

  /**
   * Get current wizard step
   */
  getCurrentStep(): WizardStep {
    return this.steps[this.currentStep];
  }

  /**
   * Update step status based on form validation
   */
  updateStepStatus(): void {
    this.steps.forEach((step: WizardStep, index: number) => {
      // Reset states
      step.isActive = index === this.currentStep;
      
      // Check if step is complete based on required fields
      step.isComplete = this.isStepComplete(step);
      
      // Make next step accessible if current step is complete
      if (index === 0) {
        step.isAccessible = true;
      } else {
        step.isAccessible = this.steps[index - 1].isComplete;
      }
    });
  }

  /**
   * Check if a step is complete
   */
  private isStepComplete(step: WizardStep): boolean {
    switch (step.id) {
      case 'basic':
        const nameValid = this.createForm.get('name')?.valid;
        const envValid = this.createForm.get('environment')?.valid;
        return !!(nameValid && envValid);
        
      case 'limits':
        const tierValid = this.createForm.get('tier')?.valid;
        return !!tierValid;
        
      case 'permissions':
        return this.selectedScopes.size > 0;
        
      case 'summary':
        return this.createForm.valid && this.selectedScopes.size > 0;
        
      default:
        return false;
    }
  }

  /**
   * Go to specific step
   */
  goToStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.steps.length && this.steps[stepIndex].isAccessible) {
      this.currentStep = stepIndex;
      this.updateStepStatus();
    }
  }

  /**
   * Go to next step
   */
  nextStep(): void {
    if (this.currentStep < this.steps.length - 1 && this.getCurrentStep().isComplete) {
      this.currentStep++;
      this.updateStepStatus();
      this.scrollToTop();
    }
  }

  /**
   * Go to previous step
   */
  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateStepStatus();
      this.scrollToTop();
    }
  }

  /**
   * Get wizard progress percentage
   */
  getWizardProgress(): number {
    const completedSteps = this.steps.filter((step: WizardStep) => step.isComplete).length;
    return Math.round((completedSteps / this.steps.length) * 100);
  }

  /**
   * Check if we can proceed to next step
   */
  canProceedToNext(): boolean {
    return this.getCurrentStep().isComplete && this.currentStep < this.steps.length - 1;
  }

  /**
   * Check if we can go back to previous step
   */
  canGoToPrevious(): boolean {
    return this.currentStep > 0;
  }

  /**
   * Check if current step is the last step
   */
  isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  /**
   * Get selected scopes count
   */
  getSelectedScopesCount(): number {
    return this.selectedScopes.size;
  }

  /**
   * Get selected scopes as array
   */
  getSelectedScopesArray(): string[] {
    return Array.from(this.selectedScopes);
  }

  /**
   * Get scope definition by key
   */
  getScopeDefinition(scopeKey: string): ScopeDefinition | undefined {
    for (const group of this.scopeGroups) {
      const scope = group.scopes.find(s => s.key === scopeKey);
      if (scope) return scope;
    }
    return undefined;
  }

  // ==================== ADDITIONAL HELPER METHODS ====================

  /**
   * Download API key information as JSON
   */
  downloadKeyInfo(): void {
    if (!this.createdApiKey) return;

    const keyInfo = {
      name: this.createdApiKey.name,
      tier: this.createdApiKey.tier,
      scopes: this.createdApiKey.scopes,
      createdAt: new Date().toISOString(),
      expiresAt: this.createdApiKey.expiresAt,
      // Note: We don't include the actual key for security
      note: 'The actual API key is not included in this file for security reasons.'
    };

    const dataStr = JSON.stringify(keyInfo, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `api-key-${this.createdApiKey.name.replace(/\s+/g, '-').toLowerCase()}-info.json`;
    
    if (isPlatformBrowser(this.platformId)) {
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  }

  /**
   * View API documentation
   */
  viewDocumentation(): void {
    // Open documentation in new tab
    if (isPlatformBrowser(this.platformId)) {
      window.open('/docs/api', '_blank');
    }
  }

  /**
   * Test the API key
   */
  testApiKey(): void {
    // Navigate to API testing interface
    this.router.navigate(['/brands/api-dashboard/test'], { 
      queryParams: { keyId: this.createdApiKey?.id } 
    });
  }

  /**
   * Handle expiration date picker value change
   */
  onExpirationDateChange(date: Date | null): void {
    this.createForm.patchValue({ expirationDate: date });
  }
}