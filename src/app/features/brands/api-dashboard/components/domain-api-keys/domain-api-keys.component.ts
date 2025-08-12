import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, forkJoin, switchMap, throwError } from 'rxjs';

import { ApiKeyService } from '../../services/api-key.service';
import { ApiKey, RegenerateApiKeyResponse } from '../../models/api-key.model';
import { SingleApiKeyDashboardResponse, TransformedApiKeyDashboard } from '../../models/dashboard-api.model';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { ClipboardService } from '../../../../../shared/services/clipboard.service';

@Component({
  selector: 'app-domain-api-keys',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './domain-api-keys.component.html',
  styleUrls: ['./domain-api-keys.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DomainApiKeysComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data properties
  selectedApiKey: ApiKey | null = null;
  domainApiKeys: ApiKey[] = [];
  domain = '';
  
  // Dashboard data
  apiKeyDashboard: TransformedApiKeyDashboard | null = null;
  dashboardError: string | null = null;
  dashboardLoading = false;
  
  // UI state  
  error: string | null = null;
  loading = false;
  
  // Regenerate popup state
  showRegeneratePopup = false;
  regeneratedApiKey: string | null = null;
  regenerating = false;
  
  // Revoke state
  revoking = false;
  showRevokeConfirmation = false;
  
  // Show key state
  showingFullKey: Record<string, boolean> = {};
  decryptedKeys: Record<string, string> = {};
  decryptingKeys: Record<string, boolean> = {};
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiKeyService: ApiKeyService,
    private errorHandler: ErrorHandlerService,
    private clipboardService: ClipboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to API keys updates from the service
    this.apiKeyService.apiKeys$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(apiKeys => {
      // Update domain API keys if we have a domain filter
      if (this.domain) {
        this.domainApiKeys = apiKeys.filter(key => 
          key.registeredDomain?.toLowerCase() === this.domain.toLowerCase()
        );
      }
      
      // Update selected API key if it exists in the updated list
      if (this.selectedApiKey) {
        const updatedSelectedKey = apiKeys.find(key => key.id === this.selectedApiKey!.id);
        if (updatedSelectedKey) {
          this.selectedApiKey = updatedSelectedKey;
        }
      }
    });

    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const apiKeyId = params['id'];
      if (apiKeyId) {
        this.loadApiKeyDetailsOptimized(apiKeyId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clear sensitive data from memory
    this.decryptedKeys = {};
    this.showingFullKey = {};
    this.decryptingKeys = {};
  }

  /**
   * Load API key details and related domain keys (OPTIMIZED - avoid unnecessary API calls)
   */
  private loadApiKeyDetailsOptimized(apiKeyId: string): void {
    this.error = null;
    this.loading = true;

    // First check if we already have the API key data in the service
    const currentApiKeys = this.apiKeyService.getCurrentApiKeys();
    const existingApiKey = currentApiKeys.find(key => key.id === apiKeyId);

    if (existingApiKey) {
      // We already have the API key data, no need to call the API keys endpoint again
      console.log('✅ Using existing API key data, skipping API keys API call');
      
      this.selectedApiKey = existingApiKey;
      this.domain = this.extractDomainFromApiKey(this.selectedApiKey);
      this.domainApiKeys = [this.selectedApiKey];
      
      // Clear cache to force recalculation
      this._cachedGroupedKeys = null;
      
      // Only load dashboard data (real-time) with local loading state
      this.dashboardLoading = true;
      this.apiKeyService.getApiKeyDashboard(apiKeyId, true).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (dashboardData) => {
          // Transform and set dashboard data
          this.apiKeyDashboard = this.apiKeyService.transformApiKeyDashboard(dashboardData);
          this.dashboardLoading = false;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.error = 'Failed to load dashboard data.';
          this.dashboardLoading = false;
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      // We don't have the API key data, need to load it first
      console.log('⚠️ API key not found in current data, loading from API');
      this.loadApiKeyDetails(apiKeyId);
    }
  }

  /**
   * Load API key details and related domain keys (FALLBACK - when data not available)
   */
  private loadApiKeyDetails(apiKeyId: string): void {
    this.error = null;
    this.loading = true;

    // Load all keys first, then load dashboard data in sequence
    this.apiKeyService.ensureApiKeysLoaded().pipe(
      takeUntil(this.destroy$),
      switchMap((allKeys) => {
        // Find the selected API key
        this.selectedApiKey = allKeys.keys.find(key => key.id === apiKeyId) || null;
        
        if (!this.selectedApiKey) {
          this.error = 'API key not found.';
          this.loading = false;
          this.cdr.markForCheck();
          return throwError(() => new Error('API key not found'));
        }

        // Extract domain from the selected API key
        this.domain = this.extractDomainFromApiKey(this.selectedApiKey);
        
        // For now, we'll show only the selected API key, but keep the structure
        // to potentially show related domain keys in the future
        this.domainApiKeys = [this.selectedApiKey];
        
        // Clear cache to force recalculation
        this._cachedGroupedKeys = null;
        
        // Load dashboard data for this API key - always get fresh data
        this.dashboardLoading = true;
        return this.apiKeyService.getApiKeyDashboard(apiKeyId, true);
      })
    ).subscribe({
      next: (dashboardData) => {
        // Transform and set dashboard data
        this.apiKeyDashboard = this.apiKeyService.transformApiKeyDashboard(dashboardData);
        this.dashboardLoading = false;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading API key details or dashboard:', error);
        this.error = 'Failed to load API key details.';
        this.dashboardLoading = false;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Extract domain from API key
   */
  private extractDomainFromApiKey(apiKey: ApiKey): string {
    // Extract domain from security settings
    if (apiKey.security?.domainRestrictions?.allowedDomains?.length > 0) {
      return apiKey.security.domainRestrictions.allowedDomains[0];
    }
    
    // Fallback: extract from allowed origins
    if (apiKey.security?.allowedOrigins?.length > 0) {
      try {
        const url = new URL(apiKey.security.allowedOrigins[0]);
        return url.hostname;
      } catch (e) {
        // Invalid URL, continue to fallback
      }
    }
    
    // Final fallback - use a mock domain based on API key name
    const domains = [
      'example.com',
      'another-example.com', 
      'third-example.com',
      'fourth-example.com',
      'fifth-example.com'
    ];
    
    // Use a simple hash to consistently assign domains
    const index = Math.abs(apiKey.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % domains.length;
    return domains[index];
  }

  /**
   * Load API key dashboard data (used for refresh functionality)
   */
  private loadApiKeyDashboard(apiKeyId: string, refresh = false): void {
    console.log('🚀 Starting API key dashboard load for ID:', apiKeyId, 'refresh:', refresh);
    this.dashboardError = null;
    this.dashboardLoading = true;

    this.apiKeyService.getApiKeyDashboard(apiKeyId, refresh).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (dashboardData) => {
        console.log('✅ API key dashboard data loaded successfully:', dashboardData);
        this.apiKeyDashboard = this.apiKeyService.transformApiKeyDashboard(dashboardData);
        this.dashboardLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('❌ Error loading API key dashboard:', error);
        this.dashboardError = this.getErrorMessage(error);
        this.dashboardLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Refresh API key dashboard data (always real-time)
   */
  refreshDashboard(): void {
    if (this.selectedApiKey) {
      console.log('🔄 Refreshing dashboard data for API key:', this.selectedApiKey.id);
      this.loadApiKeyDashboard(this.selectedApiKey.id, true);
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: { status?: number; error?: { message?: string } }): string {
    if (error?.status === 401) {
      return 'Authentication required. Please log in again.';
    }
    if (error?.status === 403) {
      return 'Access denied. You do not have permission to view this data.';
    }
    if (error?.status === 404) {
      return 'API key dashboard data not found.';
    }
    if (error?.status === 500) {
      return 'Server error. Please try again later.';
    }
    if (error?.error?.message) {
      return error.error.message;
    }
    return 'Failed to load dashboard data. Please try again.';
  }

  /**
   * Get environment display name
   */
  getEnvironmentDisplayName(environment: string): string {
    switch (environment) {
      case 'production':
        return 'Production';
      case 'development':
        return 'Development';
      case 'testing':
        return 'Testing';
      default:
        return 'Production';
    }
  }

  /**
   * Get environment card class
   */
  getEnvironmentCardClass(environment: string): string {
    switch (environment) {
      case 'production':
        return 'border-success';
      case 'development':
        return 'border-info';
      case 'testing':
        return 'border-warning';
      default:
        return 'border-success';
    }
  }

  /**
   * Get environment icon
   */
  getEnvironmentIcon(environment: string): string {
    switch (environment) {
      case 'production':
        return 'bi-shield-check';
      case 'development':
        return 'bi-code-slash';
      case 'testing':
        return 'bi-bug';
      default:
        return 'bi-shield-check';
    }
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'badge bg-success';
      case 'SUSPENDED':
        return 'badge bg-warning';
      case 'EXPIRED':
        return 'badge bg-warning';
      case 'REVOKED':
        return 'badge bg-danger';
      case 'production':
        return 'badge bg-success';
      case 'development':
        return 'badge bg-info';
      case 'testing':
        return 'badge bg-secondary';
      default:
        return 'badge bg-secondary';
    }
  }

  /**
   * Get tier display name
   */
  getTierDisplayName(tier: string): string {
    switch (tier) {
      case 'FREE_TIER':
        return 'FREE';
      case 'PRO_TIER':
        return 'PRO';
      case 'BUSINESS_TIER':
        return 'BUSINESS';
      case 'BASIC':
      case 'basic':
        return 'Basic';
      case 'STANDARD':
      case 'standard':
        return 'Standard';
      case 'PREMIUM':
      case 'premium':
        return 'Premium';
      case 'ENTERPRISE':
      case 'enterprise':
        return 'Enterprise';
      default:
        return tier || 'FREE';
    }
  }

  /**
   * Get daily usage percentage (today only)
   */
  getUsagePercentage(apiKey: ApiKey): number {
    // Use real API dashboard data if available for today's usage
    if (this.apiKeyDashboard?.usage?.requestsToday !== undefined) {
      const dailyLimit = this.getDailyLimit();
      if (dailyLimit === 0) return 0;
      return Math.min(Math.round((this.apiKeyDashboard.usage.requestsToday / dailyLimit) * 100), 100);
    }
    
    // Return 0 if no data available
    return 0;
  }

  /**
   * Get daily limit (calculated from monthly quota)
   */
  getDailyLimit(): number {
    // Use real API dashboard data if available
    if (this.apiKeyDashboard?.monthlyMetrics?.quotaLimit) {
      // Assume 30 days per month for daily limit calculation
      return Math.round(this.apiKeyDashboard.monthlyMetrics.quotaLimit / 30);
    }
    
    // Return 0 if no data available
    return 0;
  }

  /**
   * Get today's requests count
   */
  getTodaysRequests(): number {
    // Use real API dashboard data if available
    if (this.apiKeyDashboard?.usage?.requestsToday !== undefined) {
      return this.apiKeyDashboard.usage.requestsToday;
    }
    
    // Return 0 if no data available
    return 0;
  }

  /**
   * Get remaining requests for today
   */
  getRemainingToday(): number {
    const dailyLimit = this.getDailyLimit();
    const todaysRequests = this.getTodaysRequests();
    
    if (dailyLimit === 0) return 0;
    return Math.max(dailyLimit - todaysRequests, 0);
  }

  /**
   * Get total requests for current month
   */
  getTotalRequestsCurrentMonth(): number {
    // Use real API dashboard data if available
    if (this.apiKeyDashboard?.monthlyMetrics?.totalCalls !== undefined) {
      return this.apiKeyDashboard.monthlyMetrics.totalCalls;
    }
    
    // Return 0 if no data available
    return 0;
  }

  /**
   * Get monthly usage percentage
   */
  getMonthlyUsagePercentage(): number {
    // Use real API dashboard data if available
    if (this.apiKeyDashboard?.monthlyMetrics?.quotaLimit && this.apiKeyDashboard?.monthlyMetrics?.totalCalls !== undefined) {
      const percentage = Math.round((this.apiKeyDashboard.monthlyMetrics.totalCalls / this.apiKeyDashboard.monthlyMetrics.quotaLimit) * 100);
      return Math.min(percentage, 100);
    }
    
    // Fallback calculation
    return 0;
  }

  /**
   * Get monthly quota limit
   */
  getMonthlyQuotaLimit(): number {
    // Use real API dashboard data if available
    if (this.apiKeyDashboard?.monthlyMetrics?.quotaLimit) {
      return this.apiKeyDashboard.monthlyMetrics.quotaLimit;
    }
    
    // Return 0 if no data available
    return 0;
  }

  /**
   * Get remaining monthly quota
   */
  getRemainingMonthlyQuota(): number {
    // Use real API dashboard data if available
    if (this.apiKeyDashboard?.monthlyMetrics?.remainingQuota !== undefined) {
      return this.apiKeyDashboard.monthlyMetrics.remainingQuota;
    }
    
    // Return 0 if no data available
    return 0;
  }

  /**
   * Get yesterday's requests count
   */
  getYesterdaysRequests(): number {
    // Use real API dashboard data if available
    if (this.apiKeyDashboard?.usage?.requestsYesterday !== undefined) {
      return this.apiKeyDashboard.usage.requestsYesterday;
    }
    
    // Return 0 if no data available
    return 0;
  }

  /**
   * Get today vs yesterday change percentage
   */
  getTodayVsYesterdayChange(): number {
    // Use real API dashboard data if available
    if (this.apiKeyDashboard?.todayVsYesterdayChange !== undefined) {
      return this.apiKeyDashboard.todayVsYesterdayChange;
    }
    
    // Return 0 if no data available
    return 0;
  }

  /**
   * Get pending requests count
   */
  getPendingRequests(): number {
    // Use real API dashboard data if available
    if (this.apiKeyDashboard?.pendingRequests !== undefined) {
      return this.apiKeyDashboard.pendingRequests;
    }
    
    return 0;
  }

  /**
   * Get trend direction for today vs yesterday
   */
  getTrendDirection(): { direction: string, class: string, icon: string } {
    const change = this.getTodayVsYesterdayChange();
    
    if (change > 0) {
      return { direction: 'up', class: 'text-success', icon: 'bi-arrow-up' };
    } else if (change < 0) {
      return { direction: 'down', class: 'text-danger', icon: 'bi-arrow-down' };
    } else {
      return { direction: 'neutral', class: 'text-secondary', icon: 'bi-dash' };
    }
  }

  /**
   * Get API key status
   */
  getApiKeyStatus(): string {
    return this.apiKeyDashboard?.status || this.selectedApiKey?.status || 'ACTIVE';
  }

  /**
   * Get last used date/time
   */
  getLastUsedDateTime(): string {
    const dashboardLastUsed = this.apiKeyDashboard?.usage?.lastUsed;
    const apiKeyLastUsed = this.selectedApiKey?.usage?.lastUsed;
    const createdAt = this.selectedApiKey?.createdAt;
    
    return dashboardLastUsed || apiKeyLastUsed || createdAt || 'Never';
  }

  /**
   * Format number with commas
   */
  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  }

  /**
   * Format date and time
   */
  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  }

  /**
   * Get current date formatted
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }

  async copyApiKey(apiKey: ApiKey): Promise<void> {
    try {
      let keyToCopy: string;
      let isDecryptedKey = false;

      // PRIORITY 1: Try to get the full decrypted key
      if (this.apiKeyService.canDecryptApiKey(apiKey) && apiKey.encryptedKeyValue) {
        try {
          const decryptedKey = await this.apiKeyService.decryptApiKey(apiKey.encryptedKeyValue);
          if (decryptedKey && decryptedKey.trim()) {
            keyToCopy = decryptedKey;
            isDecryptedKey = true;
          } else {
            throw new Error('Decryption returned empty result');
          }
        } catch (decryptError) {
          console.warn('Failed to decrypt key for copy:', decryptError);
          keyToCopy = apiKey.keyPreview || apiKey.maskedKey || 'API key not available';
        }
      } else {
        // FALLBACK: Use masked/preview key
        keyToCopy = apiKey.keyPreview || apiKey.maskedKey || 'API key not available';
      }

      // Copy to clipboard using our improved service
      const success = await this.clipboardService.copyToClipboard(
        keyToCopy, 
        isDecryptedKey ? 'Full API key copied to clipboard' : 'API key copied to clipboard'
      );
      
      // Auto-clear clipboard after 30 seconds for security (only for decrypted keys)
      if (success && isDecryptedKey) {
        setTimeout(() => {
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText('').catch(() => {
              // Ignore errors when clearing clipboard
            });
          }
        }, 30000);
      }
      
    } catch (err) {
      console.error('Failed to copy API key:', err);
      this.errorHandler.showWarning('Failed to copy API key to clipboard');
    }
  }

  /**
   * Toggle showing full API key (decrypt if needed) - ALWAYS show decrypted version
   */
  async toggleShowFullKey(apiKey: ApiKey): Promise<void> {
    const keyId = apiKey.id;
    
    // If already showing, hide it
    if (this.showingFullKey[keyId]) {
      this.showingFullKey[keyId] = false;
      delete this.decryptedKeys[keyId];
      this.cdr.markForCheck();
      return;
    }

    // Check if we can decrypt this key
    if (!this.apiKeyService.canDecryptApiKey(apiKey)) {
      // Get detailed environment information for better error messages
      const envInfo = this.apiKeyService.getDecryptionEnvironmentInfo();
      let errorMessage = 'Unable to show full API key.';
      
      if (!envInfo.compatible) {
        errorMessage += ` ${envInfo.reason}`;
        console.log('Decryption environment check failed:', envInfo);
        console.log('Environment details:', envInfo.details);
      } else if (!apiKey.encryptedKeyValue) {
        errorMessage = 'Full API key is not available for this key.';
      } else {
        errorMessage += ' Please ensure you are logged in.';
      }
      
      this.errorHandler.showWarning(errorMessage);
      return;
    }

    if (!apiKey.encryptedKeyValue) {
      this.errorHandler.showWarning('Full API key is not available for this key.');
      return;
    }

    // Start decryption
    this.decryptingKeys[keyId] = true;
    this.cdr.markForCheck();

    try {
      const decryptedKey = await this.apiKeyService.decryptApiKey(apiKey.encryptedKeyValue);
      
      if (decryptedKey && decryptedKey.trim()) {
        this.decryptedKeys[keyId] = decryptedKey;
        this.showingFullKey[keyId] = true;
        this.errorHandler.showSuccess('Full API key is now visible');
        
        // Auto-hide after 2 minutes for security
        setTimeout(() => {
          if (this.showingFullKey[keyId]) {
            this.showingFullKey[keyId] = false;
            delete this.decryptedKeys[keyId];
            this.cdr.markForCheck();
          }
        }, 120000);
      } else {
        this.errorHandler.showError('Unable to decrypt API key. The key may be corrupted or you may not have permission.');
      }
    } catch (error) {
      console.error('Error during decryption for key:', keyId, error);
      this.errorHandler.showError('Failed to decrypt API key. Please try again or contact support.');
    } finally {
      this.decryptingKeys[keyId] = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Get the display key (masked or decrypted)
   */
  getDisplayKey(apiKey: ApiKey): string {
    const keyId = apiKey.id;
    if (this.showingFullKey[keyId] && this.decryptedKeys[keyId]) {
      return this.decryptedKeys[keyId];
    }
    return apiKey.keyPreview || apiKey.maskedKey;
  }

  /**
   * Check if we can show the full key for this API key
   */
  canShowFullKey(apiKey: ApiKey): boolean {
    return this.apiKeyService.canDecryptApiKey(apiKey);
  }

  /**
   * Check if we're currently showing the full key
   */
  isShowingFullKey(apiKey: ApiKey): boolean {
    return !!this.showingFullKey[apiKey.id];
  }

  /**
   * Check if we're currently decrypting a key
   */
  isDecryptingKey(apiKey: ApiKey): boolean {
    return !!this.decryptingKeys[apiKey.id];
  }

  /**
   * Regenerate API key
   */
  regenerateApiKey(apiKey: ApiKey): void {
    if (!apiKey || this.regenerating) return;

    this.regenerating = true;
    this.error = null;

    this.apiKeyService.regenerateApiKey(apiKey.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('API key regenerated successfully:', response);
        
        // Check if the backend indicates success
        if (!response.success) {
          this.regenerating = false;
          this.error = response.message || 'Failed to regenerate API key.';
          this.errorHandler.showWarning(this.error);
          this.cdr.markForCheck();
          return;
        }
        
        // Update the selected API key with new information
        if (this.selectedApiKey && this.selectedApiKey.id === apiKey.id) {
          this.selectedApiKey = {
            ...this.selectedApiKey,
            maskedKey: response.keyPreview,
            name: response.name,
            tier: response.rateLimitTier,
            scopes: response.scopes || this.selectedApiKey.scopes,
            status: response.success ? 'ACTIVE' : 'SUSPENDED'
          };
        }

        // Show the new API key in popup
        this.regeneratedApiKey = response.keyValue;
        this.showRegeneratePopup = true;
        this.regenerating = false;
        this.cdr.markForCheck();

        this.errorHandler.showSuccess('API key regenerated successfully!');
      },
      error: (error) => {
        console.error('Error regenerating API key:', error);
        this.regenerating = false;
        
        let errorMessage = 'Failed to regenerate API key.';
        if (error.status === 404) {
          errorMessage = 'API key not found.';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized. Please check your authentication.';
        } else if (error.status === 403) {
          errorMessage = 'Insufficient permissions to regenerate API key.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.error = errorMessage;
        this.errorHandler.showWarning(errorMessage);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Show revoke confirmation dialog
   */
  showRevokeConfirmationDialog(): void {
    this.showRevokeConfirmation = true;
    this.cdr.markForCheck();
  }

  /**
   * Hide revoke confirmation dialog
   */
  hideRevokeConfirmationDialog(): void {
    this.showRevokeConfirmation = false;
    this.cdr.markForCheck();
  }

  /**
   * Revoke API key
   */
  revokeApiKey(apiKey: ApiKey): void {
    if (!apiKey || this.revoking) return;

    this.revoking = true;
    this.error = null;
    this.showRevokeConfirmation = false;

    this.apiKeyService.revokeApiKey(apiKey.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('API key revoked successfully:', response);
        
        // Check if the backend indicates success
        if (!response.success) {
          this.revoking = false;
          this.error = response.message || 'Failed to revoke API key.';
          this.errorHandler.showWarning(this.error);
          this.cdr.markForCheck();
          return;
        }
        
        // Update the selected API key status to REVOKED
        if (this.selectedApiKey && this.selectedApiKey.id === apiKey.id) {
          this.selectedApiKey = {
            ...this.selectedApiKey,
            status: 'REVOKED',
            revokedAt: new Date().toISOString()
          };
        }

        this.revoking = false;
        this.cdr.markForCheck();

        this.errorHandler.showSuccess('API key revoked successfully!');
      },
      error: (error) => {
        console.error('Error revoking API key:', error);
        this.revoking = false;
        
        let errorMessage = 'Failed to revoke API key.';
        if (error.status === 404) {
          errorMessage = 'API key not found.';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized. Please check your authentication.';
        } else if (error.status === 403) {
          errorMessage = 'Insufficient permissions to revoke API key.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.error = errorMessage;
        this.errorHandler.showWarning(errorMessage);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Generate masked key for display (helper method)
   */
  private generateMaskedKey(prefix?: string, name?: string): string {
    const prefixPart = prefix || 'rivo';
    const namePart = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 4) : 'key';
    return `${prefixPart}_${namePart}_${'*'.repeat(24)}`;
  }

  /**
   * Close regenerate popup
   */
  closeRegeneratePopup(): void {
    this.showRegeneratePopup = false;
    this.regeneratedApiKey = null;
    this.cdr.markForCheck();
  }

  /**
   * Copy regenerated API key to clipboard
   */
  async copyRegeneratedApiKey(): Promise<void> {
    if (!this.regeneratedApiKey) {
      this.errorHandler.showWarning('No API key to copy');
      return;
    }

    await this.clipboardService.copyToClipboard(
      this.regeneratedApiKey, 
      'New API key copied to clipboard'
    );
  }
  /**
   * Navigate back to dashboard
   */
  goBack(): void {
    this.router.navigate(['/brands/api-dashboard']);
  }

  /**
   * Navigate to API key details
   */
  viewApiKeyDetails(apiKey: ApiKey): void {
    this.router.navigate(['/brands/api-dashboard/api-keys', apiKey.id]);
  }

  /**
   * TrackBy function for API keys
   */
  trackByApiKeyId(index: number, apiKey: ApiKey): string {
    return apiKey.id;
  }

  /**
   * TrackBy function for environments
   */
  trackByEnvironment(index: number, environment: string): string {
    return environment;
  }

  // Cache the grouped API keys to avoid recalculation
  private _cachedGroupedKeys: Record<string, ApiKey[]> | null = null;
  private _lastDomainApiKeys: ApiKey[] = [];

  /**
   * Get API keys grouped by environment (cached)
   */
  getApiKeysByEnvironment(): Record<string, ApiKey[]> {
    // Only recalculate if the domain API keys have changed
    if (this._cachedGroupedKeys === null || this._lastDomainApiKeys !== this.domainApiKeys) {
      const grouped: Record<string, ApiKey[]> = {
        'production': [],
        'development': [],
        'testing': []
      };

      this.domainApiKeys.forEach(apiKey => {
        const env = apiKey.environment || 'production';
        if (grouped[env]) {
          grouped[env].push(apiKey);
        } else {
          grouped['production'].push(apiKey);
        }
      });

      this._cachedGroupedKeys = grouped;
      this._lastDomainApiKeys = this.domainApiKeys;
    }

    return this._cachedGroupedKeys;
  }

  /**
   * Check if API key is effectively revoked (either REVOKED or SUSPENDED)
   */
  isApiKeyRevoked(apiKey: ApiKey): boolean {
    return apiKey.status === 'REVOKED' || apiKey.status === 'SUSPENDED';
  }
}