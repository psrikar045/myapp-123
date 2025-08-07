import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, forkJoin, Observable, filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ApiDashboardService } from './services/api-dashboard.service';
import { ApiKeyService } from './services/api-key.service';
import { AppThemeService } from '../../../core/services/app-theme.service';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { ClipboardService } from '../../../shared/services/clipboard.service';

import { ErrorDisplayComponent } from './components/error-display/error-display.component';
import { EditApiKeyComponent } from './components/edit-api-key/edit-api-key.component';
import { ApiDashboardData, DashboardStats, RecentProject } from './models/dashboard.model';
import { ApiKey } from './models/api-key.model';

@Component({
  selector: 'app-api-dashboard',
  standalone: true,
  imports: [CommonModule, ErrorDisplayComponent, EditApiKeyComponent],
  templateUrl: './api-dashboard.component.html',
  styleUrls: ['./api-dashboard.component.scss']
})
export class ApiDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data properties
  dashboardData: ApiDashboardData | null = null;
  stats: DashboardStats | null = null;
  recentProjects: RecentProject[] = [];
  apiKeys: ApiKey[] = [];
  
  // Master-Detail properties
  selectedApiKey: ApiKey | null = null;
  filteredApiKeys: ApiKey[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';
  
  // UI state
  loading = true;
  error: string | null = null;
  deleting = false;
  
  // Edit modal state
  showEditModal = false;
  editingApiKey: ApiKey | null = null;
  
  // Theme state
  isDarkMode$: any;
  
  // User info
  userName = 'John'; // This should come from auth service
  
  constructor(
    private apiDashboardService: ApiDashboardService,
    private apiKeyService: ApiKeyService,
    private themeService: AppThemeService,
    private errorHandler: ErrorHandlerService,
    private clipboardService: ClipboardService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isDarkMode$ = this.themeService.isDarkMode$;
    
    // Subscribe to API keys updates from the service
    this.apiKeyService.apiKeys$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(apiKeys => {
      this.apiKeys = apiKeys;
      this.initializeApiKeyFilters();
    });
    
    // Listen for navigation end events to detect when returning to dashboard
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      filter((event: NavigationEnd) => {
        // Check if we're navigating TO the dashboard
        const isDashboard = event.url === '/brands/api-dashboard' || 
                          event.url.endsWith('/brands/api-dashboard') || 
                          event.url.includes('/brands/api-dashboard?') ||
                          event.url.includes('/brands/api-dashboard#');
        return isDashboard;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('Dashboard navigation detected, refreshing API keys...');
      // Small delay to ensure component is fully loaded
      setTimeout(() => {
        this.apiKeyService.ensureApiKeysLoaded(true).subscribe({
          next: (data) => {
            console.log('API keys refreshed on dashboard navigation, count:', data.keys.length);
          },
          error: (error) => {
            console.error('Error refreshing API keys on navigation:', error);
          }
        });
      }, 100);
    });
    
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all dashboard data
   */
  private loadDashboardData(refresh: boolean = false): void {
    this.loading = true;
    this.error = null;
    
    // Global spinner will be automatically handled by the loading interceptor
    // No need to manually control it here

    // Load dashboard stats, recent projects, and API keys in parallel
    forkJoin({
      stats: this.apiDashboardService.getDashboardStats(refresh),
      projects: this.apiDashboardService.getRecentProjects(),
      apiKeys: this.apiKeyService.ensureApiKeysLoaded(refresh)
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.recentProjects = data.projects.projects;
        this.apiKeys = data.apiKeys.keys;
        
        // Don't call updateApiKeys here - getApiKeys() already updates the BehaviorSubject
        // this.apiKeyService.updateApiKeys(this.apiKeys);
        
        // Initialize API key filters and selection
        this.initializeApiKeyFilters();
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = this.getErrorMessage(error);
        this.loading = false;
      }
    });
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboard(): void {
    this.loadDashboardData(true); // Force refresh from API
  }

  /**
   * Navigate to create API key form
   */
  createApiKey(): void {
    this.router.navigate(['/brands/api-dashboard/api-keys/create']);
  }

  /**
   * Navigate to API key management
   */
  manageApiKeys(): void {
    this.router.navigate(['/brands/api-dashboard/api-keys/manage']);
  }

  /**
   * Navigate to view all API keys with data
   */
  viewAllApiKeys(): void {
    this.router.navigate(['/brands/api-dashboard/api-keys/list'], {
      state: { 
        apiKeys: this.apiKeys,
        fromDashboard: true 
      }
    });
  }

  /**
   * Navigate to project details
   */
  viewProject(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }

  /**
   * Get status badge class for projects
   */
  getProjectStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'badge bg-success';
      case 'In Review': return 'badge bg-warning';
      case 'Completed': return 'badge bg-primary';
      default: return 'badge bg-secondary';
    }
  }

  /**
   * Get trend icon for stats
   */
  getTrendIcon(trend: 'up' | 'down' | 'neutral'): string {
    switch (trend) {
      case 'up': return 'bi-arrow-up';
      case 'down': return 'bi-arrow-down';
      default: return 'bi-dash';
    }
  }

  /**
   * Get trend color class for stats
   */
  getTrendColorClass(trend: 'up' | 'down' | 'neutral'): string {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-danger';
      default: return 'text-muted';
    }
  }



  /**
   * Get quota progress bar class
   */
  getQuotaProgressClass(percentage: number): string {
    if (percentage >= 90) return 'bg-danger';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-success';
  }

  /**
   * Get API key status badge class
   */
  getApiKeyStatusClass(status: string): string {
    return `badge bg-${this.apiKeyService.getStatusColor(status)}`;
  }

  /**
   * Get rate limit status badge class
   */
  getRateLimitStatusClass(status: string): string {
    return `badge bg-${this.apiKeyService.getRateLimitStatusColor(status)}`;
  }

  /**
   * Check if API key is expiring soon
   */
  isApiKeyExpiringSoon(apiKey: ApiKey): boolean {
    return this.apiKeyService.isExpiringSoon(apiKey);
  }

  /**
   * Format date for display
   */
   formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    
    // Check if date is invalid
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString();
  }

  /**
   * Format number for display with commas
   */
  formatNumber(num: number): string {
    if (num == null || isNaN(num)) return '0';
    return num.toLocaleString();
  }

  /**
   * Get usage percentage for API key
   */
  getUsagePercentage(apiKey: ApiKey): number {
    if (!apiKey.usage.requestsToday || !apiKey.usage.remainingToday) return 0;
    const total = apiKey.usage.requestsToday + apiKey.usage.remainingToday;
    return Math.round((apiKey.usage.requestsToday / total) * 100);
  }

  /**
   * TrackBy function for projects
   */
  trackByProjectId(index: number, project: RecentProject): string {
    return project.id;
  }

  /**
   * TrackBy function for API keys
   */
  trackByApiKeyId(index: number, apiKey: ApiKey): string {
    return apiKey.id;
  }



  /**
   * View detailed API key information
   */
  viewApiKeyDetails(apiKey: ApiKey): void {
    this.router.navigate(['/brands/api-dashboard/api-keys', apiKey.id]);
  }

  /**
   * Handle API key hover effects
   */
  onApiKeyHover(event: Event, isHover: boolean): void {
    const element = event.target as HTMLElement;
    if (isHover) {
      element.style.transform = 'translateY(-2px)';
      element.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    } else {
      element.style.transform = 'translateY(0)';
      element.style.boxShadow = 'none';
    }
  }

  /**
   * Copy API key to clipboard using the clipboard service
   */
  copyApiKey(maskedKey: string): void {
    if (!maskedKey) {
      this.errorHandler.showWarning('No API key to copy');
      return;
    }

    this.clipboardService.copyToClipboard(maskedKey, 'API key copied to clipboard');
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
    // Update the API key in the local arrays
    const index = this.apiKeys.findIndex(key => key.id === updatedApiKey.id);
    if (index !== -1) {
      this.apiKeys[index] = updatedApiKey;
    }

    const filteredIndex = this.filteredApiKeys.findIndex(key => key.id === updatedApiKey.id);
    if (filteredIndex !== -1) {
      this.filteredApiKeys[filteredIndex] = updatedApiKey;
    }

    // Update selected API key if it's the one being edited
    if (this.selectedApiKey && this.selectedApiKey.id === updatedApiKey.id) {
      this.selectedApiKey = updatedApiKey;
    }

    // Note: The service already handles updating the API keys list in updateApiKey method
    // No need to call updateApiKeys here to avoid conflicts
  }

  /**
   * Get usage progress class based on percentage
   */
  getUsageProgressClass(percentage: number): string {
    if (percentage >= 90) return 'bg-danger';
    if (percentage >= 75) return 'bg-warning';
    if (percentage >= 50) return 'bg-info';
    return 'bg-success';
  }

  /**
   * Refresh projects list
   */
  refreshProjects(): void {
    this.loadDashboardData();
  }

  /**
   * View all projects
   */
  viewAllProjects(): void {
    this.router.navigate(['/projects']);
  }

  /**
   * View API analytics
   */
  viewApiAnalytics(): void {
    this.router.navigate(['/brands/api-dashboard/analytics']);
  }

  /**
   * Toggle API key status
   */
  toggleApiKeyStatus(apiKey: ApiKey): void {
    const newStatus = apiKey.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
    this.apiKeyService.updateApiKeyStatus(apiKey.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Don't update the local apiKey.status directly here
          // The service's updateApiKeyStatus method already handles updating the BehaviorSubject
          // which will automatically update all subscribed components
          const statusText = newStatus === 'REVOKED' ? 'revoked' : 'activated';
          this.errorHandler.showSuccess(`API key ${statusText} successfully`);
        },
        error: (error) => {
          console.error('Error updating API key status:', error);
          this.errorHandler.showWarning(error.error?.message || 'Failed to update API key status');
        }
      });
  }

  /**
   * Show delete confirmation dialog using SweetAlert2
   */
  showDeleteConfirmationDialog(apiKey: ApiKey): void {
    if (!apiKey || this.deleting) return;

    Swal.fire({
      title: 'Delete API Key',
      text: 'Are you sure you want to delete this API key?',
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

        // Don't update local arrays directly here
        // The service's deleteApiKey method already handles updating the BehaviorSubject
        // which will automatically update all subscribed components
        
        // Clear selection if the deleted key was selected
        if (this.selectedApiKey && this.selectedApiKey.id === apiKey.id) {
          // Wait for the subscription to update the arrays, then select a new key
          setTimeout(() => {
            this.selectedApiKey = this.filteredApiKeys.length > 0 ? this.filteredApiKeys[0] : null;
          }, 0);
        }

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
   * Regenerate API key
   */
  // regenerateApiKey(apiKey: ApiKey): void {
  //   if (confirm('Are you sure you want to regenerate this API key? The old key will stop working immediately.')) {
  //     this.apiKeyService.regenerateApiKey(apiKey.id)
  //       .pipe(takeUntil(this.destroy$))
  //       .subscribe({
  //         next: (response) => {
  //           // Update the API key with new data from the response
  //           apiKey.id = response.id;
  //           apiKey.name = response.name;
  //           apiKey.key = response.keyValue;
  //           apiKey.maskedKey = response.keyValue.substring(0, 8) + '...' + response.keyValue.substring(response.keyValue.length - 4);
  //           apiKey.environment = response.environment;
  //           apiKey.tier = response.rateLimitTier;
  //           apiKey.scopes = response.scopes ? response.scopes.split(',') : [];
  //           apiKey.status = response.isActive ? 'ACTIVE' : 'SUSPENDED';
  //           apiKey.expiresAt = response.expiresAt;
  //           apiKey.createdAt = response.createdAt;
  //           this.errorHandler.showSuccess('API key regenerated successfully! Make sure to update your applications with the new key.');
  //         },
  //         error: (error) => {
  //           console.error('Error regenerating API key:', error);
  //           this.errorHandler.showWarning(error.error?.message || 'Failed to regenerate API key');
  //         }
  //       });
  //   }
  // }

  // ==================== MASTER-DETAIL FUNCTIONALITY ====================

  /**
   * Select an API key for detailed view
   */
  selectApiKey(apiKey: ApiKey): void {
    this.selectedApiKey = apiKey;
  }

  /**
   * Filter API keys based on search term and status
   */
  filterApiKeys(): void {
    this.filteredApiKeys = this.apiKeys.filter(apiKey => {
      const matchesSearch = !this.searchTerm || 
        apiKey.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        apiKey.maskedKey.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'all' || 
        apiKey.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Auto-select first API key if none selected and we have filtered results
    if (!this.selectedApiKey && this.filteredApiKeys.length > 0) {
      this.selectedApiKey = this.filteredApiKeys[0];
    }
    
    // Clear selection if selected key is not in filtered results
    if (this.selectedApiKey && !this.filteredApiKeys.find(key => key.id === this.selectedApiKey!.id)) {
      this.selectedApiKey = this.filteredApiKeys.length > 0 ? this.filteredApiKeys[0] : null;
    }
  }

  /**
   * Handle search input
   */
  onSearchApiKeys(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filterApiKeys();
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.filterApiKeys();
  }

  /**
   * Navigate to API key details page
   */
  viewApiKeyFullDetails(apiKey: ApiKey): void {
    // Navigate to domain API keys component with the selected API key ID
    this.router.navigate(['/brands/api-dashboard/api-keys', apiKey.id]);
  }

  /**
   * Handle API key details component events
   */
  onApiKeyDetailsViewFullDetails(apiKey: ApiKey): void {
    this.viewApiKeyFullDetails(apiKey);
  }

  onApiKeyDetailsEdit(apiKey: ApiKey): void {
    this.editApiKey(apiKey);
  }

  onApiKeyDetailsRegenerate(apiKey: ApiKey): void {
    // this.regenerateApiKey(apiKey);
  }

  onApiKeyDetailsCopy(maskedKey: string): void {
    this.copyApiKey(maskedKey);
  }

  onApiKeyDetailsToggleStatus(apiKey: ApiKey): void {
    if (apiKey.status === 'ACTIVE') {
      this.showDeleteConfirmationDialog(apiKey);
    } else {
      // Implement activate API key logic if needed
      this.errorHandler.showInfo('API key activation feature coming soon');
    }
  }

  /**
   * Initialize filtered API keys on data load
   */
  private initializeApiKeyFilters(): void {
    this.filteredApiKeys = [...this.apiKeys];
    
    // Auto-select first API key if available
    if (this.apiKeys.length > 0 && !this.selectedApiKey) {
      this.selectedApiKey = this.apiKeys[0];
    }
  }

  /**
   * Get domain name from API key
   */
  getDomainFromApiKey(apiKey: ApiKey): string {
    // Try to get domain from security settings first (allowedDomains)
    if (apiKey.security?.domainRestrictions?.allowedDomains?.length > 0) {
      const domain = apiKey.security.domainRestrictions.allowedDomains[0];
      if (domain && domain !== '') {
        return domain;
      }
    }
    
    // Fallback to allowed origins (which should contain registeredDomain)
    if (apiKey.security?.allowedOrigins?.length > 0) {
      const origin = apiKey.security.allowedOrigins[0];
      if (origin && origin !== '') {
        // Extract domain from URL if it's a full URL
        try {
          const url = new URL(origin.startsWith('http') ? origin : `https://${origin}`);
          return url.hostname;
        } catch {
          return origin;
        }
      }
    }
    
    // Final fallback - use a default
    return 'No domain configured';
  }

  /**
   * Get API key status badge class for table
   */
  getApiKeyStatusBadgeClass(status: string): string {
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
   * Get API key usage percentage for progress bar
   */
  getApiKeyUsagePercentage(apiKey: ApiKey): number {
    if (!apiKey.usage?.requestsToday) return 0;
    const total = 13333; // Mock total limit
    return Math.min((apiKey.usage.requestsToday / total) * 100, 100);
  }

  /**
   * Get environment display name
   */
  getEnvironmentDisplayName(environment?: string): string {
    switch (environment?.toLowerCase()) {
      case 'production':
        return 'Production';
      case 'staging':
        return 'Staging';
      case 'development':
        return 'Development';
      case 'testing':
        return 'Testing';
      default:
        return environment || 'Unknown';
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
   * Get count of unique domains from filtered API keys
   */
  getUniqueDomainCount(): number {
    if (!this.filteredApiKeys || this.filteredApiKeys.length === 0) {
      return 0;
    }
    
    const uniqueDomains = new Set<string>();
    
    this.filteredApiKeys.forEach(apiKey => {
      const domain = this.getDomainFromApiKey(apiKey);
      if (domain && domain !== 'No domain configured') {
        uniqueDomains.add(domain.toLowerCase());
      }
    });
    
    return uniqueDomains.size;
  }

  /**
   * Get count of unique domains created in the current month
   */
  getDomainsAddedThisMonth(): number {
    if (!this.apiKeys || this.apiKeys.length === 0) {
      return 0;
    }
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const uniqueDomainsThisMonth = new Set<string>();
    
    this.apiKeys.forEach(apiKey => {
      if (apiKey.createdAt) {
        const createdDate = new Date(apiKey.createdAt);
        const createdMonth = createdDate.getMonth();
        const createdYear = createdDate.getFullYear();
        
        // Check if the API key was created in the current month and year
        if (createdMonth === currentMonth && createdYear === currentYear) {
          const domain = this.getDomainFromApiKey(apiKey);
          if (domain && domain !== 'No domain configured') {
            uniqueDomainsThisMonth.add(domain.toLowerCase());
          }
        }
      }
    });
    
    return uniqueDomainsThisMonth.size;
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
        return 'Basic';
      case 'STANDARD':
        return 'Standard';
      case 'PREMIUM':
        return 'Premium';
      case 'ENTERPRISE':
        return 'Enterprise';
      case 'UNLIMITED':
        return 'Unlimited';
      default:
        return tier || 'FREE';
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    if (error?.status === 401) {
      return 'Authentication required. Please log in again.';
    }
    if (error?.status === 403) {
      return 'Access denied. You do not have permission to view this data.';
    }
    if (error?.status === 404) {
      return 'Dashboard data not found.';
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
   * Check if API key is effectively revoked (either REVOKED or SUSPENDED)
   */
  isApiKeyRevoked(apiKey: ApiKey): boolean {
    return apiKey.status === 'REVOKED' || apiKey.status === 'SUSPENDED';
  }

}