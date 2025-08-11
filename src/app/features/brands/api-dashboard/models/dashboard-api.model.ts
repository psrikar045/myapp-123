// API Response Models for Dashboard Integration

// Wrapper interfaces for actual API responses (with success, timestamp, etc.)
export interface ApiResponseWrapper<T> {
  data: T;
  success: boolean;
  implementation: string;
  timestamp: string;
}

// Updated to match actual API response structure
export interface UserDashboardCardsResponse {
  totalApiCalls: {
    totalCalls: number;
    percentageChange: number;
    trend: string;
    previousPeriodCalls: number;
    dailyAverage: number;
    status: string;
  };
  activeDomains: {
    activeDomains: number;
    percentageChange: number;
    trend: string;
    previousPeriodDomains: number;
    newDomainsThisPeriod: number;
    status: string;
  };
  domainsAdded: {
    domainsAdded: number;
    percentageChange: number;
    trend: string;
    previousMonthAdded: number;
    monthlyTarget: number;
    status: string;
  };
  remainingQuota: {
    remainingQuota: number;
    percentageChange: number;
    trend: string;
    totalQuota: number;
    usedQuota: number;
    usagePercentage: number;
    estimatedDaysRemaining: number;
    status: string;
  };
  lastUpdated: string;
  successRate: number;
  totalApiKeys: number;
}

// Updated to match actual API response structure
export interface SingleApiKeyDashboardResponse {
  requestsToday: number;
  lastUsed: string;
  requestsYesterday: number;
  pendingRequests: number;
  performanceMetrics: {
    avgResponseTime7Days: number;
    errorRate24h: number;
  };
  apiKeyId: string;
  registeredDomain: string;
  usagePercentage: number;
  apiKeyName: string;
  todayVsYesterdayChange: number;
  status: string;
  monthlyMetrics: {
    totalCalls: number;
    quotaLimit: number;
    remainingQuota: number;
  };
}

// Data transformation interfaces to maintain current template structure
export interface TransformedDashboardStats {
  apiCalls: {
    current: number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  activeProjects: {
    current: number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  brandsAdded: {
    current: number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  remainingQuota: {
    current: number;
    percentage: number;
    total: number;
    resetDate: string;
  };
}

export interface TransformedApiKeyDashboard {
  usage: {
    requestsToday: number;
    requestsYesterday: number;
    remainingToday: number;
    requestsThisMonth: number;
    lastUsed: string;
    rateLimitStatus: 'OK' | 'WARNING' | 'EXCEEDED';
  };
  performance: {
    averageResponseTime: number;
    errorRate24h: number;
    uptime: number;
    performanceStatus: string;
    lastError: string | null;
    consecutiveSuccessfulCalls: number;
  };
  monthlyMetrics: {
    usagePercentage: number;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    quotaLimit: number;
    remainingQuota: number;
    successRate: number;
    estimatedDaysToQuotaExhaustion: number;
    quotaStatus: string;
  };
  rateLimitInfo: {
    tier: string;
    currentWindowRequests: number;
    windowLimit: number;
    windowResetTime: string;
    rateLimitStatus: string;
    rateLimitUtilization: number;
  };
  overallHealthStatus: string;
  todayVsYesterdayChange: number;
  pendingRequests: number;
  status: string;
  registeredDomain: string;
}