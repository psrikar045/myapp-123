// API Response Models for Dashboard Integration

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

export interface SingleApiKeyDashboardResponse {
  usagePercentageFromMonthly: number;
  overallHealthStatus: string;
  apiKeyId: string;
  apiKeyName: string;
  registeredDomain: string;
  requestsToday: number;
  requestsYesterday: number;
  todayVsYesterdayChange: number;
  pendingRequests: number;
  usagePercentage: number;
  lastUsed: string;
  status: string;
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
  performanceMetrics: {
    averageResponseTime: number;
    errorRate24h: number;
    uptime: number;
    performanceStatus: string;
    lastError: string | null;
    consecutiveSuccessfulCalls: number;
  };
  rateLimitInfo: {
    tier: string;
    currentWindowRequests: number;
    windowLimit: number;
    windowResetTime: string;
    rateLimitStatus: string;
    rateLimitUtilization: number;
  };
  lastUpdated: string;
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
}