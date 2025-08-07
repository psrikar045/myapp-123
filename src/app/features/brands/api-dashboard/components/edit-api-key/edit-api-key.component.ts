import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
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
  styleUrls: ['./edit-api-key.component.scss']
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
    private errorHandler: ErrorHandlerService
  ) {
    this.editForm = this.initializeForm();
  }

  ngOnInit(): void {
    if (this.apiKey) {
      this.populateForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Repopulate form when apiKey input changes
    if (changes['apiKey'] && changes['apiKey'].currentValue) {
      this.populateForm();
    }
    
    // Reset form when modal is closed
    if (changes['isVisible'] && !changes['isVisible'].currentValue && changes['isVisible'].previousValue) {
      this.resetForm();
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
      expiresAt: [''],
      allowedIps: [''],
      allowedDomains: [''],
      rateLimitTier: ['', Validators.required]
    });
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
      const date = new Date(this.apiKey.expiresAt);
      if (!isNaN(date.getTime())) {
        // Format as YYYY-MM-DDTHH:mm for datetime-local input
        expirationDate = date.toISOString().slice(0, 16);
      }
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

    this.editForm.patchValue(formData);
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
      if (formValue.expiresAt) {
        const expirationDate = new Date(formValue.expiresAt);
        if (!isNaN(expirationDate.getTime())) {
          updateRequest.expiresAt = expirationDate.toISOString();
        }
      } else if (this.apiKey.expiresAt) {
        // If expiration was cleared, set to null
        updateRequest.expiresAt = undefined;
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
            this.close();
          },
          error: (error) => {
            console.error('Error updating API key:', error);
            this.error = error.error?.message || 'Failed to update API key. Please try again.';
            this.errorHandler.showWarning(this.error!);
            this.loading = false;
          }
        });
    } catch (error) {
      console.error('Error preparing API key update request:', error);
      this.error = 'Invalid form data. Please check your inputs and try again.';
      this.loading = false;
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
}