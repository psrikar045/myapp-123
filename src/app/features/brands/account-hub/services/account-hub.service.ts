import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AccountHubData, DashboardStats, RecentProject } from '../models/dashboard.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class AccountHubService {
  private readonly apiUrl = `${environment.baseApiUrl}/api/v1/account`;
  private dashboardDataSubject = new BehaviorSubject<AccountHubData | null>(null);
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
   * Get complete account hub data
   */
  getAccountHubData(): Observable<AccountHubData> {
    // For development, use mock data
    if (!environment.production) {
      return this.mockDataService.getMockAccountHubData();
    }
    return this.http.get<AccountHubData>(`${this.apiUrl}/dashboard`);
  }

  /**
   * Update dashboard data in service
   */
  updateDashboardData(data: AccountHubData): void {
    this.dashboardDataSubject.next(data);
  }

  /**
   * Get current dashboard data
   */
  getCurrentDashboardData(): AccountHubData | null {
    return this.dashboardDataSubject.value;
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboard(): Observable<AccountHubData> {
    const data$ = this.getAccountHubData();
    data$.subscribe(data => this.updateDashboardData(data));
    return data$;
  }
}