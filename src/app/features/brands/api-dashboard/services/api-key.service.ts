import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, catchError, tap, map, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { 
  ApiKey, 
  CreateApiKeyRequest, 
  CreateApiKeyResponse,
  RegenerateApiKeyResponse,
  SecuritySettings,
  ExpirationSettings
} from '../models/api-key.model';
import { 
  RateLimitStatus, 
  UsageAnalytics, 
  RateLimitHeaders 
} from '../models/rate-limit.model';
import { MockDataService } from './mock-data.service';
import { ApiKeyEncryptionService } from './api-key-encryption.service';
import { AuthService } from '../../../../core/services/auth.service';

// Backend API response interface matching ApiKeyResponseDTO
interface BackendApiKey {
  id: string;
  name: string;
  description?: string | null;
  prefix?: string | null;
  keyPreview: string; // Masked preview of the API key (for identification only)
  isActive: boolean;
  registeredDomain?: string | null;
  expiresAt?: string | null; // LocalDateTime
  createdAt: string; // LocalDateTime
  updatedAt: string; // LocalDateTime
  lastUsedAt?: string | null; // LocalDateTime
  revokedAt?: string | null; // LocalDateTime
  allowedIps: string[];
  allowedDomains: string[];
  rateLimitTier: string;
  scopes: string[];
  encryptedKeyValue?: string; // Encrypted API key value for frontend decryption
}

@Injectable({
  providedIn: 'root'
})
export class ApiKeyService {
  private readonly apiUrl = `${environment.baseApiUrl}/api/v1/api-keys`;
  private apiKeysSubject = new BehaviorSubject<ApiKey[]>([]);
  public apiKeys$ = this.apiKeysSubject.asObservable();
  
