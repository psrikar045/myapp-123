import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiKeyService } from '../../services/api-key.service';
import { ErrorHandlerService } from '../../../../../shared/services/error-handler.service';
import { SpinnerService } from '../../../../../core/services/spinner.service';
import { ErrorDisplayComponent } from '../error-display/error-display.component';
import { ApiKey } from '../../models/api-key.model';

@Component({
  selector: 'app-api-keys-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorDisplayComponent],
  templateUrl: './api-keys-list.component.html',
  styleUrls: ['./api-keys-list.component.scss']
})
export class ApiKeysListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  apiKeys: ApiKey[] = [];
  filteredApiKeys: ApiKey[] = [];
  
  // Filter properties
  domainFilter: string = 'all';
  tierFilter: string = 'all';
  environmentFilter: string = 'all';
  statusFilter: string = 'all';
  
  // UI state
  loading = true;
  error: string | null = null;

  // Available filter options
  availableDomains: string[] = [];
  availableTiers: string[] = [];
  availableEnvironments: string[] = ['development', 'staging', 'production'];
  availableStatuses: string[] = ['ACTIVE', 'EXPIRED', 'REVOKED', 'SUSPENDED'];

  constructor(
    private apiKeyService: ApiKeyService,
    private errorHandler: ErrorHandlerService,
    private spinnerService: SpinnerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadApiKeys();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all API keys
   */
  private loadApiKeys(): void {
    this.loading = true;
    this.error = null;
    this.spinnerService.show();

    this.apiKeyService.getApiKeys()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.apiKeys = response.keys;
          this.initializeFilters();
          this.applyFilters();
          this.loading = false;
          this.spinnerService.hide();
        },
        error: (error) => {
          console.error('Error loading API keys:', error);
          this.error = 'Failed to load API keys. Please try again.';
          this.loading = false;
          this.spinnerService.hide();
        }
      });
  }

  /**
   * Initialize filter options based on loaded data
   */
  private initializeFilters(): void {
    // Extract unique domains
    this.availableDomains = [...new Set(this.apiKeys.map(key => this.getDomainFromApiKey(key)))];
    
    // Extract unique tiers
    this.availableTiers = [...new Set(this.apiKeys.map(key => key.tier))];
  }

  /**
   * Apply all filters to the API keys list
   */
  applyFilters(): void {
    this.filteredApiKeys = this.apiKeys.filter(apiKey => {
      const matchesDomain = this.domainFilter === 'all' || 
        this.getDomainFromApiKey(apiKey) === this.domainFilter;
      
      const matchesTier = this.tierFilter === 'all' || 
        apiKey.tier === this.tierFilter;
      
      const matchesEnvironment = this.environmentFilter === 'all' || 
        apiKey.environment === this.environmentFilter;
      
      const matchesStatus = this.statusFilter === 'all' || 
        apiKey.status === this.statusFilter;
      
      return matchesDomain && matchesTier && matchesEnvironment && matchesStatus;
    });
  }

  /**
   * Handle filter changes
   */
  onFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.domainFilter = 'all';
    this.tierFilter = 'all';
    this.environmentFilter = 'all';
    this.statusFilter = 'all';
    this.applyFilters();
  }

  /**
   * Refresh the API keys list
   */
  refreshApiKeys(): void {
    this.loadApiKeys();
  }

  /**
   * Navigate to create new API key
   */
  createNewApiKey(): void {
    this.router.navigate(['/brands/api-dashboard/api-keys/create']);
  }

  /**
   * Navigate back to dashboard
   */
  goBackToDashboard(): void {
    this.router.navigate(['/brands/api-dashboard']);
  }

  /**
   * View API key details
   */
  viewApiKeyDetails(apiKey: ApiKey): void {
    this.router.navigate(['/brands/api-dashboard/api-keys', apiKey.id]);
  }

  /**
   * Edit API key
   */
  editApiKey(apiKey: ApiKey): void {
    // Navigate to edit page when implemented
    this.errorHandler.showInfo('Edit functionality coming soon');
  }

  /**
   * Delete/Revoke API key
   */
  deleteApiKey(apiKey: ApiKey): void {
    if (confirm(`Are you sure you want to revoke the API key "${apiKey.name}"? This action cannot be undone.`)) {
      this.apiKeyService.revokeApiKey(apiKey.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Update the local data
            const index = this.apiKeys.findIndex(key => key.id === apiKey.id);
            if (index !== -1) {
              this.apiKeys[index].status = 'REVOKED';
            }
            this.applyFilters();
            this.errorHandler.showSuccess('API key revoked successfully');
          },
          error: (error) => {
            console.error('Error revoking API key:', error);
            this.errorHandler.showWarning(error.error?.message || 'Failed to revoke API key');
          }
        });
    }
  }

  /**
   * Get domain name from API key (mock implementation)
   */
  getDomainFromApiKey(apiKey: ApiKey): string {
    const domains = [
      'example.com',
      'example.org',
      'example.net',
      'example.io',
      'example.co',
      'example.us',
      'example.ca',
      'example.uk',
      'example.au',
      'example.de'
    ];
    
    const index = Math.abs(apiKey.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % domains.length;
    return domains[index];
  }

  /**
   * Get environment display name
   */
  getEnvironmentDisplayName(environment?: string): string {
    switch (environment) {
      case 'production':
        return 'Production';
      case 'staging':
        return 'Staging';
      case 'development':
        return 'Development';
      default:
        return 'Production';
    }
  }

  /**
   * Get status display name
   */
  getStatusDisplayName(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'SUSPENDED':
        return 'Expired';
      case 'EXPIRED':
        return 'Expired';
      case 'REVOKED':
        return 'Revoked';
      default:
        return 'Unknown';
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
      default:
        return 'badge bg-secondary';
    }
  }

  /**
   * Get tier display name
   */
  getTierDisplayName(tier: string): string {
    switch (tier?.toLowerCase()) {
      case 'basic':
        return 'Basic';
      case 'standard':
        return 'Standard';
      case 'premium':
        return 'Premium';
      case 'enterprise':
        return 'Enterprise';
      default:
        return tier || 'Standard';
    }
  }

  /**
   * Get usage percentage
   */
  getUsagePercentage(apiKey: ApiKey): number {
    if (!apiKey.usage?.requestsToday) return 0;
    const total = this.getTotalRequestsLimit(apiKey.tier);
    return Math.min((apiKey.usage.requestsToday / total) * 100, 100);
  }

  /**
   * Get total requests limit based on tier
   */
  private getTotalRequestsLimit(tier: string): number {
    switch (tier?.toLowerCase()) {
      case 'basic':
        return 1000;
      case 'standard':
        return 10000;
      case 'premium':
        return 100000;
      case 'enterprise':
        return 1000000;
      default:
        return 10000;
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Format number with commas
   */
  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  /**
   * TrackBy function for API keys
   */
  trackByApiKeyId(index: number, apiKey: ApiKey): string {
    return apiKey.id;
  }
}