import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ApiDashboardData, DashboardStats, RecentProject } from '../models/dashboard.model';
import { UserDashboardCardsResponse, TransformedDashboardStats, ApiResponseWrapper } from '../models/dashboard-api.model';
import { MockDataService } from './mock-data.service';
import { AuthService } from '../../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiDashboardService {
  private readonly apiUrl = `${environment.baseApiUrl}/api/v1/dashboard`;
  private dashboardDataSubject = new BehaviorSubject<ApiDashboardData | null>(null);
  public dashboardData$ = this.dashboardDataSubject.asObservable();

  // Cache for dashboard data
  private dashboardCache: Record<string, { data: any; timestamp: number }> = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService,
    private authService: AuthService
  ) {}

  /**
   * Get HTTP headers with authentication
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(cacheKey: string): boolean {
    const cached = this.dashboardCache[cacheKey];
    if (!cached) return false;
    return (Date.now() - cached.timestamp) < this.CACHE_DURATION;
  }

  /**
   * Get cached data or null if invalid
   */
  private getCachedData<T>(cacheKey: string): T | null {
    if (this.isCacheValid(cacheKey)) {
      return this.dashboardCache[cacheKey].data as T;
    }
    return null;
  }

  /**
   * Cache data with timestamp
   */
  private setCachedData<T>(cacheKey: string, data: T): void {
    this.dashboardCache[cacheKey] = {
      data,
      timestamp: Date.now()
    };
  }

  /**
   * Get user dashboard cards from API
   */
  getUserDashboardCards(refresh = false): Observable<UserDashboardCardsResponse> {
    const cacheKey = 'user-dashboard-cards';
    
    // Check cache first if not forcing refresh
    if (!refresh) {
      const cachedData = this.getCachedData<UserDashboardCardsResponse>(cacheKey);
      if (cachedData) {
        return of(cachedData);
      }
    }

    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponseWrapper<UserDashboardCardsResponse>>(
      `${this.apiUrl}/v2/user/cards?refresh=${refresh}`,
      { headers }
    ).pipe(
      map(response => response.data), // Extract data from wrapper
      tap(data => this.setCachedData(cacheKey, data)),
      catchError(this.handleError<UserDashboardCardsResponse>('getUserDashboardCards'))
    );
  }

  /**
   * Transform API response to current dashboard stats format (with null safety)
   */
  private transformToDashboardStats(apiResponse: UserDashboardCardsResponse): DashboardStats {
    // Default values for all stats
    const defaultStats: DashboardStats = {
      apiCalls: { current: 0, change: '+0%', trend: 'neutral' },
      activeProjects: { current: 0, change: '+0%', trend: 'neutral' },
      brandsAdded: { current: 0, change: '+0%', trend: 'neutral' },
      remainingQuota: { current: 0, percentage: 0, total: 1, resetDate: new Date().toISOString() }
    };

    // API Calls stats
    if (apiResponse?.totalApiCalls) {
      defaultStats.apiCalls = {
        current: apiResponse.totalApiCalls.totalCalls || 0,
        change: this.formatPercentageChange(apiResponse.totalApiCalls.percentageChange || 0),
        trend: this.mapTrend(apiResponse.totalApiCalls.trend || 'neutral')
      };
    }

    // Active Projects stats
    if (apiResponse?.activeDomains) {
      defaultStats.activeProjects = {
        current: apiResponse.activeDomains.activeDomains || 0,
        change: this.formatPercentageChange(apiResponse.activeDomains.percentageChange || 0),
        trend: this.mapTrend(apiResponse.activeDomains.trend || 'neutral')
      };
    }

    // Brands Added stats
    if (apiResponse?.domainsAdded) {
      defaultStats.brandsAdded = {
        current: apiResponse.domainsAdded.domainsAdded || 0,
        change: this.formatPercentageChange(apiResponse.domainsAdded.percentageChange || 0),
        trend: this.mapTrend(apiResponse.domainsAdded.trend || 'neutral')
      };
    }

    // Remaining Quota stats
    if (apiResponse?.remainingQuota) {
      const remaining = apiResponse.remainingQuota.remainingQuota || 0;
      const total = apiResponse.remainingQuota.totalQuota || 1; // Prevent division by zero
      const percentage = total > 0 ? Math.round(((total - remaining) / total) * 100) : 0;
      
      defaultStats.remainingQuota = {
        current: remaining,
        percentage: Math.max(0, Math.min(100, percentage)), // Clamp between 0-100
        total: total,
        resetDate: this.calculateResetDate(apiResponse.remainingQuota.estimatedDaysRemaining || 30)
      };
    }

    return defaultStats;
  }

  /**
   * Get dashboard statistics (transformed from API)
   */
  getDashboardStats(refresh = false): Observable<DashboardStats> {
    return this.getUserDashboardCards(refresh).pipe(
      map(apiResponse => this.transformToDashboardStats(apiResponse)),
      catchError(() => {
        // Fallback to mock data if API fails
        // console.warn('API failed, falling back to mock data');
        return this.mockDataService.getMockDashboardStats();
      })
    );
  }

  /**
   * Get recent projects (still using mock data)
   */
  getRecentProjects(): Observable<{ projects: RecentProject[] }> {
    // Keep using mock data for recent projects as API endpoint not specified
    return this.mockDataService.getMockRecentProjects();
  }

  /**
   * Get complete API dashboard data
   */
  getApiDashboardData(refresh = false): Observable<ApiDashboardData> {
    return this.getUserDashboardCards(refresh).pipe(
      map(apiResponse => ({
        user: {
          name: 'User', // This should come from auth service
          email: 'user@example.com' // This should come from auth service
        },
        stats: this.transformToDashboardStats(apiResponse),
        recentProjects: [], // Will be populated by separate call
        apiKeys: [] // Will be populated by separate call
      })),
      catchError(() => {
        // Fallback to mock data if API fails
        // console.warn('API failed, falling back to mock data');
        return this.mockDataService.getMockApiDashboardData();
      })
    );
  }

  /**
   * Update dashboard data in service
   */
  updateDashboardData(data: ApiDashboardData): void {
    this.dashboardDataSubject.next(data);
  }

  /**
   * Get current dashboard data
   */
  getCurrentDashboardData(): ApiDashboardData | null {
    return this.dashboardDataSubject.value;
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboard(): Observable<ApiDashboardData> {
    const data$ = this.getApiDashboardData(true); // Force refresh
    data$.subscribe(data => this.updateDashboardData(data));
    return data$;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.dashboardCache = {};
  }

  /**
   * Utility methods for data transformation
   */
  private formatPercentageChange(percentage: number): string {
    if (percentage === 0) return '0%';
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  }

  private mapTrend(trend: string): 'up' | 'down' | 'neutral' {
    switch (trend.toLowerCase()) {
      case 'up': return 'up';
      case 'down': return 'down';
      default: return 'neutral';
    }
  }

  private calculateResetDate(daysRemaining: number): string {
    const resetDate = new Date();
    resetDate.setDate(resetDate.getDate() + daysRemaining);
    return resetDate.toISOString();
  }

  /**
   * Error handling
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