import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { ApiKeyService } from '../../services/api-key.service';
import { ErrorHandlerService } from '../../../../../shared/services/error-handler.service';
import { SpinnerService } from '../../../../../core/services/spinner.service';
import { ErrorDisplayComponent } from '../error-display/error-display.component';
import { EditApiKeyComponent } from '../edit-api-key/edit-api-key.component';
import { ApiKey } from '../../models/api-key.model';

@Component({
  selector: 'app-api-keys-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorDisplayComponent, EditApiKeyComponent],
  templateUrl: './api-keys-list.component.html',
  styleUrls: ['./api-keys-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApiKeysListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  apiKeys: ApiKey[] = [];
  filteredApiKeys: ApiKey[] = [];
  
  // Filter properties
  domainFilter = 'all';
  tierFilter = 'all';
  environmentFilter = 'all';
  statusFilter = 'all';
  
  // UI state
  loading = true;
  error: string | null = null;
  deleting = false;
  
  // Edit modal state
  showEditModal = false;
  editingApiKey: ApiKey | null = null;

  // Available filter options
  availableDomains: string[] = [];
  availableTiers: string[] = [];
  availableEnvironments: string[] = ['development', 'testing', 'production'];
  availableStatuses: string[] = ['ACTIVE', 'REVOKED'];
//'EXPIRED', , 'SUSPENDED', 'ALL'
  constructor(
    private apiKeyService: ApiKeyService,
    private errorHandler: ErrorHandlerService,
    private spinnerService: SpinnerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to API keys updates from the service
    this.apiKeyService.apiKeys$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(apiKeys => {
      this.apiKeys = apiKeys;
      this.initializeFilters();
      this.applyFilters();
      this.cdr.markForCheck();
    });
    
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

    this.apiKeyService.ensureApiKeysLoaded()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.apiKeys = response.keys;
          this.initializeFilters();
          this.applyFilters();
          this.loading = false;
          this.spinnerService.hide();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading API keys:', error);
          this.error = 'Failed to load API keys. Please try again.';
          this.loading = false;
          this.spinnerService.hide();
          this.cdr.markForCheck();
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
    this.cdr.markForCheck();
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
    this.spinnerService.show();

    this.apiKeyService.ensureApiKeysLoaded(true) // Force refresh
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.apiKeys = response.keys;
          this.initializeFilters();
          this.applyFilters();
          this.loading = false;
          this.spinnerService.hide();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error refreshing API keys:', error);
          this.error = 'Failed to refresh API keys. Please try again.';
          this.loading = false;
          this.spinnerService.hide();
          this.cdr.markForCheck();
        }
      });
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
    this.editingApiKey = apiKey;
    this.showEditModal = true;
  }

  /**
   * Handle edit modal close
   */
  onEditModalClose(): void {
    this.showEditModal = false;
    this.editingApiKey = null;
  }

  /**
   * Handle edit modal save
   */
  onEditModalSave(updatedApiKey: ApiKey): void {
    // Don't update local arrays directly here
    // The service's updateApiKey method already handles updating the BehaviorSubject
    // which will automatically update all subscribed components through the apiKeys$ subscription
    
    // Refresh filter options in case tier or domain changed
    // Use setTimeout to ensure the subscription has processed the update first
    setTimeout(() => {
      this.initializeFilters();
      this.applyFilters();
    }, 0);
  }

  /**
   * Show delete confirmation dialog using SweetAlert2
   */
  showDeleteConfirmationDialog(apiKey: ApiKey): void {
    if (!apiKey || this.deleting) return;

    // Prevent delete for primary/default key
    if (apiKey.defaultKey === true) {
      this.errorHandler.showWarning('Primary API key cannot be deleted.');
      return;
    }

    Swal.fire({
      title: 'Delete API Key',
      text: `Are you sure you want to delete the API key "${apiKey.name}"? `,
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

    // Prevent delete for primary/default key (double safety)
    if (apiKey.defaultKey === true) {
      this.errorHandler.showWarning('Primary API key cannot be deleted.');
      return;
    }

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

        // Don't update local arrays directly here
        // The service's deleteApiKey method already handles updating the BehaviorSubject
        // which will automatically update all subscribed components through the apiKeys$ subscription

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
      case 'testing':
        return 'Testing';
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
        return 'Revoked'; // Treat suspended as revoked
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
        return 'badge bg-danger'; // Treat suspended as revoked (danger)
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
    switch (tier) {
      case 'FREE_TIER':
        return 100;
      case 'PRO_TIER':
        return 10000;
      case 'BUSINESS_TIER':
        return 1000000;
      case 'BASIC':
      case 'basic':
        return 1000;
      case 'STANDARD':
      case 'standard':
        return 10000;
      case 'PREMIUM':
      case 'premium':
        return 100000;
      case 'ENTERPRISE':
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

  /**
   * Check if API key is effectively revoked (either REVOKED or SUSPENDED)
   */
  isApiKeyRevoked(apiKey: ApiKey): boolean {
    return apiKey.status === 'REVOKED' || apiKey.status === 'SUSPENDED';
  }
}