import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, catchError, tap, map, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { 
  ApiKey, 
  CreateApiKeyRequest, 
  CreateApiKeyResponse,
  RegenerateApiKeyResponse,
  ApiKeyUpdateRequest,
  SecuritySettings,
  ExpirationSettings
} from '../models/api-key.model';
import { 
  RateLimitStatus, 
  UsageAnalytics, 
  RateLimitHeaders 
} from '../models/rate-limit.model';
import { 
  SingleApiKeyDashboardResponse, 
  TransformedApiKeyDashboard,
  ApiResponseWrapper
} from '../models/dashboard-api.model';
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
  active: boolean; // Backend returns 'active' not 'isActive'
  isActive?: boolean; // Keep for backward compatibility
  registeredDomain?: string | null;
  expiresAt?: string | null; // LocalDateTime
  createdAt: string; // LocalDateTime
  updatedAt?: string; // LocalDateTime
  lastUsedAt?: string | null; // LocalDateTime
  revokedAt?: string | null; // LocalDateTime
  allowedIps: string[];
  allowedDomains: string[];
  rateLimitTier: string;
  environment?: 'development' | 'staging' | 'production' | 'testing';
  scopes: string[];
  encryptedKeyValue?: string; // Encrypted API key value for frontend decryption
  defaultKey?: boolean; // Indicates if this is the primary/default API key
}

@Injectable({
  providedIn: 'root'
})
export class ApiKeyService {
  private readonly apiUrl = `${environment.baseApiUrl}/api/v1/api-keys`;
  private apiKeysSubject = new BehaviorSubject<ApiKey[]>([]);
  public apiKeys$ = this.apiKeysSubject.asObservable();
  
  // No caching - always fetch real-time data

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService,
    private encryptionService: ApiKeyEncryptionService,
    private authService: AuthService
  ) {}

  /**
   * Get all API keys for the current user (no caching - always real-time)
   */
  getApiKeys(): Observable<{ keys: ApiKey[] }> {
    // Check if we should use real API data or mock data for API keys only
    if (!environment.useRealApiKeysData) {
      // Use mock data when useRealApiKeysData is false
      const result$ = this.mockDataService.getMockApiKeys().pipe(
        tap(data => {
          // Update the BehaviorSubject with fresh data
          this.apiKeysSubject.next(data.keys);
        }),
        catchError(error => {
          console.error('Error loading mock API keys:', error);
          return of({ keys: [] });
        })
      );
      return result$;
    }
    
    // Use real backend API data - always fetch fresh data
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
          isActive: backendKey.active ?? backendKey.isActive,
          registeredDomain: backendKey.registeredDomain || undefined,
          tier: backendKey.rateLimitTier,
          environment: backendKey.environment ?? 'production',
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
          status: this.determineApiKeyStatus(backendKey),
          defaultKey: backendKey.defaultKey || false // Map the defaultKey property from backend
        }));
        
        return { keys: mappedKeys };
      }),
      tap(data => {
        // Update the BehaviorSubject with fresh data
        this.apiKeysSubject.next(data.keys);
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
      'Accept': 'application/json',
      'X-Suppress-Error-Toast': 'true' // Prevent global notifier for this request
    });   
    // return this.http.post<CreateApiKeyResponse>(`${this.apiUrl}/rivo-create-api`, request, { headers }).pipe(
    // Build the URL with environment parameter if provided
    let createApiUrl = `${this.apiUrl}/rivo-create-api`;
    if (request.environment) {
      createApiUrl += `?environment=${encodeURIComponent(request.environment)}`;
    }
    return this.http.post<CreateApiKeyResponse>(createApiUrl, request, { headers }).pipe(
      tap(response => {
        console.log('API key created successfully:', response.id);
        
        // Force refresh by making a direct API call and updating all subscribers
        this.forceRefreshApiKeys();
      }),
      catchError(error => {
        console.error('Error creating API key:', error);
        return throwError(() => error);
      })
    );
  }
