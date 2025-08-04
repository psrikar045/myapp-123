import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ApiDashboardService } from './services/api-dashboard.service';
import { ApiKeyService } from './services/api-key.service';
import { AppThemeService } from '../../../core/services/app-theme.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';

import { ErrorDisplayComponent } from './components/error-display/error-display.component';
import { ApiDashboardData, DashboardStats, RecentProject } from './models/dashboard.model';
import { ApiKey } from './models/api-key.model';

@Component({
  selector: 'app-api-dashboard',
  standalone: true,
  imports: [CommonModule, ErrorDisplayComponent],
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
  
  // Theme state
  isDarkMode$: any;
  
  // User info
  userName = 'John'; // This should come from auth service
  
  constructor(
    private apiDashboardService: ApiDashboardService,
    private apiKeyService: ApiKeyService,
    private themeService: AppThemeService,
    private spinnerService: SpinnerService,
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isDarkMode$ = this.themeService.isDarkMode$;
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all dashboard data
   */
  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;
    
    // Use global spinner instead of local loading state
    this.spinnerService.show();

    // Load dashboard stats, recent projects, and API keys in parallel
    forkJoin({
      stats: this.apiDashboardService.getDashboardStats(),
      projects: this.apiDashboardService.getRecentProjects(),
      apiKeys: this.apiKeyService.getApiKeys()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.recentProjects = data.projects.projects;
        this.apiKeys = data.apiKeys.keys;
        
        // Update services with loaded data
        this.apiKeyService.updateApiKeys(this.apiKeys);
        
        // Initialize API key filters and selection
        this.initializeApiKeyFilters();
        
        this.loading = false;
        this.spinnerService.hide();
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
        this.spinnerService.hide();
      }
    });
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboard(): void {
    this.loadDashboardData();
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
   * Navigate to view all API keys
   */
  viewAllApiKeys(): void {
    this.router.navigate(['/brands/api-dashboard/api-keys/list']);
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
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
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
   * Copy API key to clipboard
   */
  copyApiKey(maskedKey: string): void {
    if (maskedKey && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(maskedKey).then(() => {
        this.errorHandler.showInfo('API key copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy API key:', err);
        this.errorHandler.showWarning('Failed to copy API key to clipboard');
      });
    }
  }

  /**
   * Edit API key
   */
  editApiKey(apiKey: ApiKey): void {
    // this.router.navigate(['/brands/api-dashboard/api-keys', apiKey.id, 'edit']);
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
    const newStatus = apiKey.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    this.apiKeyService.updateApiKeyStatus(apiKey.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          apiKey.status = newStatus;
          this.errorHandler.showSuccess(`API key ${newStatus.toLowerCase()} successfully`);
        },
        error: (error) => {
          console.error('Error updating API key status:', error);
          this.errorHandler.showWarning(error.error?.message || 'Failed to update API key status');
        }
      });
  }

  /**
   * Revoke API key
   */
  revokeApiKey(apiKey: ApiKey): void {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      this.apiKeyService.revokeApiKey(apiKey.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            apiKey.status = 'REVOKED';
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
   * Regenerate API key
   */
  regenerateApiKey(apiKey: ApiKey): void {
    if (confirm('Are you sure you want to regenerate this API key? The old key will stop working immediately.')) {
      this.apiKeyService.regenerateApiKey(apiKey.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            // Update the API key with new data from the response
            apiKey.id = response.id;
            apiKey.name = response.name;
            apiKey.key = response.keyValue;
            apiKey.maskedKey = response.keyValue.substring(0, 8) + '...' + response.keyValue.substring(response.keyValue.length - 4);
            apiKey.environment = response.environment;
            apiKey.tier = response.rateLimitTier;
            apiKey.scopes = response.scopes ? response.scopes.split(',') : [];
            apiKey.status = response.isActive ? 'ACTIVE' : 'SUSPENDED';
            apiKey.expiresAt = response.expiresAt;
            apiKey.createdAt = response.createdAt;
            this.errorHandler.showSuccess('API key regenerated successfully! Make sure to update your applications with the new key.');
          },
          error: (error) => {
            console.error('Error regenerating API key:', error);
            this.errorHandler.showWarning(error.error?.message || 'Failed to regenerate API key');
          }
        });
    }
  }

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
    this.regenerateApiKey(apiKey);
  }

  onApiKeyDetailsCopy(maskedKey: string): void {
    this.copyApiKey(maskedKey);
  }

  onApiKeyDetailsToggleStatus(apiKey: ApiKey): void {
    if (apiKey.status === 'ACTIVE') {
      this.revokeApiKey(apiKey);
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
        return 'Inactive';
      case 'EXPIRED':
        return 'Expired';
      case 'REVOKED':
        return 'Revoked';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get tier display name
   */
  getTierDisplayName(tier: string): string {
    switch (tier) {
      case 'FREE_TIER':
        return 'Free';
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
        return tier || 'Free';
    }
  }

}