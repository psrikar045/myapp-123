export interface ApiKeyBasicInfo {
  name: string;
  description?: string;
  environment: 'development' | 'staging' | 'production' | 'testing';
}

export interface RateLimitTier {
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE' | 'UNLIMITED';
  requestsPerDay: number;
  description: string;
  customLimits?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    burstLimit?: number;
  };
}

export interface ApiKeyScopes {
  readPermissions: {
    READ_USERS: boolean;
    READ_BRANDS: boolean;
    READ_CATEGORIES: boolean;
    READ_API_KEYS: boolean;
  };
  writePermissions: {
    WRITE_USERS: boolean;
    WRITE_BRANDS: boolean;
    WRITE_CATEGORIES: boolean;
  };
  deletePermissions: {
    DELETE_USERS: boolean;
    DELETE_BRANDS: boolean;
    DELETE_CATEGORIES: boolean;
  };
  managementPermissions: {
    MANAGE_API_KEYS: boolean;
    REVOKE_API_KEYS: boolean;
  };
  businessPermissions: {
    BUSINESS_READ: boolean;
    BUSINESS_WRITE: boolean;
  };
  adminPermissions: {
    ADMIN_ACCESS: boolean;
    SYSTEM_MONITOR: boolean;
    FULL_ACCESS: boolean;
  };
}

export interface SecuritySettings {
  ipRestrictions: {
    enabled: boolean;
    whitelist: string[];
  };
  domainRestrictions: {
    enabled: boolean;
    allowedDomains: string[];
  };
  webhookUrls: string[];
  allowedOrigins: string[];
}

export interface ExpirationSettings {
  type: 'never' | 'fixed' | 'rolling';
  expiresAt?: Date;
  autoRotate: boolean;
  rotationInterval?: number; // days
  notifyBeforeExpiry: boolean;
  notificationDays: number;
}

export interface ApiKeyUsage {
  requestsToday: number;
  remainingToday: number;
  requestsThisMonth?: number;
  lastUsed: string;
  rateLimitStatus: 'OK' | 'WARNING' | 'EXCEEDED';
}

export interface ApiKey {
  id: string;
  name: string;
  key?: string; // Full key (only available during creation)
  maskedKey: string;
  tier: string;
  environment?: 'development' | 'staging' | 'production' | 'testing';
  scopes: string[];
  usage: ApiKeyUsage;
  security: SecuritySettings;
  expiresAt?: string;
  createdAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED';
}

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
  prefix?: string;
  expiresAt?: string; // ISO string format for LocalDateTime
  allowedIps?: string[];
  allowedDomains?: string[];
  rateLimitTier?: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE' | 'UNLIMITED';
  scopes?: string[];
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  description?: string;
  prefix?: string;
  keyValue: string;
  registeredDomain?: string;
  mainDomain?: string;
  subdomainPattern?: string;
  environment: 'development' | 'staging' | 'production' | 'testing';
  allowedDomains?: string[] | null;
  allowedIps?: string[] | null;
  scopes: string;
  rateLimitTier: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}