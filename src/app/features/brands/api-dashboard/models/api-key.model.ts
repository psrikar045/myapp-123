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
  description?: string;
  prefix?: string;
  key?: string; // Full key (only available during creation)
  keyPreview?: string; // Masked preview of the API key (for identification only)
  maskedKey: string; // For backward compatibility
  encryptedKeyValue?: string; // Encrypted API key value for frontend decryption
  isActive?: boolean;
  registeredDomain?: string;
  tier: string; // rateLimitTier from backend
  environment?: 'development' | 'staging' | 'production' | 'testing';
  scopes: string[];
  allowedIps?: string[];
  allowedDomains?: string[];
  usage: ApiKeyUsage;
  security: SecuritySettings;
  expiresAt?: string; // LocalDateTime from backend
  createdAt: string; // LocalDateTime from backend
  updatedAt?: string; // LocalDateTime from backend
  lastUsedAt?: string; // LocalDateTime from backend
  revokedAt?: string; // LocalDateTime from backend
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
  encryptedKeyValue?: string; // Encrypted API key value for frontend decryption
  keyPreview?: string; // Masked preview of the API key
  registeredDomain?: string;
  mainDomain?: string;
  subdomainPattern?: string;
  environment?: 'development' | 'staging' | 'production' | 'testing';
  allowedDomains?: string[] | null;
  allowedIps?: string[] | null;
  scopes?: string | string[];
  rateLimitTier: string;
  active: boolean; // Backend returns 'active' not 'isActive'
  isActive?: boolean; // Keep for backward compatibility
  expiresAt?: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface RegenerateApiKeyResponse {
  id: string;
  name: string;
  description?: string;
  prefix: string;
  keyValue: string;
  encryptedKeyValue?: string; // Encrypted API key value for frontend decryption
  keyPreview: string;
  registeredDomain?: string;
  rateLimitTier: string;
  scopes: string[];
  success: boolean;
  message: string;
  createdAt: string;
  updatedAt: string;
}