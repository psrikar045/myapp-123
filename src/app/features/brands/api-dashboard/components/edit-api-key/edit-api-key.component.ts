import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { ApiKeyService } from '../../services/api-key.service';
import { ErrorHandlerService } from '../../../../../shared/services/error-handler.service';
import { ApiKey, ApiKeyUpdateRequest } from '../../models/api-key.model';

@Component({
  selector: 'app-edit-api-key',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-api-key.component.html',
  styleUrls: ['./edit-api-key.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditApiKeyComponent implements OnInit, OnDestroy, OnChanges {
  @Input() apiKey: ApiKey | null = null;
  @Input() isVisible: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<ApiKey>();

  private destroy$ = new Subject<void>();
  
  // Form
  editForm: FormGroup;
  
  // UI State
  loading = false;
  error: string | null = null;
  
  // Rate limit tiers
  rateLimitTiers = [
    { value: 'FREE_TIER', label: 'Free Tier', description: 'Basic usage limits' },
    { value: 'PRO_TIER', label: 'Pro Tier', description: 'Enhanced limits for professionals' },
    { value: 'BUSINESS_TIER', label: 'Business Tier', description: 'High-volume production usage' },
    { value: 'BASIC', label: 'Basic', description: 'Basic tier' },
    { value: 'STANDARD', label: 'Standard', description: 'Standard tier' },
    { value: 'PREMIUM', label: 'Premium', description: 'Premium tier' },
    { value: 'ENTERPRISE', label: 'Enterprise', description: 'Enterprise tier' },
    { value: 'UNLIMITED', label: 'Unlimited', description: 'Unlimited usage' }
  ];

  constructor(
    private fb: FormBuilder,
    private apiKeyService: ApiKeyService,
    private errorHandler: ErrorHandlerService,
    private cdr: ChangeDetectorRef
  ) {
    this.editForm = this.initializeForm();
  }

  ngOnInit(): void {
    if (this.apiKey) {
      this.populateForm();
    }
    
    // Test date formatting with various formats
    this.testDateFormatting();
  }
  
  /**
   * Test date formatting with various input formats
   */
  private testDateFormatting(): void {
    const testDates = [
      '2024-12-25T14:30:00Z',
      '2024-12-25T14:30:00.000Z',
      '2024-12-25T14:30:00',
      '2024-12-25 14:30:00',
      '2024-12-25'
    ];
    
    // console.log('Testing date formatting for date input:');
    // testDates.forEach(dateStr => {
    //   const formatted = this.formatDateForInput(dateStr);
    //   console.log(`${dateStr} -> ${formatted}`);
    // });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Repopulate form when apiKey input changes
    if (changes['apiKey']) {
      if (changes['apiKey'].currentValue) {
        // Use setTimeout to ensure the form is ready
        setTimeout(() => {
          this.populateForm();
        }, 0);
      }
    }
    
    // Reset form when modal is closed
    if (changes['isVisible'] && !changes['isVisible'].currentValue && changes['isVisible'].previousValue) {
      this.resetForm();
    }
    
    // Repopulate form when modal is opened with existing data
    if (changes['isVisible'] && changes['isVisible'].currentValue && !changes['isVisible'].previousValue && this.apiKey) {
      setTimeout(() => {
        this.populateForm();
      }, 0);
    }
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
      registeredDomain: [''],
      isActive: [true],
      expiresAt: ['', [this.futureDateValidator]],
      allowedIps: [''],
      allowedDomains: [''],
      rateLimitTier: ['', Validators.required]
    });
  }

  /**
   * Custom validator to ensure expiration date is in the future
   */
  private futureDateValidator(control: any) {
    if (!control.value) {
      return null; // Allow empty values (no expiration)
    }
    
    const selectedDate = new Date(control.value);
    const now = new Date();
    
    if (isNaN(selectedDate.getTime())) {
      return { invalidDate: true };
    }
    
    if (selectedDate <= now) {
      return { pastDate: true };
    }
    
    return null;
  }

  /**
   * Populate form with API key data
   */
  private populateForm(): void {
    if (!this.apiKey) {
      return;
    }

    // Format expiration date for input field
    let expirationDate = '';
    if (this.apiKey.expiresAt) {
      expirationDate = this.formatDateForInput(this.apiKey.expiresAt);
    }

    const formData = {
      name: this.apiKey.name || '',
      description: this.apiKey.description || '',
      registeredDomain: this.apiKey.registeredDomain || '',
      isActive: this.apiKey.status === 'ACTIVE',
      expiresAt: expirationDate,
      allowedIps: this.apiKey.allowedIps?.join(', ') || '',
      allowedDomains: this.apiKey.allowedDomains?.join(', ') || '',
      rateLimitTier: this.apiKey.tier || 'FREE_TIER'
    };

    console.log('Populating form with data:', formData);
    
    this.editForm.patchValue(formData);

    // Disable/enable status toggle based on default key
    const isDefault = this.apiKey.defaultKey === true;
    const isActiveCtrl = this.editForm.get('isActive');
    if (isDefault) {
      isActiveCtrl?.disable({ emitEvent: false });
    } else {
      isActiveCtrl?.enable({ emitEvent: false });
    }
    
    // Force change detection for the expiration date field
    this.editForm.get('expiresAt')?.updateValueAndValidity();
    
    // Log the final form value to verify
    console.log('Form populated, expiresAt value:', this.editForm.get('expiresAt')?.value);
  }

  /**
   * Submit the form
   */
  onSubmit(): void {
    if (this.editForm.invalid || !this.apiKey) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.editForm.value;
    
    try {
      // Create update request payload
      const updateRequest: ApiKeyUpdateRequest = {};

      // Only include fields that have changed
      if (formValue.name !== this.apiKey.name) {
        updateRequest.name = formValue.name.trim();
      }

      if (formValue.description !== (this.apiKey.description || '')) {
        updateRequest.description = formValue.description?.trim() || undefined;
      }

      if (formValue.registeredDomain !== (this.apiKey.registeredDomain || '')) {
        updateRequest.registeredDomain = formValue.registeredDomain?.trim() || undefined;
      }

      const isCurrentlyActive = this.apiKey.status === 'ACTIVE';
      if (formValue.isActive !== isCurrentlyActive) {
        updateRequest.isActive = formValue.isActive;
      }

      // Handle expiration date
      const currentExpiresAt = this.apiKey.expiresAt || '';
      const newExpiresAt = formValue.expiresAt || '';
      
      // Compare dates properly by converting both to ISO strings
      let currentDateISO = '';
      let newDateISO = '';
      
      if (currentExpiresAt) {
        try {
          const currentDate = new Date(currentExpiresAt);
          if (!isNaN(currentDate.getTime())) {
            // For comparison, we'll use just the date part
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            currentDateISO = `${year}-${month}-${day}`;
          }
        } catch (error) {
          console.warn('Error parsing current expiration date:', currentExpiresAt);
        }
      }
      
      if (newExpiresAt) {
        try {
          // The date input gives us a date string in YYYY-MM-DD format
          // For comparison, we'll use the date part only
          newDateISO = newExpiresAt;
          console.log('Processing new expiration date:', {
            input: newExpiresAt,
            forComparison: newDateISO
          });
        } catch (error) {
          console.warn('Error parsing new expiration date:', newExpiresAt);
        }
      }
      
      if (newDateISO !== currentDateISO) {
        if (newDateISO) {
          // Convert the date to end of day for the backend
          const expirationDate = new Date(newDateISO + 'T23:59:59');
          updateRequest.expiresAt = expirationDate.toISOString();
          console.log('Setting expiration date for backend:', {
            dateInput: newDateISO,
            endOfDay: newDateISO + 'T23:59:59',
            iso: updateRequest.expiresAt
          });
        } else {
          // If expiration was cleared, set to undefined
          updateRequest.expiresAt = undefined;
        }
      }

      // Handle allowed IPs
      const allowedIps = formValue.allowedIps
        ? formValue.allowedIps.split(',').map((ip: string) => ip.trim()).filter((ip: string) => ip)
        : [];
      if (JSON.stringify(allowedIps) !== JSON.stringify(this.apiKey.allowedIps || [])) {
        updateRequest.allowedIps = allowedIps;
      }

      // Handle allowed domains
      const allowedDomains = formValue.allowedDomains
        ? formValue.allowedDomains.split(',').map((domain: string) => domain.trim()).filter((domain: string) => domain)
        : [];
      if (JSON.stringify(allowedDomains) !== JSON.stringify(this.apiKey.allowedDomains || [])) {
        updateRequest.allowedDomains = allowedDomains;
      }

      if (formValue.rateLimitTier !== this.apiKey.tier) {
        updateRequest.rateLimitTier = formValue.rateLimitTier;
      }

      // Check if there are any changes
      if (Object.keys(updateRequest).length === 0) {
        this.errorHandler.showInfo('No changes detected');
        this.loading = false;
        return;
      }

      console.log('API Key Update Request Payload:', updateRequest);

      this.apiKeyService.updateApiKey(this.apiKey.id, updateRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('API Key update response:', response);
            
            // Create updated API key object
            const updatedApiKey: ApiKey = {
              ...this.apiKey!,
              name: response.name,
              description: response.description || undefined,
              registeredDomain: response.registeredDomain || undefined,
              tier: response.rateLimitTier,
              allowedIps: response.allowedIps,
              allowedDomains: response.allowedDomains,
              expiresAt: response.expiresAt || undefined,
              status: response.active ? 'ACTIVE' : 'REVOKED',
              updatedAt: response.updatedAt || new Date().toISOString()
            };

            this.loading = false;
            this.errorHandler.showSuccess('API key updated successfully!');
            this.onSave.emit(updatedApiKey);
            this.cdr.markForCheck();
            this.close();
          },
          error: (error) => {
            console.error('Error updating API key:', error);
            this.error = error.error?.message || 'Failed to update API key. Please try again.';
            this.errorHandler.showWarning(this.error!);
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
    } catch (error) {
      console.error('Error preparing API key update request:', error);
      this.error = 'Invalid form data. Please check your inputs and try again.';
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Close the modal
   */
  close(): void {
    this.resetForm();
    this.onClose.emit();
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.editForm.reset();
    this.error = null;
    this.loading = false;
    this.cdr.markForCheck();
  }

  /**
   * Mark all form fields as touched
   */
  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      this.editForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Check if field has error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get field error message
   */
  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${this.getFieldDisplayName(fieldName)} must be no more than ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['invalidDate']) return `Please enter a valid date and time`;
      if (field.errors['pastDate']) return `Expiration date must be in the future`;
    }
    return '';
  }

  /**
   * Get field display name
   */
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      name: 'Name',
      description: 'Description',
      registeredDomain: 'Registered Domain',
      isActive: 'Status',
      expiresAt: 'Expiration Date',
      allowedIps: 'Allowed IPs',
      allowedDomains: 'Allowed Domains',
      rateLimitTier: 'Rate Limit Tier'
    };
    return displayNames[fieldName] || fieldName;
  }

  /**
   * Get tier display name
   */
  getTierDisplayName(tier: string): string {
    const tierObj = this.rateLimitTiers.find(t => t.value === tier);
    return tierObj ? tierObj.label : tier;
  }

  /**
   * Format expiration date for display
   */
  formatExpirationDate(dateValue: string): string {
    if (!dateValue) return '';
    
    try {
      // For date input, we get YYYY-MM-DD format
      // Convert to a more readable format
      const date = new Date(dateValue + 'T00:00:00');
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting expiration date:', dateValue, error);
      return '';
    }
  }

  /**
   * Clear the expiration date
   */
  clearExpirationDate(): void {
    this.editForm.get('expiresAt')?.setValue('');
    this.editForm.get('expiresAt')?.markAsTouched();
  }

  /**
   * Set default expiration date (30 days from now)
   */
  setDefaultExpirationDate(): void {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    
    // Format as YYYY-MM-DD for date input
    const year = defaultDate.getFullYear();
    const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
    const day = String(defaultDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    this.editForm.get('expiresAt')?.setValue(formattedDate);
    this.editForm.get('expiresAt')?.markAsTouched();
  }

  /**
   * Format date string for date input (YYYY-MM-DD format)
   * Extracts only the date part, ignoring time
   */
  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    
    try {
      let formatted = '';
      
      // Check if this is an ISO string with timezone info
      if (dateString.includes('T') && (dateString.endsWith('Z') || dateString.includes('+') || dateString.includes('-'))) {
        // This is an ISO string with timezone info (likely from backend)
        // For date input, we only need the date part (YYYY-MM-DD)
        
        // Extract the date part manually to avoid timezone conversion
        const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
          const [, year, month, day] = isoMatch;
          formatted = `${year}-${month}-${day}`;
          
          // console.log('Manual ISO date parsing:', {
          //   original: dateString,
          //   extracted: { year, month, day },
          //   formatted
          // });
        } else {
          // Fallback to Date parsing
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            formatted = `${year}-${month}-${day}`;
            
            console.log('Fallback Date parsing for date input:', {
              original: dateString,
              parsed: date,
              formatted
            });
          }
        }
      } else {
        // This might be a local datetime string without timezone info
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          formatted = `${year}-${month}-${day}`;
          
          // console.log('Local date parsing:', {
          //   original: dateString,
          //   parsed: date,
          //   formatted
          // });
        }
      }
      
      return formatted;
    } catch (error) {
      console.warn('Error formatting date for input:', dateString, error);
      return '';
    }
  }
}