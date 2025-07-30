import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AccountHubService } from './services/account-hub.service';
import { ApiKeyService } from './services/api-key.service';
import { AppThemeService } from '../../../core/services/app-theme.service';
import { SpinnerService } from '../../../core/services/spinner.service';

import { ErrorDisplayComponent } from './components/error-display/error-display.component';
import { AccountHubData, DashboardStats, RecentProject } from './models/dashboard.model';
import { ApiKey } from './models/api-key.model';

@Component({
  selector: 'app-account-hub',
  standalone: true,
  imports: [CommonModule, ErrorDisplayComponent],
  templateUrl: './account-hub.component.html',
  styleUrls: ['./account-hub.component.scss']
})
export class AccountHubComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data properties
  dashboardData: AccountHubData | null = null;
  stats: DashboardStats | null = null;
  recentProjects: RecentProject[] = [];
  apiKeys: ApiKey[] = [];
  
  // UI state
  loading = true;
  error: string | null = null;
  
  // Theme state
  isDarkMode$: any;
  
  // User info
  userName = 'John'; // This should come from auth service
  
  constructor(
    private accountHubService: AccountHubService,
    private apiKeyService: ApiKeyService,
    private themeService: AppThemeService,
    private spinnerService: SpinnerService,
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
      stats: this.accountHubService.getDashboardStats(),
      projects: this.accountHubService.getRecentProjects(),
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
    this.router.navigate(['/brands/account-hub/api-keys/create']);
  }

  /**
   * Navigate to API key management
   */
  manageApiKeys(): void {
    this.router.navigate(['/brands/account-hub/api-keys/manage']);
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
   * Format number with commas
   */
  formatNumber(num: number): string {
    return num.toLocaleString();
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
    this.router.navigate(['/brands/account-hub/api-keys', apiKey.id]);
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
    if (maskedKey) {
      navigator.clipboard.writeText(maskedKey).then(() => {
        console.log('API key copied to clipboard');
        // You could show a toast notification here
      });
    }
  }

  /**
   * Edit API key
   */
  editApiKey(apiKey: ApiKey): void {
    this.router.navigate(['/brands/account-hub/api-keys', apiKey.id, 'edit']);
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
    this.router.navigate(['/brands/account-hub/analytics']);
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
        },
        error: (error) => {
          console.error('Error updating API key status:', error);
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
          },
          error: (error) => {
            console.error('Error revoking API key:', error);
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
            // Update the API key with new data
            Object.assign(apiKey, response.apiKey);
          },
          error: (error) => {
            console.error('Error regenerating API key:', error);
          }
        });
    }
  }

}