private forceRefreshApiKeys(): void {
    // Force fresh API call without caching
    
    // Check if we should use real API data or mock data
    if (!environment.useRealApiKeysData) {
      // Use mock data
      this.mockDataService.getMockApiKeys().pipe(
        tap(data => {
          // Update the BehaviorSubject with fresh data
          this.apiKeysSubject.next(data.keys);
          console.log('Mock API keys force refreshed, new count:', data.keys.length);
        }),
        catchError(error => {
          console.error('Error force refreshing mock API keys:', error);
          return of({ keys: [] });
        })
      ).subscribe();
    } else {
      // Use real backend API data
      this.http.get<BackendApiKey[]>(this.apiUrl).pipe(
        map(backendApiKeys => {
          // Map backend response to frontend model (same logic as in getApiKeys)
          const mappedKeys: ApiKey[] = backendApiKeys.map(backendKey => ({
            id: backendKey.id,
            name: backendKey.name,
            description: backendKey.description || undefined,
            prefix: backendKey.prefix || undefined,
            keyPreview: backendKey.keyPreview,
            maskedKey: backendKey.keyPreview,
            encryptedKeyValue: backendKey.encryptedKeyValue,
            isActive: backendKey.active ?? backendKey.isActive,
            registeredDomain: backendKey.registeredDomain || undefined,
            tier: backendKey.rateLimitTier,
            environment: backendKey.environment ?? 'production',
            scopes: backendKey.scopes || [],
            allowedIps: backendKey.allowedIps || [],
            allowedDomains: backendKey.allowedDomains || [],
            usage: {
              requestsToday: 0,
              remainingToday: 10000,
              lastUsed: backendKey.lastUsedAt || backendKey.createdAt,
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
            status: this.determineApiKeyStatus(backendKey),
            defaultKey: backendKey.defaultKey || false // Map the defaultKey property from backend
          }));
          
          return { keys: mappedKeys };
        }),
        tap(data => {
          // Update the BehaviorSubject with fresh data
          this.apiKeysSubject.next(data.keys);
          console.log('Real API keys force refreshed, new count:', data.keys.length);
        }),
        catchError(error => {
          console.error('Error force refreshing API keys from backend:', error);
          return of({ keys: [] });
        })
      ).subscribe();
    }
  }
  /**
   * Update an existing API key
   */
  updateApiKey(id: string, updates: ApiKeyUpdateRequest): Observable<BackendApiKey> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.put<BackendApiKey>(`${this.apiUrl}/${id}`, updates, { headers }).pipe(
      tap(response => {
        console.log('API key updated successfully:', response.id);
        
        // Update the specific API key in the current list
        const currentKeys = this.getCurrentApiKeys();
        const updatedKeys = currentKeys.map(key => {
          if (key.id === id) {
            // Transform backend response to frontend ApiKey format
            return {
              ...key,
              name: response.name,
              description: response.description || undefined,
              registeredDomain: response.registeredDomain || undefined,
              tier: response.rateLimitTier,
              allowedIps: response.allowedIps,
              allowedDomains: response.allowedDomains,
              expiresAt: response.expiresAt || undefined,
              status: this.determineApiKeyStatus(response),
              updatedAt: response.updatedAt || new Date().toISOString()
            };
          }
          return key;
        });
        
        // Update the API keys list with the specific change
        this.updateApiKeys(updatedKeys);
      
      }),
      catchError(error => {
        console.error('Error updating API key:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Revoke an API key
   */
  revokeApiKey(id: string): Observable<{ success: boolean; message?: string }> {
    return this.http.patch<{ success: boolean; message?: string }>(`${this.apiUrl}/${id}/revoke`, {}).pipe(
      tap(response => {
        console.log('API key revoked successfully:', id, response);
        
        if (response.success) {
          // Update the specific API key status in the current list
          const currentKeys = this.getCurrentApiKeys();
          const updatedKeys = currentKeys.map(key => {
            if (key.id === id) {
              return {
                ...key,
                status: 'REVOKED' as 'ACTIVE' | 'REVOKED' | 'SUSPENDED' | 'EXPIRED',
                isActive: false,
                revokedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
            }
            return key;
          });
          
          // Update the API keys list with the specific change
          this.updateApiKeys(updatedKeys);
        }
      }),
      catchError(error => {
        console.error('Error revoking API key:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete an API key
   */
  deleteApiKey(id: string): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(`${this.apiUrl}/${id}`).pipe(
      tap(response => {
        // Remove the deleted key from the current API keys list
        const currentKeys = this.getCurrentApiKeys();
        const updatedKeys = currentKeys.filter(key => key.id !== id);
        this.updateApiKeys(updatedKeys);
      }),
      catchError(error => {
        console.error('Error deleting API key:', error);
        return throwError(() => error);
      })
    );
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
   * Ensure API keys are loaded and return the current data
   * This method prioritizes BehaviorSubject data over cache/API calls
   */
  ensureApiKeysLoaded(forceRefresh = false): Observable<{ keys: ApiKey[] }> {
    const currentKeys = this.apiKeysSubject.value;
    // If we have current data in BehaviorSubject, return it immediately
    if (currentKeys && currentKeys.length > 0) {
      return of({ keys: currentKeys });
    }
    
    // If no current data, fetch from API and update BehaviorSubject
    return this.getApiKeys();
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
  isExpiringSoon(apiKey: ApiKey, days = 7): boolean {
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
   * Get API key dashboard data
   */
  getApiKeyDashboard(apiKeyId: string, refresh = false): Observable<SingleApiKeyDashboardResponse> {
    const headers = this.getAuthHeaders();
    const dashboardUrl = `${environment.baseApiUrl}/api/v1/dashboard/v2/api-key/${apiKeyId}?refresh=${refresh}`;
    
    
    return this.http.get<ApiResponseWrapper<SingleApiKeyDashboardResponse>>(dashboardUrl, { headers }).pipe(
      map(response => response.data), // Extract data from wrapper
      tap(response => console.log('🌐 HTTP response received:', response)),
      catchError(this.handleError<SingleApiKeyDashboardResponse>('getApiKeyDashboard'))
    );
  }

  /**
   * Transform API key dashboard response to match current template structure
   */
  
  /**
   * Transform API key dashboard response to match current template structure
   */
  transformApiKeyDashboard(apiResponse: SingleApiKeyDashboardResponse): TransformedApiKeyDashboard {
    // Calculate daily limit from monthly quota (assuming 30 days per month)
    const dailyLimit = Math.round((apiResponse.monthlyMetrics?.quotaLimit || 1000) / 30);
    const remainingToday = Math.max(dailyLimit - (apiResponse.requestsToday || 0), 0);
    
    // Calculate usage percentage for monthly metrics
    const monthlyUsagePercentage = apiResponse.monthlyMetrics?.quotaLimit 
      ? Math.round(((apiResponse.monthlyMetrics.quotaLimit - apiResponse.monthlyMetrics.remainingQuota) / apiResponse.monthlyMetrics.quotaLimit) * 100)
      : 0;
    
    // Calculate success rate (assuming all calls are successful if no error data)
    const successRate = apiResponse.monthlyMetrics?.totalCalls 
      ? Math.round((apiResponse.monthlyMetrics.totalCalls / apiResponse.monthlyMetrics.totalCalls) * 100)
      : 100;
    
    return {
      usage: {
        requestsToday: apiResponse.requestsToday || 0,
        requestsYesterday: apiResponse.requestsYesterday || 0,
        remainingToday: remainingToday,
        requestsThisMonth: apiResponse.monthlyMetrics?.totalCalls || 0,
        lastUsed: apiResponse.lastUsed || 'Never',
        rateLimitStatus: 'OK' // Default since rateLimitInfo is not provided
      },
      performance: {
        averageResponseTime: apiResponse.performanceMetrics?.avgResponseTime7Days || 0,
        errorRate24h: apiResponse.performanceMetrics?.errorRate24h || 0,
        uptime: 100, // Default to 100% since not provided
        performanceStatus: 'OK', // Default since not provided
        lastError: null, // Default since not provided
        consecutiveSuccessfulCalls: 0 // Default since not provided
      },
      monthlyMetrics: {
        usagePercentage: monthlyUsagePercentage,
        totalCalls: apiResponse.monthlyMetrics?.totalCalls || 0,
        successfulCalls: apiResponse.monthlyMetrics?.totalCalls || 0, // Assume all successful
        failedCalls: 0, // Default since not provided
        quotaLimit: apiResponse.monthlyMetrics?.quotaLimit || 1000,
        remainingQuota: apiResponse.monthlyMetrics?.remainingQuota || 1000,
        successRate: successRate,
        estimatedDaysToQuotaExhaustion: this.calculateDaysToExhaustion(
          apiResponse.monthlyMetrics?.remainingQuota || 1000,
          apiResponse.requestsToday || 0
        ),
        quotaStatus: this.getQuotaStatus(monthlyUsagePercentage)
      },
      rateLimitInfo: {
        tier: 'FREE', // Default since not provided
        currentWindowRequests: apiResponse.requestsToday || 0,
        windowLimit: dailyLimit,
        windowResetTime: this.getNextDayResetTime(),
        rateLimitStatus: 'OK', // Default since not provided
        rateLimitUtilization: Math.round(((apiResponse.requestsToday || 0) / dailyLimit) * 100)
      },
      overallHealthStatus: this.calculateOverallHealthStatus(apiResponse),
      todayVsYesterdayChange: apiResponse.todayVsYesterdayChange || 0,
      pendingRequests: apiResponse.pendingRequests || 0,
      status: apiResponse.status || 'active',
      registeredDomain: apiResponse.registeredDomain || 'N/A'
    };
  }

  /**
   * Calculate days to quota exhaustion based on current usage
   */
  private calculateDaysToExhaustion(remainingQuota: number, dailyUsage: number): number {
    if (dailyUsage <= 0) return 999; // Infinite if no usage
    return Math.ceil(remainingQuota / dailyUsage);
  }

  /**
   * Get quota status based on usage percentage
   */
  private getQuotaStatus(usagePercentage: number): string {
    if (usagePercentage >= 90) return 'CRITICAL';
    if (usagePercentage >= 75) return 'WARNING';
    return 'OK';
  }

  /**
   * Get next day reset time (midnight tomorrow)
   */
  private getNextDayResetTime(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  }

  /**
   * Calculate overall health status based on API response
   */
  private calculateOverallHealthStatus(apiResponse: SingleApiKeyDashboardResponse): string {
    const errorRate = apiResponse.performanceMetrics?.errorRate24h || 0;
    const usagePercentage = apiResponse.usagePercentage || 0;
    
    if (errorRate > 10 || usagePercentage > 90) return 'CRITICAL';
    if (errorRate > 5 || usagePercentage > 75) return 'WARNING';
    return 'OK';
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
    return this.http.patch<BackendApiKey>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      tap(response => {
        console.log('API key status updated successfully:', id, status, 'Backend response:', response);
        
        // Update the specific API key status in the current list
        const currentKeys = this.getCurrentApiKeys();
        const updatedKeys = currentKeys.map(key => {
          if (key.id === id) {
            return {
              ...key,
              // Use the backend response to determine the actual status
              status: response ? this.determineApiKeyStatus(response) : status as 'ACTIVE' | 'REVOKED' | 'SUSPENDED' | 'EXPIRED',
              isActive: response ? (response.active ?? response.isActive) : (status === 'ACTIVE'),
              revokedAt: response?.revokedAt || (status === 'REVOKED' ? new Date().toISOString() : undefined),
              updatedAt: response?.updatedAt || new Date().toISOString()
            };
          }
          return key;
        });
        
        // Update the API keys list with the specific change
        this.updateApiKeys(updatedKeys);
      }),
      catchError(error => {
        console.error('Error updating API key status:', error);
        return throwError(() => error);
      })
    );
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
   * Determine API key status based on backend data
   */
  private determineApiKeyStatus(backendKey: BackendApiKey): 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED' {
    // Get the active status from either 'active' or 'isActive' field first
    const isActive = backendKey.active ?? backendKey.isActive ?? false;
    
    // Check if the key is expired
    if (backendKey.expiresAt) {
      const expiryDate = new Date(backendKey.expiresAt);
      const now = new Date();
      if (expiryDate <= now) {
        console.log(`API Key ${backendKey.id} status: EXPIRED (expiresAt: ${backendKey.expiresAt})`);
        return 'EXPIRED';
      }
    }
    
    // Check if the key is revoked - but only if active is false
    // If active is true, the key should be considered active regardless of revokedAt timestamp
    if (backendKey.revokedAt && !isActive) {
      console.log(`API Key ${backendKey.id} status: REVOKED (revokedAt: ${backendKey.revokedAt}, active: ${isActive})`);
      return 'REVOKED';
    }
    
    // For newly created keys (created within the last 5 minutes) that haven't been used yet,
    // treat them as ACTIVE even if active is false, as this might be a backend timing issue
    const createdDate = new Date(backendKey.createdAt);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const isNewlyCreated = createdDate >= fiveMinutesAgo;
    const hasNeverBeenUsed = !backendKey.lastUsedAt;
    
    if (isNewlyCreated && hasNeverBeenUsed && !isActive) {
      // This is likely a newly created key that hasn't been activated yet
      // Treat it as ACTIVE for better UX
      console.log(`API Key ${backendKey.id} status: ACTIVE (newly created override - active: ${isActive}, created: ${backendKey.createdAt})`);
      return 'ACTIVE';
    }
    
    // Default behavior: use active flag
    const finalStatus = isActive ? 'ACTIVE' : 'SUSPENDED';
    console.log(`API Key ${backendKey.id} status: ${finalStatus} (active: ${isActive}, revokedAt: ${backendKey.revokedAt || 'null'})`);
    return finalStatus;
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
   * Check if an API key can be decrypted (has encrypted value, user is authenticated, and environment supports it)
   * @param apiKey The API key to check
   * @returns boolean True if the API key can be decrypted
   */
  canDecryptApiKey(apiKey: ApiKey): boolean {
    return !!(
      apiKey.encryptedKeyValue && 
      this.getCurrentUserId() && 
      this.encryptionService.isDecryptionAvailable()
    );
  }

  /**
   * Get environment information for decryption debugging
   * @returns Environment compatibility information
   */
  getDecryptionEnvironmentInfo(): any {
    return this.encryptionService.getEnvironmentInfo();
  }

  /**
   * Get HTTP headers with authentication for dashboard API calls
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Map rate limit status from API to internal format
   */
  private mapRateLimitStatus(status: string): 'OK' | 'WARNING' | 'EXCEEDED' {
    switch (status.toLowerCase()) {
      case 'normal':
      case 'ok':
        return 'OK';
      case 'warning':
        return 'WARNING';
      case 'exceeded':
      case 'limit_exceeded':
        return 'EXCEEDED';
      default:
        return 'OK';
    }
  }

  /**
   * Error handling for dashboard API calls
   */
  private handleError<T>(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Log error details
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        console.error('Client-side error:', error.error.message);
      } else {
        // Server-side error
        console.error(`Server returned code ${error.status}, body was:`, error.error);
      }

      // Return empty result to let the app continue
      return throwError(() => error);
    };
  }
}