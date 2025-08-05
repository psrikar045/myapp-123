import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

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
  deleting = false;

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
    this.initializeApiKeys();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize API keys - first try to get from route state, then fetch if needed
   */
  private initializeApiKeys(): void {
    this.loading = true;
    this.error = null;

    // First, try to get data from route state (passed from dashboard)
    const navigation = this.router.getCurrentNavigation();
    const routeState = navigation?.extras?.state || history.state;
    
    if (routeState && routeState.apiKeys && routeState.fromDashboard) {
      // Use data passed from dashboard via route state
      this.apiKeys = routeState.apiKeys;
      this.initializeFilters();
      this.applyFilters();
      this.loading = false;
      console.log('Using API keys data from dashboard:', this.apiKeys.length, 'keys');
    } else {
      // No data available from route state, fetch from API
      console.log('No data from dashboard, fetching from API');
      this.loadApiKeys();
    }
  }

  /**
   * Load all API keys from API
   */
  private loadApiKeys(): void {
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
    // Extract unique domains from API keys
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
   * Show delete confirmation dialog using SweetAlert2
   */
  showDeleteConfirmationDialog(apiKey: ApiKey): void {
    if (!apiKey || this.deleting) return;

    Swal.fire({
      title: 'Delete API Key',
      text: `Are you sure you want to delete the API key "${apiKey.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        htmlContainer: 'swal2-content-custom'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteApiKey(apiKey);
      }
    });
  }

  /**
   * Delete API key
   */
  deleteApiKey(apiKey: ApiKey): void {
    if (!apiKey || this.deleting) return;

    this.deleting = true;

    this.apiKeyService.deleteApiKey(apiKey.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('API key deleted successfully:', response);
        
        // Check if the backend indicates success
        if (!response.success) {
          this.deleting = false;
          this.errorHandler.showWarning(response.message || 'Failed to delete API key.');
          return;
        }

        // Remove the deleted API key from the arrays
        this.apiKeys = this.apiKeys.filter(key => key.id !== apiKey.id);
        this.applyFilters();

        this.deleting = false;

        // Show success message
        Swal.fire({
          title: 'Deleted!',
          text: 'API key has been deleted successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('Error deleting API key:', error);
        this.deleting = false;
        
        let errorMessage = 'Failed to delete API key.';
        if (error.status === 404) {
          errorMessage = 'API key not found.';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized. Please check your authentication.';
        } else if (error.status === 403) {
          errorMessage = 'Insufficient permissions to delete API key.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.errorHandler.showWarning(errorMessage);

        // Show error message using SweetAlert2
        Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  /**
   * Get domain name from API key
   */
  getDomainFromApiKey(apiKey: ApiKey): string {
    // First, try to get domain from security settings
    if (apiKey.security?.domainRestrictions?.allowedDomains?.length > 0) {
      return apiKey.security.domainRestrictions.allowedDomains[0];
    }
    
    // Fallback to mock implementation for display purposes
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
        return 'Suspended';
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