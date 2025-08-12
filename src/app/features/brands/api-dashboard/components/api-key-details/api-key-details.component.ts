import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiKey } from '../../models/api-key.model';

@Component({
  selector: 'app-api-key-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './api-key-details.component.html',
  styleUrls: ['./api-key-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApiKeyDetailsComponent implements OnInit {
  @Input() apiKey: ApiKey | null = null;
  @Input() loading = false;
  
  @Output() viewFullDetails = new EventEmitter<ApiKey>();
  @Output() editApiKey = new EventEmitter<ApiKey>();
  @Output() regenerateApiKey = new EventEmitter<ApiKey>();
  @Output() copyApiKey = new EventEmitter<string>();
  @Output() toggleApiKeyStatus = new EventEmitter<ApiKey>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Component initialization
  }

  /**
   * Handle view full details
   */
  onViewFullDetails(): void {
    if (this.apiKey) {
      this.viewFullDetails.emit(this.apiKey);
    }
  }

  /**
   * Handle edit API key
   */
  onEditApiKey(): void {
    if (this.apiKey) {
      this.editApiKey.emit(this.apiKey);
    }
  }

  /**
   * Handle regenerate API key
   */
  onRegenerateApiKey(): void {
    if (this.apiKey) {
      this.regenerateApiKey.emit(this.apiKey);
    }
  }

  /**
   * Handle copy API key
   */
  onCopyApiKey(): void {
    if (this.apiKey) {
      this.copyApiKey.emit(this.apiKey.maskedKey);
    }
  }

  /**
   * Handle toggle API key status
   */
  onToggleStatus(): void {
    if (this.apiKey) {
      this.toggleApiKeyStatus.emit(this.apiKey);
    }
  }

  /**
   * Get API key status class
   */
  getApiKeyStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'badge bg-success-subtle text-success border border-success-subtle';
      case 'expired':
        return 'badge bg-danger-subtle text-danger border border-danger-subtle';
      case 'disabled':
        return 'badge bg-secondary-subtle text-secondary border border-secondary-subtle';
      case 'suspended':
        return 'badge bg-warning-subtle text-warning border border-warning-subtle';
      default:
        return 'badge bg-secondary-subtle text-secondary border border-secondary-subtle';
    }
  }

  /**
   * Get usage percentage
   */
  getUsagePercentage(): number {
    if (!this.apiKey?.usage) return 0;
    const total = this.apiKey.usage.requestsToday + this.apiKey.usage.remainingToday;
    return total > 0 ? Math.round((this.apiKey.usage.requestsToday / total) * 100) : 0;
  }

  /**
   * Get usage progress class
   */
  getUsageProgressClass(): string {
    const percentage = this.getUsagePercentage();
    if (percentage >= 90) return 'bg-danger';
    if (percentage >= 75) return 'bg-warning';
    if (percentage >= 50) return 'bg-info';
    return 'bg-success';
  }

  /**
   * Get rate limit status class
   */
  getRateLimitStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'normal':
        return 'bg-success-subtle text-success border border-success-subtle';
      case 'warning':
        return 'bg-warning-subtle text-warning border border-warning-subtle';
      case 'critical':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      default:
        return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
    }
  }

  /**
   * Format number with commas
   */
  formatNumber(num: number): string {
    return num?.toLocaleString() || '0';
  }

  /**
   * Format date
   */
  formatDate(date: string | Date): string {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Check if API key is expiring soon
   */
  isExpiringSoon(): boolean {
    if (!this.apiKey?.expiresAt) return false;
    const expiryDate = new Date(this.apiKey.expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }

  /**
   * Get days until expiry
   */
  getDaysUntilExpiry(): number {
    if (!this.apiKey?.expiresAt) return -1;
    const expiryDate = new Date(this.apiKey.expiresAt);
    const now = new Date();
    return Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}