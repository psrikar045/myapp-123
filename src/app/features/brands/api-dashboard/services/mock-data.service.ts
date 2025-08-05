import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
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
        current: 12345,
        change: '+10%',
        trend: 'up'
      },
      activeProjects: {
        current: 5,
        change: '+5%',
        trend: 'up'
      },
      brandsAdded: {
        current: 2,
        change: '+2%',
        trend: 'up'
      },
      remainingQuota: {
        current: 10000,
        percentage: 75,
        total: 13333,
        resetDate: '2024-12-31'
      }
    };

    return of(stats); // No delay
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

    return of({ projects }); // No delay
  }

  /**
   * Get mock API keys
   */
  getMockApiKeys(): Observable<{ keys: ApiKey[] }> {
    const keys: ApiKey[] = [
      // mycompany.com domain - Production
      {
        id: '1',
        name: 'mk_prod_1234',
        description: 'Production API key for main application',
        prefix: 'mk_prod',
        keyPreview: 'mk_prod_************************1234',
        maskedKey: 'mk_prod_************************1234',
        isActive: true,
        registeredDomain: 'mycompany.com',
        tier: 'PREMIUM',
        environment: 'production',
        scopes: ['READ_BRANDS', 'READ_CATEGORIES', 'BUSINESS_READ'],
        allowedIps: ['192.168.1.0/24'],
        allowedDomains: ['mycompany.com'],
        usage: {
          requestsToday: 1247,
          remainingToday: 8753,
          lastUsed: '2023-11-15T08:30:00Z',
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
          allowedOrigins: ['https://mycompany.com']
        },
        expiresAt: '2024-12-31T23:59:59Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2023-11-15T08:30:00Z',
        lastUsedAt: '2023-11-15T08:30:00Z',
        status: 'ACTIVE'
      },
      // mycompany.com domain - Staging
      {
        id: '2',
        name: 'mk_test_5678',
        description: 'Staging API key for testing',
        prefix: 'mk_test',
        keyPreview: 'mk_test_************************5678',
        maskedKey: 'mk_test_************************5678',
        isActive: false,
        registeredDomain: 'staging.mycompany.com',
        tier: 'STANDARD',
        environment: 'staging',
        scopes: ['READ_BRANDS', 'READ_CATEGORIES'],
        allowedIps: [],
        allowedDomains: ['staging.mycompany.com'],
        usage: {
          requestsToday: 156,
          remainingToday: 844,
          lastUsed: '2023-10-20T12:15:00Z',
          rateLimitStatus: 'OK'
        },
        security: {
          ipRestrictions: {
            enabled: false,
            whitelist: []
          },
          domainRestrictions: {
            enabled: true,
            allowedDomains: ['mycompany.com']
          },
          webhookUrls: [],
          allowedOrigins: ['https://staging.mycompany.com']
        },
        expiresAt: '2024-12-31T23:59:59Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2023-10-20T12:15:00Z',
        lastUsedAt: '2023-10-20T12:15:00Z',
        status: 'SUSPENDED'
      },
      // mycompany.com domain - Development
      {
        id: '6',
        name: 'mk_dev_mycompany',
        maskedKey: 'mk_dev_************************comp',
        tier: 'BASIC',
        environment: 'development',
        scopes: ['READ_BRANDS'],
        usage: {
          requestsToday: 45,
          remainingToday: 155,
          lastUsed: '2024-01-15T09:30:00Z',
          rateLimitStatus: 'OK'
        },
        security: {
          ipRestrictions: {
            enabled: false,
            whitelist: []
          },
          domainRestrictions: {
            enabled: true,
            allowedDomains: ['mycompany.com']
          },
          webhookUrls: [],
          allowedOrigins: ['https://dev.mycompany.com']
        },
        expiresAt: '2024-12-31T23:59:59Z',
        createdAt: '2024-01-12T00:00:00Z',
        status: 'ACTIVE'
      },
      // techcorp.io domain - Production
      {
        id: '4',
        name: 'mk_prod_3456',
        maskedKey: 'mk_prod_************************3456',
        tier: 'STANDARD',
        environment: 'production',
        scopes: ['READ_BRANDS', 'READ_CATEGORIES'],
        usage: {
          requestsToday: 324,
          remainingToday: 676,
          lastUsed: '2023-08-12T16:20:00Z',
          rateLimitStatus: 'OK'
        },
        security: {
          ipRestrictions: {
            enabled: true,
            whitelist: ['10.0.0.0/8']
          },
          domainRestrictions: {
            enabled: true,
            allowedDomains: ['techcorp.io']
          },
          webhookUrls: [],
          allowedOrigins: ['https://techcorp.io']
        },
        expiresAt: '2024-12-31T23:59:59Z',
        createdAt: '2024-01-10T00:00:00Z',
        status: 'ACTIVE'
      },
      // techcorp.io domain - Development
      {
        id: '3',
        name: 'mk_dev_9012',
        maskedKey: 'mk_dev_************************9012',
        tier: 'BASIC',
        environment: 'development',
        scopes: ['READ_BRANDS'],
        usage: {
          requestsToday: 89,
          remainingToday: 11,
          lastUsed: '2023-09-05T14:45:00Z',
          rateLimitStatus: 'WARNING'
        },
        security: {
          ipRestrictions: {
            enabled: false,
            whitelist: []
          },
          domainRestrictions: {
            enabled: true,
            allowedDomains: ['techcorp.io']
          },
          webhookUrls: [],
          allowedOrigins: ['https://dev.techcorp.io']
        },
        expiresAt: '2024-02-15T23:59:59Z',
        createdAt: '2024-01-15T00:00:00Z',
        status: 'ACTIVE'
      },
      // techcorp.io domain - Testing
      {
        id: '7',
        name: 'mk_test_techcorp',
        maskedKey: 'mk_test_************************tech',
        tier: 'STANDARD',
        environment: 'testing',
        scopes: ['READ_BRANDS'],
        usage: {
          requestsToday: 12,
          remainingToday: 88,
          lastUsed: '2024-01-14T22:15:00Z',
          rateLimitStatus: 'OK'
        },
        security: {
          ipRestrictions: {
            enabled: false,
            whitelist: []
          },
          domainRestrictions: {
            enabled: true,
            allowedDomains: ['techcorp.io']
          },
          webhookUrls: [],
          allowedOrigins: ['https://test.techcorp.io']
        },
        expiresAt: '2024-12-31T23:59:59Z',
        createdAt: '2023-12-01T00:00:00Z',
        status: 'ACTIVE'
      },
      // startup.dev domain - Staging
      {
        id: '5',
        name: 'mk_test_7890',
        maskedKey: 'mk_test_************************7890',
        tier: 'PREMIUM',
        environment: 'staging',
        scopes: ['READ_BRANDS', 'READ_CATEGORIES', 'MOBILE_ACCESS'],
        usage: {
          requestsToday: 2156,
          remainingToday: 7844,
          lastUsed: '2023-07-28T17:45:00Z',
          rateLimitStatus: 'OK'
        },
        security: {
          ipRestrictions: {
            enabled: false,
            whitelist: []
          },
          domainRestrictions: {
            enabled: true,
            allowedDomains: ['startup.dev']
          },
          webhookUrls: [],
          allowedOrigins: ['https://startup.dev']
        },
        expiresAt: '2024-06-30T23:59:59Z',
        createdAt: '2024-01-05T00:00:00Z',
        status: 'SUSPENDED'
      },
      // ecommerce.shop domain - Production
      {
        id: '8',
        name: 'mk_ecommerce_prod',
        maskedKey: 'mk_ecommerce_****************shop',
        tier: 'PREMIUM',
        environment: 'production',
        scopes: ['READ_BRANDS', 'READ_CATEGORIES', 'WEBHOOK_ACCESS'],
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
            enabled: true,
            allowedDomains: ['ecommerce.shop']
          },
          webhookUrls: ['https://webhook.ecommerce.shop/api/brands'],
          allowedOrigins: ['https://ecommerce.shop']
        },
        expiresAt: '2024-12-31T23:59:59Z',
        createdAt: '2024-01-08T00:00:00Z',
        status: 'ACTIVE'
      }
    ];

    return of({ keys }); // No delay for instant loading
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

    return of(data); // No delay
  }

  /**
   * Get mock API key by ID
   */
  getMockApiKeyById(id: string): Observable<ApiKey> {
    // Use the same data as getMockApiKeys for consistency
    return this.getMockApiKeys().pipe(
      map(response => {
        const apiKey = response.keys.find(key => key.id === id);
        if (!apiKey) {
          throw new Error(`API key with ID ${id} not found`);
        }
        return apiKey;
      })
    );
  }
}