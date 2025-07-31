import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiDashboardData, DashboardStats, RecentProject } from '../models/dashboard.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class ApiDashboardService {
  private readonly apiUrl = `${environment.baseApiUrl}/api/v1/account`;
  private dashboardDataSubject = new BehaviorSubject<ApiDashboardData | null>(null);
  public dashboardData$ = this.dashboardDataSubject.asObservable();

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService
  ) {}

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    // For development, use mock data
    if (!environment.production) {
      return this.mockDataService.getMockDashboardStats();
    }
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Get recent projects
   */
  getRecentProjects(): Observable<{ projects: RecentProject[] }> {
    // For development, use mock data
    if (!environment.production) {
      return this.mockDataService.getMockRecentProjects();
    }
    return this.http.get<{ projects: RecentProject[] }>(`${this.apiUrl}/projects/recent`);
  }

  /**
   * Get complete API dashboard data
   */
  getApiDashboardData(): Observable<ApiDashboardData> {
    // For development, use mock data
    if (!environment.production) {
      return this.mockDataService.getMockApiDashboardData();
    }
    return this.http.get<ApiDashboardData>(`${this.apiUrl}/dashboard`);
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
    const data$ = this.getApiDashboardData();
    data$.subscribe(data => this.updateDashboardData(data));
    return data$;
  }
}