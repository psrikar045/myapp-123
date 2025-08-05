import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { ApiKeyService } from '../../services/api-key.service';
import { ApiKey, RegenerateApiKeyResponse } from '../../models/api-key.model';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';

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
  domain: string = '';
  
  // UI state
  loading = true;
  error: string | null = null;
  
  // Regenerate popup state
  showRegeneratePopup = false;
  regeneratedApiKey: string | null = null;
  regenerating = false;
  
  // Revoke state
  revoking = false;
  showRevokeConfirmation = false;
  
  // Show key state
  showingFullKey: { [keyId: string]: boolean } = {};
  decryptedKeys: { [keyId: string]: string } = {};
  decryptingKeys: { [keyId: string]: boolean } = {};
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiKeyService: ApiKeyService,
    private errorHandler: ErrorHandlerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const apiKeyId = params['id'];
      if (apiKeyId) {
        this.loadApiKeyDetails(apiKeyId);
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
   * Load API key details and related domain keys
   */
  private loadApiKeyDetails(apiKeyId: string): void {
    this.loading = true;
    this.error = null;

    // Load all keys first (instant with no delay)
    this.apiKeyService.getApiKeys().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (allKeys) => {
        // Find the selected API key
        this.selectedApiKey = allKeys.keys.find(key => key.id === apiKeyId) || null;
        
        if (!this.selectedApiKey) {
          this.error = 'API key not found.';
          this.loading = false;
          this.cdr.markForCheck();
          return;
        }

        // Extract domain from the selected API key
        this.domain = this.extractDomainFromApiKey(this.selectedApiKey);
        
        // For now, we'll show only the selected API key, but keep the structure
        // to potentially show related domain keys in the future
        this.domainApiKeys = [this.selectedApiKey];
        
        // Clear cache to force recalculation
        this._cachedGroupedKeys = null;
        
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading API keys:', error);
        this.error = 'Failed to load API key details.';
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
        return 'badge bg-secondary';
      case 'EXPIRED':
        return 'badge bg-warning';
      case 'REVOKED':
        return 'badge bg-danger';
      case 'production':
        return 'badge bg-success';
      case 'development':
        return 'badge bg-info';
      case 'testing':
        return 'badge bg-warning';
      default:
        return 'badge bg-secondary';
    }
  }

  /**
   * Get usage percentage
   */
  getUsagePercentage(apiKey: ApiKey): number {
    if (!apiKey.usage?.requestsToday) return 0;
    const total = 13333; // Mock total limit
    return Math.min((apiKey.usage.requestsToday / total) * 100, 100);
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
    return new Date(dateString).toLocaleDateString();
  }

  /**
   * Get current date formatted
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }

  /**
   * Copy API key to clipboard (decrypted version if available)
   */
  async copyApiKey(apiKey: ApiKey): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      this.errorHandler.showWarning('Clipboard not available');
      return;
    }

    try {
      let keyToCopy = apiKey.keyPreview || apiKey.maskedKey;

      // If we can decrypt the key, use the full key
      if (this.apiKeyService.canDecryptApiKey(apiKey) && apiKey.encryptedKeyValue) {
        const decryptedKey = await this.apiKeyService.decryptApiKey(apiKey.encryptedKeyValue);
        if (decryptedKey) {
          keyToCopy = decryptedKey;
        }
      }

      await navigator.clipboard.writeText(keyToCopy);
      this.errorHandler.showSuccess('API key copied to clipboard');
      
      // Auto-clear clipboard after 30 seconds for security
      setTimeout(() => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText('').catch(() => {
            // Ignore errors when clearing clipboard
          });
        }
      }, 30000);
      
    } catch (err) {
      console.error('Failed to copy API key:', err);
      this.errorHandler.showWarning('Failed to copy API key to clipboard');
    }
  }

  /**
   * Toggle showing full API key (decrypt if needed)
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
    if (!this.apiKeyService.canDecryptApiKey(apiKey) || !apiKey.encryptedKeyValue) {
      this.errorHandler.showWarning('Cannot decrypt this API key');
      return;
    }

    // Start decryption
    this.decryptingKeys[keyId] = true;
    this.cdr.markForCheck();

    try {
      const decryptedKey = await this.apiKeyService.decryptApiKey(apiKey.encryptedKeyValue);
      
      if (decryptedKey) {
        this.decryptedKeys[keyId] = decryptedKey;
        this.showingFullKey[keyId] = true;
        this.errorHandler.showSuccess('API key decrypted successfully');
        
        // Auto-hide after 2 minutes for security
        setTimeout(() => {
          if (this.showingFullKey[keyId]) {
            this.showingFullKey[keyId] = false;
            delete this.decryptedKeys[keyId];
            this.cdr.markForCheck();
          }
        }, 120000);
      } else {
        this.errorHandler.showError('Failed to decrypt API key');
      }
    } catch (error) {
      console.error('Error decrypting API key:', error);
      this.errorHandler.showError('Failed to decrypt API key');
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
  copyRegeneratedApiKey(): void {
    if (this.regeneratedApiKey && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.regeneratedApiKey).then(() => {
        this.errorHandler.showSuccess('New API key copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy regenerated API key:', err);
        this.errorHandler.showWarning('Failed to copy API key to clipboard');
      });
    }
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
  private _cachedGroupedKeys: { [key: string]: ApiKey[] } | null = null;
  private _lastDomainApiKeys: ApiKey[] = [];

  /**
   * Get API keys grouped by environment (cached)
   */
  getApiKeysByEnvironment(): { [key: string]: ApiKey[] } {
    // Only recalculate if the domain API keys have changed
    if (this._cachedGroupedKeys === null || this._lastDomainApiKeys !== this.domainApiKeys) {
      const grouped: { [key: string]: ApiKey[] } = {
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
}