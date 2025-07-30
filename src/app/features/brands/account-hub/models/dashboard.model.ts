export interface DashboardStats {
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

export interface RecentProject {
  id: string;
  name: string;
  status: 'Active' | 'In Review' | 'Completed';
  type: string;
  lastUpdated: string;
  description?: string;
}

export interface ApiKeyOverview {
  id: string;
  name: string;
  maskedKey: string;
  environment: 'production' | 'development' | 'staging';
  usage: {
    current: number;
    limit: number;
    percentage: number;
  };
  status: 'active' | 'warning' | 'exceeded' | 'expired';
  lastUsed: string;
}

export interface AccountHubData {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  stats: DashboardStats;
  recentProjects: RecentProject[];
  apiKeys: ApiKeyOverview[];
}