  // Simple cache for API keys
  private apiKeysCache: { keys: ApiKey[] } | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5000; // 5 seconds only

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService,
    private encryptionService: ApiKeyEncryptionService,
    private authService: AuthService
  ) {}

  /**
   * Get all API keys for the current user
   */
  getApiKeys(): Observable<{ keys: ApiKey[] }> {
    // Check cache first
    const now = Date.now();
    if (this.apiKeysCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return of(this.apiKeysCache);
    }

    // Check if we should use real API data or mock data for API keys only
    if (!environment.useRealApiKeysData) {
      // Use mock data when useRealApiKeysData is false
      const result$ = this.mockDataService.getMockApiKeys().pipe(
        tap(data => {
          this.apiKeysCache = data;
          this.cacheTimestamp = now;
        }),
        catchError(error => {
          console.error('Error loading mock API keys:', error);
          return of({ keys: [] });
        })
      );
      return result$;
    }
    
    // Use real backend API data
    const result$ = this.http.get<BackendApiKey[]>(this.apiUrl).pipe(
      map(backendApiKeys => {
        
        // Map backend response to frontend model
        const mappedKeys: ApiKey[] = backendApiKeys.map(backendKey => ({
          id: backendKey.id,
          name: backendKey.name,
          description: backendKey.description || undefined,
          prefix: backendKey.prefix || undefined,
          keyPreview: backendKey.keyPreview,
          maskedKey: backendKey.keyPreview, // Use keyPreview as maskedKey for backward compatibility
          encryptedKeyValue: backendKey.encryptedKeyValue, // Pass encrypted key value for frontend decryption
          isActive: backendKey.isActive,
          registeredDomain: backendKey.registeredDomain || undefined,
          tier: backendKey.rateLimitTier,
          environment: 'production' as 'development' | 'staging' | 'production' | 'testing', // Default to production since backend doesn't provide environment
          scopes: backendKey.scopes || [],
          allowedIps: backendKey.allowedIps || [],
          allowedDomains: backendKey.allowedDomains || [],
          usage: {
            requestsToday: 0, // Backend doesn't provide this, set default
            remainingToday: 10000, // Backend doesn't provide this, set default
            lastUsed: backendKey.lastUsedAt || backendKey.createdAt, // Use lastUsedAt or createdAt as fallback
            rateLimitStatus: 'OK' as 'OK' | 'WARNING' | 'EXCEEDED'
          },
          security: {
            ipRestrictions: {
              enabled: backendKey.allowedIps.length > 0,
              whitelist: backendKey.allowedIps
            },
            domainRestrictions: {
              enabled: backendKey.allowedDomains.length > 0 || !!backendKey.registeredDomain,
              allowedDomains: backendKey.allowedDomains.length > 0 ? backendKey.allowedDomains : [backendKey.registeredDomain || '']
            },
            webhookUrls: [],
            allowedOrigins: backendKey.allowedDomains.length > 0 ? backendKey.allowedDomains : [backendKey.registeredDomain || '']
          },
          expiresAt: backendKey.expiresAt || undefined,
          createdAt: backendKey.createdAt,
          updatedAt: backendKey.updatedAt || undefined,
          lastUsedAt: backendKey.lastUsedAt || undefined,
          revokedAt: backendKey.revokedAt || undefined,
          status: backendKey.isActive ? 'ACTIVE' : 'SUSPENDED'
        }));
        
        return { keys: mappedKeys };
      }),
      tap(data => {
        this.apiKeysCache = data;
        this.cacheTimestamp = now;
      }),
      catchError(error => {
        console.error('Error fetching API keys from backend:', error);
        // Return empty array instead of throwing error
        return of({ keys: [] });
      })
    );
    return result$;
  }

  /**
   * Create a new API key
   */
  createApiKey(request: CreateApiKeyRequest): Observable<CreateApiKeyResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<CreateApiKeyResponse>(`${this.apiUrl}/rivo-create-api`, request, { headers })
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
    // For development, use mock data
    if (!environment.production) {
      return this.mockDataService.getMockApiKeyById(id);
    }
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
  regenerateApiKey(id: string): Observable<RegenerateApiKeyResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<RegenerateApiKeyResponse>(`${this.apiUrl}/${id}/regenerate`, {}, { headers }).pipe(
      tap(response => {
        console.log('API key regenerated successfully:', response.id);
        
        // Invalidate cache to force refresh on next getApiKeys() call
        this.apiKeysCache = null;
        this.cacheTimestamp = 0;
        
        // Update the current API keys list with the regenerated key
        const currentKeys = this.getCurrentApiKeys();
        const updatedKeys = currentKeys.map(key => {
          if (key.id === id) {
            // Update the existing key with new masked key (since we don't store the actual key)
            return {
              ...key,
              maskedKey: response.keyPreview,
              // Update other fields that might have changed
              name: response.name,
              tier: response.rateLimitTier,
              scopes: response.scopes || key.scopes,
              status: response.success ? 'ACTIVE' as const : 'SUSPENDED' as const
            };
          }
          return key;
        });
        
        // Update the BehaviorSubject with the updated keys
        this.updateApiKeys(updatedKeys);
      }),
      catchError(error => {
        console.error('Error regenerating API key:', error);
        
        // Provide more specific error messages based on status code
        if (error.status === 404) {
          console.error('API key not found:', id);
        } else if (error.status === 401) {
          console.error('Unauthorized: Please check your authentication');
        } else if (error.status === 403) {
          console.error('Forbidden: Insufficient permissions to regenerate API key');
        }
        
        // Re-throw the error so components can handle it
        return throwError(() => error);
      })
    );
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

  /**
   * Generate masked key for display purposes since backend doesn't provide actual key value
   */
  private generateMaskedKey(prefix: string | null | undefined, name: string): string {
    const keyPrefix = prefix || 'key';
    const hash = this.simpleHash(name);
    const maskedMiddle = '*'.repeat(24);
    const suffix = hash.substring(hash.length - 4);
    
    return `${keyPrefix}-${maskedMiddle}${suffix}`;
  }

  /**
   * Simple hash function for generating consistent masked key suffix
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Decrypt an API key using the encryption service
   * @param encryptedKeyValue The encrypted API key value from backend
   * @returns Promise<string | null> The decrypted API key or null if decryption fails
   */
  async decryptApiKey(encryptedKeyValue: string): Promise<string | null> {
    try {
      // Get current user details
      const userDetails = this.authService.getCurrentUserDetails();
      if (!userDetails || !userDetails.userId) {
        return null;
      }

      // Use the user ID for key derivation
      const userId = userDetails.userId;
      
      // Decrypt the API key
      const result = await this.encryptionService.decryptApiKey(encryptedKeyValue, userId);
      
      if (result.success && result.plainText) {
        return result.plainText;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current user ID for encryption/decryption operations
   * @returns string | null The current user ID or null if not available
   */
  private getCurrentUserId(): string | null {
    const userDetails = this.authService.getCurrentUserDetails();
    return userDetails?.userId || null;
  }

  /**
   * Check if an API key can be decrypted (has encrypted value and user is authenticated)
   * @param apiKey The API key to check
   * @returns boolean True if the API key can be decrypted
   */
  canDecryptApiKey(apiKey: ApiKey): boolean {
    return !!(apiKey.encryptedKeyValue && this.getCurrentUserId());
  }
}