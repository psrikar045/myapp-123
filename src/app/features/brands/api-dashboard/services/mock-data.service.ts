import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ApiDashboardData, DashboardStats, RecentProject } from '../models/dashboard.model';
import { ApiKey } from '../models/api-key.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  /**
   * Get mock dashboard stats
   */
  getMockDashboardStats(): Observable<DashboardStats> {
    const stats: DashboardStats = {
      apiCalls: {
        current: 12847,
        change: '+12%',
        trend: 'up'
      },
      activeProjects: {
        current: 23,
        change: '+3',
        trend: 'up'
      },
      brandsAdded: {
        current: 8,
        change: '+2',
        trend: 'up'
      },
      remainingQuota: {
        current: 87153,
        percentage: 73,
        total: 100000,
        resetDate: '2024-03-01'
      }
    };

    return of(stats).pipe(delay(500));
  }

  /**
   * Get mock recent projects
   */
  getMockRecentProjects(): Observable<{ projects: RecentProject[] }> {
    const projects: RecentProject[] = [
      {
        id: '1',
        name: 'TechCorp Rebrand',
        status: 'Active',
        type: 'Brand Identity',
        lastUpdated: '2024-01-15T10:30:00Z',
        description: 'Complete rebranding project for TechCorp including logo and guidelines'
      },
      {
        id: '2',
        name: 'Startup Logo Design',
        status: 'In Review',
        type: 'Logo Design',
        lastUpdated: '2024-01-14T15:45:00Z',
        description: 'Modern logo design for emerging startup'
      },
      {
        id: '3',
        name: 'E-commerce Brand Guide',
        status: 'Completed',
        type: 'Brand Guidelines',
        lastUpdated: '2024-01-12T09:20:00Z',
        description: 'Comprehensive brand guidelines for e-commerce platform'
      },
      {
        id: '4',
        name: 'App Icon Design',
        status: 'Active',
        type: 'Icon Design',
        lastUpdated: '2024-01-10T14:15:00Z',
        description: 'Mobile app icon design and variations'
      }
    ];

    return of({ projects }).pipe(delay(300));
  }

  /**
   * Get mock API keys
   */
  getMockApiKeys(): Observable<{ keys: ApiKey[] }> {
    const keys: ApiKey[] = [
      {
        id: '1',
        name: 'Production API Key',
        maskedKey: 'mk_prod_************************ab12',
        tier: 'PREMIUM',
        scopes: ['READ_BRANDS', 'READ_CATEGORIES', 'BUSINESS_READ'],
        usage: {
          requestsToday: 1247,
          remainingToday: 8753,
          lastUsed: '2024-01-15T08:30:00Z',
          rateLimitStatus: 'OK'
        },
        security: {
          ipRestrictions: {
            enabled: true,
            whitelist: ['192.168.1.0/24']
          },
          domainRestrictions: {
            enabled: true,
            allowedDomains: ['mycompany.com']
          },
          webhookUrls: [],
          allowedOrigins: ['https://myapp.com']
        },
        expiresAt: '2024-12-31T23:59:59Z',
        createdAt: '2024-01-01T00:00:00Z',
        status: 'ACTIVE'
      },
      {
        id: '2',
        name: 'Development API Key',
        maskedKey: 'mk_dev_************************cd34',
        tier: 'STANDARD',
        scopes: ['READ_BRANDS', 'READ_CATEGORIES'],
        usage: {
          requestsToday: 156,
          remainingToday: 844,
          lastUsed: '2024-01-15T12:15:00Z',
          rateLimitStatus: 'OK'
        },
        security: {
          ipRestrictions: {
            enabled: false,
            whitelist: []
          },
          domainRestrictions: {
            enabled: false,
            allowedDomains: []
          },
          webhookUrls: [],
          allowedOrigins: []
        },
        createdAt: '2024-01-01T00:00:00Z',
        status: 'ACTIVE'
      },
      {
        id: '3',
        name: 'Testing API Key',
        maskedKey: 'mk_test_************************ef56',
        tier: 'BASIC',
        scopes: ['READ_BRANDS'],
        usage: {
          requestsToday: 89,
          remainingToday: 11,
          lastUsed: '2024-01-15T14:45:00Z',
          rateLimitStatus: 'WARNING'
        },
        security: {
          ipRestrictions: {
            enabled: false,
            whitelist: []
          },
          domainRestrictions: {
            enabled: false,
            allowedDomains: []
          },
          webhookUrls: [],
          allowedOrigins: []
        },
        expiresAt: '2024-02-15T23:59:59Z',
        createdAt: '2024-01-15T00:00:00Z',
        status: 'ACTIVE'
      },
      {
        id: '4',
        name: 'Staging API Key',
        maskedKey: 'mk_stage_**********************gh78',
        tier: 'STANDARD',
        scopes: ['READ_BRANDS', 'READ_CATEGORIES'],
        usage: {
          requestsToday: 324,
          remainingToday: 676,
          lastUsed: '2024-01-15T16:20:00Z',
          rateLimitStatus: 'OK'
        },
        security: {
          ipRestrictions: {
            enabled: true,
            whitelist: ['10.0.0.0/8']
          },
          domainRestrictions: {
            enabled: false,
            allowedDomains: []
          },
          webhookUrls: [],
          allowedOrigins: ['https://staging.myapp.com']
        },
        createdAt: '2024-01-10T00:00:00Z',
        status: 'ACTIVE'
      },
      {
        id: '5',
        name: 'Mobile App API Key',
        maskedKey: 'mk_mobile_********************ij90',
        tier: 'PREMIUM',
        scopes: ['READ_BRANDS', 'READ_CATEGORIES', 'MOBILE_ACCESS'],
        usage: {
          requestsToday: 2156,
          remainingToday: 7844,
          lastUsed: '2024-01-15T17:45:00Z',
          rateLimitStatus: 'OK'
        },
        security: {
          ipRestrictions: {
            enabled: false,
            whitelist: []
          },
          domainRestrictions: {
            enabled: false,
            allowedDomains: []
          },
          webhookUrls: [],
          allowedOrigins: []
        },
        expiresAt: '2024-06-30T23:59:59Z',
        createdAt: '2024-01-05T00:00:00Z',
        status: 'ACTIVE'
      },
      {
        id: '6',
        name: 'Analytics API Key',
        maskedKey: 'mk_analytics_*****************kl12',
        tier: 'BASIC',
        scopes: ['READ_ANALYTICS'],
        usage: {
          requestsToday: 45,
          remainingToday: 55,
          lastUsed: '2024-01-15T09:30:00Z',
          rateLimitStatus: 'WARNING'
        },
        security: {
          ipRestrictions: {
            enabled: true,
            whitelist: ['203.0.113.0/24']
          },
          domainRestrictions: {
            enabled: true,
            allowedDomains: ['analytics.mycompany.com']
          },
          webhookUrls: [],
          allowedOrigins: ['https://analytics.mycompany.com']
        },
        expiresAt: '2024-03-31T23:59:59Z',
        createdAt: '2024-01-12T00:00:00Z',
        status: 'ACTIVE'
      },
      {
        id: '7',
        name: 'Legacy API Key',
        maskedKey: 'mk_legacy_*******************mn34',
        tier: 'STANDARD',
        scopes: ['READ_BRANDS'],
        usage: {
          requestsToday: 12,
          remainingToday: 988,
          lastUsed: '2024-01-14T22:15:00Z',
          rateLimitStatus: 'OK'
        },
        security: {
          ipRestrictions: {
            enabled: false,
            whitelist: []
          },
          domainRestrictions: {
            enabled: false,
            allowedDomains: []
          },
          webhookUrls: [],
          allowedOrigins: []
        },
        createdAt: '2023-12-01T00:00:00Z',
        status: 'EXPIRED'
      },
      {
        id: '8',
        name: 'Webhook API Key',
        maskedKey: 'mk_webhook_******************op56',
        tier: 'PREMIUM',
        scopes: ['WEBHOOK_ACCESS', 'READ_BRANDS'],
        usage: {
          requestsToday: 567,
          remainingToday: 9433,
          lastUsed: '2024-01-15T18:00:00Z',
          rateLimitStatus: 'OK'
        },
        security: {
          ipRestrictions: {
            enabled: true,
            whitelist: ['198.51.100.0/24']
          },
          domainRestrictions: {
            enabled: false,
            allowedDomains: []
          },
          webhookUrls: ['https://webhook.myapp.com/api/brands'],
          allowedOrigins: []
        },
        expiresAt: '2024-12-31T23:59:59Z',
        createdAt: '2024-01-08T00:00:00Z',
        status: 'ACTIVE'
      }
    ];

    return of({ keys }).pipe(delay(400));
  }

  /**
   * Get complete mock API dashboard data
   */
  getMockApiDashboardData(): Observable<ApiDashboardData> {
    const data: ApiDashboardData = {
      user: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'assets/avatars/john-doe.jpg'
      },
      stats: {
        apiCalls: {
          current: 12847,
          change: '+12%',
          trend: 'up'
        },
        activeProjects: {
          current: 23,
          change: '+3',
          trend: 'up'
        },
        brandsAdded: {
          current: 8,
          change: '+2',
          trend: 'up'
        },
        remainingQuota: {
          current: 87153,
          percentage: 73,
          total: 100000,
          resetDate: '2024-03-01'
        }
      },
      recentProjects: [
        {
          id: '1',
          name: 'TechCorp Rebrand',
          status: 'Active',
          type: 'Brand Identity',
          lastUpdated: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'Startup Logo Design',
          status: 'In Review',
          type: 'Logo Design',
          lastUpdated: '2024-01-14T15:45:00Z'
        },
        {
          id: '3',
          name: 'E-commerce Brand Guide',
          status: 'Completed',
          type: 'Brand Guidelines',
          lastUpdated: '2024-01-12T09:20:00Z'
        }
      ],
      apiKeys: [
        {
          id: '1',
          name: 'Production API Key',
          maskedKey: 'mk_prod_************************ab12',
          environment: 'production',
          usage: {
            current: 1247,
            limit: 10000,
            percentage: 12.47
          },
          status: 'active',
          lastUsed: '2024-01-15T08:30:00Z'
        },
        {
          id: '2',
          name: 'Development API Key',
          maskedKey: 'mk_dev_************************cd34',
          environment: 'development',
          usage: {
            current: 156,
            limit: 1000,
            percentage: 15.6
          },
          status: 'active',
          lastUsed: '2024-01-15T12:15:00Z'
        }
      ]
    };

    return of(data).pipe(delay(600));
  }
}