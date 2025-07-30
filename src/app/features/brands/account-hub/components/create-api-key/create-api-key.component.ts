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
   * Get today's date in YYYY-MM-DD format for date input min attribute
   */
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

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
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.copyButtonText = 'Copied!';
      this.errorHandler.showInfo('API key copied to clipboard');
      setTimeout(() => {
        this.copyButtonText = 'Copy';
      }, 2000);
    } catch (err) {
      console.error('Fallback: Could not copy text: ', err);
      this.errorHandler.showWarning('Failed to copy API key to clipboard');
    }
    
    document.body.removeChild(textArea);
  }

  /**
   * Create another API key
   */
  createAnother(): void {
    this.success = false;
    this.createdApiKey = null;
    this.createForm.reset();
    this.selectedScopes.clear();
    this.ngOnInit();
  }

  /**
   * Download key information as JSON
   */
  downloadKeyInfo(): void {
    if (!this.createdApiKey) return;

    const keyInfo = {
      name: this.createdApiKey.name,
      tier: this.createdApiKey.tier,
      environment: this.createdApiKey.environment,
      createdAt: new Date().toISOString(),
      expirationDate: this.createdApiKey.expirationDate,
      scopes: Array.from(this.selectedScopes),
      note: 'This file contains metadata about your API key. The actual key is not included for security reasons.'
    };

    const dataStr = JSON.stringify(keyInfo, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `api-key-${this.createdApiKey.name.toLowerCase().replace(/\s+/g, '-')}-info.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  /**
   * View API documentation
   */
  viewDocumentation(): void {
    // Open documentation in new tab
    window.open('/docs/api-keys', '_blank');
  }

  /**
   * Test the API key
   */
  testApiKey(): void {
    if (!this.createdApiKey?.key) return;
    
    // Navigate to API testing page with the key
    this.router.navigate(['/brands/account-hub/api-test'], {
      queryParams: { keyId: this.createdApiKey.id }
    });
  }

  /**
   * Navigate back to account hub
   */
  goBack(): void {
    this.router.navigate(['/brands/account-hub']);
  }

  /**
   * Navigate back to account hub with success message
   */
  goBackToAccountHub(): void {
    this.router.navigate(['/brands/account-hub']);
  }

  /**
   * Cancel API key creation and navigate back
   */
  onCancel(): void {
    // Show confirmation dialog if form has been modified
    if (this.createForm.dirty) {
      const confirmed = confirm('Are you sure you want to cancel? All entered information will be lost.');
      if (!confirmed) {
        return;
      }
    }
    
    // Navigate back to account hub
    this.router.navigate(['/brands/account-hub']);
  }

  /**
   * Calculate form completion progress (for classic mode)
   */
  getFormProgress(): number {
    if (this.wizardMode) {
      return this.getWizardProgress();
    }
    
    const requiredFields = ['name', 'environment', 'tier', 'prefix'];
    let completedFields = 0;
    
    // Check required form fields
    requiredFields.forEach(field => {
      if (this.createForm.get(field)?.valid) {
        completedFields++;
      }
    });
    
    // Check if at least one scope is selected
    if (this.selectedScopes.size > 0) {
      completedFields++;
    }
    
    // Calculate percentage (5 total requirements)
    return Math.round((completedFields / 5) * 100);
  }

  /**
   * Scroll to top of the page smoothly
   */
  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else {
        // Fallback to window scroll
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }
    }
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

  // ==================== WIZARD NAVIGATION METHODS ====================

  /**
   * Navigate to the next step
   */
  nextStep(): void {
    if (this.currentStep < this.steps.length - 1 && this.canProceedToNextStep()) {
      this.currentStep++;
      this.updateStepStatus();
      this.scrollToTop();
    }
  }

  /**
   * Navigate to the previous step
   */
  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateStepStatus();
      this.scrollToTop();
    }
  }

  /**
   * Navigate to a specific step
   */
  goToStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.steps.length && this.steps[stepIndex].isAccessible) {
      this.currentStep = stepIndex;
      this.updateStepStatus();
      this.scrollToTop();
    }
  }

  /**
   * Check if user can proceed to next step
   */
  canProceedToNextStep(): any {
    const currentStepData = this.steps[this.currentStep];
    
    switch (currentStepData.id) {
      case 'basic':
        return this.createForm.get('name')?.valid && 
               this.createForm.get('environment')?.valid && 
               this.createForm.get('prefix')?.valid;
      
      case 'limits':
        return this.createForm.get('tier')?.valid;
      
      case 'permissions':
        return this.selectedScopes.size > 0;
      
      case 'summary':
        return this.createForm.valid && this.selectedScopes.size > 0;
      
      default:
        return false;
    }
  }

  /**
   * Update step status based on form validation
   */
  updateStepStatus(): void {
    this.steps.forEach((step :any, index:any) => {
      // Set active step
      step.isActive = index === this.currentStep;
      
      // Set accessibility (can click to navigate)
      if (index === 0) {
        step.isAccessible = true;
      } else {
        step.isAccessible = this.steps[index - 1].isComplete;
      }
      
      // Set completion status
      switch (step.id) {
        case 'basic':
          step.isComplete = this.createForm.get('name')?.valid && 
                           this.createForm.get('environment')?.valid && 
                           this.createForm.get('prefix')?.valid;
          break;
        
        case 'limits':
          step.isComplete = this.createForm.get('tier')?.valid;
          break;
        
        case 'permissions':
          step.isComplete = this.selectedScopes.size > 0;
          break;
        
        case 'summary':
          step.isComplete = this.createForm.valid && this.selectedScopes.size > 0;
          break;
      }
    });

    // Auto-advance logic (optional)
    if (this.canProceedToNextStep() && this.currentStep < this.steps.length - 1) {
      // Enable next step accessibility
      if (this.currentStep + 1 < this.steps.length) {
        this.steps[this.currentStep + 1].isAccessible = true;
      }
    }
  }

  /**
   * Get current step data
   */
  getCurrentStep(): WizardStep {
    return this.steps[this.currentStep];
  }

  /**
   * Get progress percentage
   */
  getWizardProgress(): number {
    const completedSteps = this.steps.filter((step:any) => step.isComplete).length;
    return Math.round((completedSteps / this.steps.length) * 100);
  }

  /**
   * Toggle between wizard and classic mode
   */
  toggleWizardMode(): void {
    this.wizardMode = !this.wizardMode;
  }

  /**
   * Check if current step is valid
   */
  isCurrentStepValid(): boolean {
    return this.canProceedToNextStep();
  }

  /**
   * Get step validation errors
   */
  getStepErrors(): string[] {
    const errors: string[] = [];
    const currentStepData = this.steps[this.currentStep];
    
    currentStepData.fields.forEach((fieldName:any) => {
      const field = this.createForm.get(fieldName);
      if (field && field.invalid && field.touched) {
        errors.push(this.getFieldError(fieldName));
      }
    });

    if (currentStepData.id === 'permissions' && this.selectedScopes.size === 0) {
      errors.push('Please select at least one permission scope');
    }

    return errors;
  }

  /**
   * Get selected scope keys as array
   */
  getSelectedScopeKeys(): string[] {
    return Array.from(this.selectedScopes);
  }

  /**
   * Get display name for a scope key
   */
  getScopeDisplayName(scopeKey: string): string {
    for (const group of this.scopeGroups) {
      const scope = group.scopes.find(s => s.key === scopeKey);
      if (scope) {
        return scope.name;
      }
    }
    return scopeKey;
  }

  /**
   * Select all scopes
   */
  selectAllScopes(): void {
    this.scopeGroups.forEach(group => {
      group.scopes.forEach(scope => {
        if (!scope.adminOnly) {
          this.selectedScopes.add(scope.key);
        }
      });
    });
    this.updateStepStatus();
  }

  /**
   * Clear all selected scopes
   */
  clearAllScopes(): void {
    this.selectedScopes.clear();
    this.updateStepStatus();
  }



  /**
   * Get display name for field
   */
  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      'name': 'API Key Name',
      'prefix': 'API Key Prefix',
      'environment': 'Environment',
      'tier': 'Rate Limit Tier',
      'expirationDate': 'Expiration Date',
      'description': 'Description'
    };
    return fieldNames[fieldName] || fieldName;
  }
}