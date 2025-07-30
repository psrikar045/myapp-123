import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { 
  ApiKey, 
  CreateApiKeyRequest, 
  CreateApiKeyResponse,
  SecuritySettings,
  ExpirationSettings
} from '../models/api-key.model';
import { 
  RateLimitStatus, 
  UsageAnalytics, 
  RateLimitHeaders 
} from '../models/rate-limit.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class ApiKeyService {
  private readonly apiUrl = `${environment.baseApiUrl}/api/v1/account/api-keys`;
  private apiKeysSubject = new BehaviorSubject<ApiKey[]>([]);
  public apiKeys$ = this.apiKeysSubject.asObservable();

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService
  ) {}

  /**
   * Get all API keys for the current user
   */
  getApiKeys(): Observable<{ keys: ApiKey[] }> {
    // For development, use mock data
    if (!environment.production) {
      return this.mockDataService.getMockApiKeys();
    }
    return this.http.get<{ keys: ApiKey[] }>(this.apiUrl);
  }

  /**
   * Create a new API key
   */
  createApiKey(request: CreateApiKeyRequest): Observable<CreateApiKeyResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<CreateApiKeyResponse>(this.apiUrl, request, { headers });
  }

  /**
   * Update an existing API key
   */
  updateApiKey(id: string, updates: Partial<CreateApiKeyRequest>): Observable<ApiKey> {
    return this.http.put<ApiKey>(`${this.apiUrl}/${id}`, updates);
  }

  /**
   * Delete/Revoke an API key
   */
  revokeApiKey(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get rate limit status for a specific API key
   */
  getRateLimitStatus(id: string): Observable<RateLimitStatus> {
    return this.http.get<RateLimitStatus>(`${this.apiUrl}/${id}/rate-limit`);
  }

  /**
   * Get usage analytics for a specific API key
   */
  getUsageAnalytics(id: string, period: '7d' | '30d' | '90d' = '30d'): Observable<UsageAnalytics> {
    return this.http.get<UsageAnalytics>(`${this.apiUrl}/${id}/analytics?period=${period}`);
  }

  /**
   * Parse rate limit headers from HTTP response
   */
  parseRateLimitHeaders(headers: HttpHeaders): RateLimitHeaders | null {
    const limit = headers.get('X-RateLimit-Limit');
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');

    if (limit && remaining && reset) {
      return {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10)
      };
    }

    return null;
  }

  /**
   * Update API keys in service
   */
  updateApiKeys(keys: ApiKey[]): void {
    this.apiKeysSubject.next(keys);
  }

  /**
   * Get current API keys
   */
  getCurrentApiKeys(): ApiKey[] {
    return this.apiKeysSubject.value;
  }

  /**
   * Refresh API keys
   */
  refreshApiKeys(): Observable<{ keys: ApiKey[] }> {
    const keys$ = this.getApiKeys();
    keys$.subscribe(response => this.updateApiKeys(response.keys));
    return keys$;
  }

  /**
   * Generate API key name suggestion
   */
  generateKeyName(environment: string, purpose?: string): string {
    const timestamp = new Date().toISOString().slice(0, 10);
    const purposeStr = purpose ? `-${purpose}` : '';
    return `${environment}${purposeStr}-${timestamp}`;
  }

  /**
   * Validate API key name
   */
  validateKeyName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'API key name is required' };
    }

    if (name.length < 3) {
      return { valid: false, error: 'API key name must be at least 3 characters' };
    }

    if (name.length > 50) {
      return { valid: false, error: 'API key name must be less than 50 characters' };
    }

    if (!/^[a-zA-Z0-9\-_\s]+$/.test(name)) {
      return { valid: false, error: 'API key name can only contain letters, numbers, hyphens, underscores, and spaces' };
    }

    return { valid: true };
  }

  /**
   * Check if API key is expiring soon
   */
  isExpiringSoon(apiKey: ApiKey, days: number = 7): boolean {
    if (!apiKey.expiresAt) return false;
    
    const expiryDate = new Date(apiKey.expiresAt);
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + days);
    
    return expiryDate <= warningDate;
  }

  /**
   * Get API key status color
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'EXPIRED': return 'danger';
      case 'REVOKED': return 'secondary';
      case 'SUSPENDED': return 'warning';
      default: return 'secondary';
    }
  }

  /**
   * Get rate limit status color
   */
  getRateLimitStatusColor(status: string): string {
    switch (status) {
      case 'OK': return 'success';
      case 'WARNING': return 'warning';
      case 'EXCEEDED': return 'danger';
      default: return 'secondary';
    }
  }

  /**
   * Get API key by ID
   */
  getApiKeyById(id: string): Observable<ApiKey> {
    return this.http.get<ApiKey>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get API key analytics
   */
  getApiKeyAnalytics(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/analytics`);
  }

  /**
   * Update API key status
   */
  updateApiKeyStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }

  /**
   * Regenerate API key
   */
  regenerateApiKey(id: string): Observable<CreateApiKeyResponse> {
    return this.http.post<CreateApiKeyResponse>(`${this.apiUrl}/${id}/regenerate`, {});
  }

  /**
   * Update API key security settings
   */
  updateApiKeySecurity(id: string, security: SecuritySettings): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/security`, { security });
  }

  /**
   * Update API key expiration settings
   */
  updateApiKeyExpiration(id: string, expiration: ExpirationSettings): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/expiration`, { expiration });
  }
}