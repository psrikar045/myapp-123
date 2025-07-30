import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { ApiKeyService } from '../../services/api-key.service';
import { AppThemeService } from '../../../../../core/services/app-theme.service';
import { ErrorHandlerService } from '../../../../../shared/services/error-handler.service';
import { ApiKey, SecuritySettings, ExpirationSettings } from '../../models/api-key.model';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { ErrorDisplayComponent } from '../error-display/error-display.component';

@Component({
  selector: 'app-api-key-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, ErrorDisplayComponent],
  templateUrl: './api-key-details.component.html',
  styleUrls: ['./api-key-details.component.scss']
})
export class ApiKeyDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data
  apiKey: ApiKey | null = null;
  usageAnalytics: any = null;
  
  // Forms
  securityForm: FormGroup;
  expirationForm: FormGroup;
  
  // UI State
  loading = true;
  error: string | null = null;
  activeTab = 'overview';
  
  // Theme
  isDarkMode$: any;
  
  // Chart data for usage analytics
  usageChartData: any = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiKeyService: ApiKeyService,
    private themeService: AppThemeService,
    private errorHandler: ErrorHandlerService,
    private fb: FormBuilder
  ) {
    this.securityForm = this.initializeSecurityForm();
    this.expirationForm = this.initializeExpirationForm();
  }

  ngOnInit(): void {
    this.isDarkMode$ = this.themeService.isDarkMode$;
    
    const apiKeyId = this.route.snapshot.paramMap.get('id');
    if (apiKeyId) {
      this.loadApiKeyDetails(apiKeyId);
    } else {
      this.error = 'API Key ID not found';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize security settings form
   */
  private initializeSecurityForm(): FormGroup {
    return this.fb.group({
      ipRestrictionsEnabled: [false],
      ipWhitelist: [''],
      domainRestrictionsEnabled: [false],
      allowedDomains: [''],
      webhookUrls: [''],
      allowedOrigins: ['']
    });
  }

  /**
   * Initialize expiration settings form
   */
  private initializeExpirationForm(): FormGroup {
    return this.fb.group({
      type: ['never', Validators.required],
      expiresAt: [''],
      autoRotate: [false],
      rotationInterval: [30],
      notifyBeforeExpiry: [true],
      notificationDays: [7]
    });
  }

  /**
   * Load API key details and analytics
   */
  private loadApiKeyDetails(apiKeyId: string): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      apiKey: this.apiKeyService.getApiKeyById(apiKeyId),
      analytics: this.apiKeyService.getApiKeyAnalytics(apiKeyId)
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.apiKey = data.apiKey;
        this.usageAnalytics = data.analytics;
        this.populateForms();
        this.prepareChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading API key details:', error);
        this.error = 'Failed to load API key details. Please try again.';
        this.loading = false;
      }
    });
  }

  /**
   * Populate forms with existing data
   */
  private populateForms(): void {
    if (this.apiKey?.security) {
      this.securityForm.patchValue({
        ipRestrictionsEnabled: this.apiKey.security.ipRestrictions.enabled,
        ipWhitelist: this.apiKey.security.ipRestrictions.whitelist.join('\n'),
        domainRestrictionsEnabled: this.apiKey.security.domainRestrictions.enabled,
        allowedDomains: this.apiKey.security.domainRestrictions.allowedDomains.join('\n'),
        webhookUrls: this.apiKey.security.webhookUrls.join('\n'),
        allowedOrigins: this.apiKey.security.allowedOrigins.join('\n')
      });
    }
  }

  /**
   * Prepare chart data for usage analytics
   */
  private prepareChartData(): void {
    if (this.usageAnalytics) {
      // Prepare data for charts (you can integrate with Chart.js or similar)
      this.usageChartData = {
        labels: this.usageAnalytics.dailyUsage.map((item: any) => item.date),
        datasets: [{
          label: 'API Calls',
          data: this.usageAnalytics.dailyUsage.map((item: any) => item.requests),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }]
      };
    }
  }

  /**
   * Switch active tab
   */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  /**
   * Update security settings
   */
  updateSecuritySettings(): void {
    if (this.securityForm.valid && this.apiKey) {
      const formValue = this.securityForm.value;
      const securitySettings: SecuritySettings = {
        ipRestrictions: {
          enabled: formValue.ipRestrictionsEnabled,
          whitelist: formValue.ipWhitelist ? formValue.ipWhitelist.split('\n').filter((ip: string) => ip.trim()) : []
        },
        domainRestrictions: {
          enabled: formValue.domainRestrictionsEnabled,
          allowedDomains: formValue.allowedDomains ? formValue.allowedDomains.split('\n').filter((domain: string) => domain.trim()) : []
        },
        webhookUrls: formValue.webhookUrls ? formValue.webhookUrls.split('\n').filter((url: string) => url.trim()) : [],
        allowedOrigins: formValue.allowedOrigins ? formValue.allowedOrigins.split('\n').filter((origin: string) => origin.trim()) : []
      };

      this.apiKeyService.updateApiKeySecurity(this.apiKey.id, securitySettings)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.errorHandler.showSuccess('Security settings updated successfully');
            // Update local API key object
            if (this.apiKey) {
              this.apiKey.security = securitySettings;
            }
          },
          error: (error) => {
            console.error('Error updating security settings:', error);
            this.errorHandler.showWarning(error.error?.message || 'Failed to update security settings');
          }
        });
    }
  }

  /**
   * Update expiration settings
   */
  updateExpirationSettings(): void {
    if (this.expirationForm.valid && this.apiKey) {
      const formValue = this.expirationForm.value;
      const expirationSettings: ExpirationSettings = {
        type: formValue.type,
        expiresAt: formValue.expiresAt ? new Date(formValue.expiresAt) : undefined,
        autoRotate: formValue.autoRotate,
        rotationInterval: formValue.rotationInterval,
        notifyBeforeExpiry: formValue.notifyBeforeExpiry,
        notificationDays: formValue.notificationDays
      };

      this.apiKeyService.updateApiKeyExpiration(this.apiKey.id, expirationSettings)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.errorHandler.showSuccess('Expiration settings updated successfully');
            // Update local API key object
            if (this.apiKey) {
              this.apiKey.expiresAt = expirationSettings.expiresAt?.toISOString();
            }
          },
          error: (error) => {
            console.error('Error updating expiration settings:', error);
            this.errorHandler.showWarning(error.error?.message || 'Failed to update expiration settings');
          }
        });
    }
  }

  /**
   * Regenerate API key
   */
  regenerateApiKey(): void {
    if (this.apiKey && confirm('Are you sure you want to regenerate this API key? The old key will stop working immediately.')) {
      this.apiKeyService.regenerateApiKey(this.apiKey.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.apiKey = response.apiKey;
            this.errorHandler.showSuccess('API key regenerated successfully! Make sure to update your applications with the new key.');
          },
          error: (error) => {
            console.error('Error regenerating API key:', error);
            this.errorHandler.showWarning(error.error?.message || 'Failed to regenerate API key');
          }
        });
    }
  }

  /**
   * Revoke API key
   */
  revokeApiKey(): void {
    if (this.apiKey && confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      this.apiKeyService.revokeApiKey(this.apiKey.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            if (this.apiKey) {
              this.apiKey.status = 'REVOKED';
            }
            this.errorHandler.showSuccess('API key revoked successfully');
            // Navigate back to account hub after a short delay
            setTimeout(() => {
              this.goBack();
            }, 2000);
          },
          error: (error) => {
            console.error('Error revoking API key:', error);
            this.errorHandler.showWarning(error.error?.message || 'Failed to revoke API key');
          }
        });
    }
  }

  /**
   * Copy API key to clipboard
   */
  copyApiKey(): void {
    if (this.apiKey?.maskedKey && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.apiKey.maskedKey).then(() => {
        this.errorHandler.showInfo('API key copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy API key:', err);
        this.errorHandler.showWarning('Failed to copy API key to clipboard');
      });
    }
  }

  /**
   * Format number with commas
   */
  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'badge bg-success';
      case 'EXPIRED': return 'badge bg-warning';
      case 'REVOKED': return 'badge bg-danger';
      case 'SUSPENDED': return 'badge bg-secondary';
      default: return 'badge bg-secondary';
    }
  }

  /**
   * Get usage percentage
   */
  getUsagePercentage(): number {
    if (!this.apiKey?.usage) return 0;
    const total = this.apiKey.usage.requestsToday + this.apiKey.usage.remainingToday;
    return Math.round((this.apiKey.usage.requestsToday / total) * 100);
  }

  /**
   * Navigate back to account hub
   */
  goBack(): void {
    this.router.navigate(['/brands/account-hub']);
  }
}