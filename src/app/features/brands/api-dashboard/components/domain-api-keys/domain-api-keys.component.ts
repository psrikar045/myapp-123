import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { ApiKeyService } from '../../services/api-key.service';
import { ApiKey } from '../../models/api-key.model';
import { ErrorHandlerService } from '../../../../../shared/services/error-handler.service';

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
   * Copy API key to clipboard
   */
  copyApiKey(apiKey: ApiKey): void {
    if (apiKey.maskedKey && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(apiKey.maskedKey).then(() => {
        this.errorHandler.showSuccess('API key copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy API key:', err);
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