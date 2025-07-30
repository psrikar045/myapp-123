import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, Observable } from 'rxjs';

import { ApiKeyService } from '../../services/api-key.service';
import { AppThemeService } from '../../../../../core/services/app-theme.service';
import { ApiKey } from '../../models/api-key.model';

@Component({
  selector: 'app-api-key-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './api-key-management.component.html',
  styleUrls: ['./api-key-management.component.scss']
})
export class ApiKeyManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data properties
  apiKeys: ApiKey[] = [];
  
  // UI state
  loading = true;
  error: string | null = null;
  
  // Theme state
  isDarkMode$: any;
  
  // Selection state
  selectedKeys: Set<string> = new Set();
  showDeleteConfirm = false;
  keyToDelete: ApiKey | null = null;

  constructor(
    private apiKeyService: ApiKeyService,
    private themeService: AppThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isDarkMode$ = this.themeService.isDarkMode$;
    this.loadApiKeys();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load API keys
   */
  private loadApiKeys(): void {
    this.loading = true;
    this.error = null;

    this.apiKeyService.getApiKeys()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.apiKeys = response.keys;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading API keys:', error);
          this.error = 'Failed to load API keys. Please try again.';
          this.loading = false;
        }
      });
  }

  /**
   * Refresh API keys
   */
  refreshApiKeys(): void {
    this.loadApiKeys();
  }

  /**
   * Navigate to create API key
   */
  createApiKey(): void {
    this.router.navigate(['/brands/account-hub/api-keys/create']);
  }

  /**
   * Navigate back to account hub
   */
  goBack(): void {
    this.router.navigate(['/brands/account-hub']);
  }

  /**
   * Toggle key selection
   */
  toggleKeySelection(keyId: string): void {
    if (this.selectedKeys.has(keyId)) {
      this.selectedKeys.delete(keyId);
    } else {
      this.selectedKeys.add(keyId);
    }
  }

  /**
   * Select all keys
   */
  selectAllKeys(): void {
    this.apiKeys.forEach(key => this.selectedKeys.add(key.id));
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.selectedKeys.clear();
  }

  /**
   * Check if key is selected
   */
  isKeySelected(keyId: string): boolean {
    return this.selectedKeys.has(keyId);
  }

  /**
   * Get selected keys count
   */
  getSelectedCount(): number {
    return this.selectedKeys.size;
  }

  /**
   * Show delete confirmation
   */
  confirmDelete(apiKey: ApiKey): void {
    this.keyToDelete = apiKey;
    this.showDeleteConfirm = true;
  }

  /**
   * Cancel delete
   */
  cancelDelete(): void {
    this.keyToDelete = null;
    this.showDeleteConfirm = false;
  }

  /**
   * Delete API key
   */
  deleteApiKey(): void {
    if (!this.keyToDelete) return;

    this.apiKeyService.revokeApiKey(this.keyToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.apiKeys = this.apiKeys.filter(key => key.id !== this.keyToDelete!.id);
          this.selectedKeys.delete(this.keyToDelete!.id);
          this.cancelDelete();
        },
        error: (error) => {
          console.error('Error deleting API key:', error);
          this.error = 'Failed to delete API key. Please try again.';
          this.cancelDelete();
        }
      });
  }

  /**
   * Delete selected keys
   */
  deleteSelectedKeys(): void {
    // Implementation for bulk delete
    console.log('Delete selected keys:', Array.from(this.selectedKeys));
  }

  /**
   * Get API key status badge class
   */
  getStatusBadgeClass(status: string): string {
    return `badge rounded-pill bg-${this.apiKeyService.getStatusColor(status)}`;
  }

  /**
   * Get rate limit status badge class
   */
  getRateLimitBadgeClass(status: string): string {
    return `badge rounded-pill bg-${this.apiKeyService.getRateLimitStatusColor(status)}`;
  }

  /**
   * Check if API key is expiring soon
   */
  isExpiringSoon(apiKey: ApiKey): boolean {
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
   * Format number with commas
   */
  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  /**
   * Get usage percentage
   */
  getUsagePercentage(apiKey: ApiKey): number {
    if (!apiKey.usage.requestsToday || !apiKey.usage.remainingToday) return 0;
    const total = apiKey.usage.requestsToday + apiKey.usage.remainingToday;
    return Math.round((apiKey.usage.requestsToday / total) * 100);
  }

  /**
   * Get usage progress bar class
   */
  getUsageProgressClass(percentage: number): string {
    if (percentage >= 90) return 'bg-danger';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-success';
  }

  /**
   * Copy API key to clipboard
   */
  copyApiKey(maskedKey: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(maskedKey).then(() => {
        console.log('API key copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy API key:', err);
      });
    }
  }

  /**
   * Get active keys count for stats
   */
  getActiveKeysCount(): number {
    return this.apiKeys.filter(key => key.status === 'ACTIVE').length;
  }

  /**
   * Get expiring keys count for stats
   */
  getExpiringKeysCount(): number {
    return this.apiKeys.filter(key => this.isExpiringSoon(key)).length;
  }

  /**
   * Filter keys by status
   */
  filterKeys(filter: string): void {
    // Implementation for filtering keys
    console.log('Filter keys by:', filter);
    // You can implement actual filtering logic here
  }

  /**
   * TrackBy function for API keys
   */
  trackByApiKeyId(index: number, apiKey: ApiKey): string {
    return apiKey.id;
  }
}