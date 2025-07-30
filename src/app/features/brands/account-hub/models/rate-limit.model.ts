export interface RateLimitHeaders {
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  resetTime: number;
  tier: string;
  usage24h: Array<{timestamp: string, requests: number}>;
}

export interface UsageAnalytics {
  totalRequests: number;
  successRate: number;
  errorBreakdown: Record<string, number>;
  dailyUsage: Array<{date: string, requests: number}>;
  topEndpoints: Array<{endpoint: string, count: number}>;
  rateLimitHits: number;
}

export const RATE_LIMIT_TIERS: RateLimitTier[] = [
  {
    tier: 'BASIC',
    requestsPerDay: 100,
    description: 'Basic tier for development'
  },
  {
    tier: 'STANDARD',
    requestsPerDay: 1000,
    description: 'Standard tier for small applications'
  },
  {
    tier: 'PREMIUM',
    requestsPerDay: 10000,
    description: 'Premium tier for production applications'
  },
  {
    tier: 'ENTERPRISE',
    requestsPerDay: 50000,
    description: 'Enterprise tier for high-volume applications'
  },
  {
    tier: 'UNLIMITED',
    requestsPerDay: Infinity,
    description: 'No rate limits (admin only)'
  }
];

export interface RateLimitTier {
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE' | 'UNLIMITED';
  requestsPerDay: number;
  description: string;
}