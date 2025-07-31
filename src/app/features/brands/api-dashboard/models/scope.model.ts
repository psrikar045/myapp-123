export interface ScopeGroup {
  name: string;
  description: string;
  scopes: ScopeDefinition[];
}

export interface ScopeDefinition {
  key: string;
  name: string;
  description: string;
  dangerous?: boolean;
  adminOnly?: boolean;
}

export const SCOPE_GROUPS: ScopeGroup[] = [
  {
    name: 'Read Permissions',
    description: 'Allow reading data from the API',
    scopes: [
      {
        key: 'READ_USERS',
        name: 'Read Users',
        description: 'Read user information and profiles'
      },
      {
        key: 'READ_BRANDS',
        name: 'Read Brands',
        description: 'Read brand information and assets'
      },
      {
        key: 'READ_CATEGORIES',
        name: 'Read Categories',
        description: 'Read category hierarchy and information'
      },
      {
        key: 'READ_API_KEYS',
        name: 'Read API Keys',
        description: 'Read own API key information'
      }
    ]
  },
  {
    name: 'Write Permissions',
    description: 'Allow creating and updating data',
    scopes: [
      {
        key: 'WRITE_USERS',
        name: 'Write Users',
        description: 'Create and update user information'
      },
      {
        key: 'WRITE_BRANDS',
        name: 'Write Brands',
        description: 'Create and update brand information'
      },
      {
        key: 'WRITE_CATEGORIES',
        name: 'Write Categories',
        description: 'Create and update categories'
      }
    ]
  },
  {
    name: 'Delete Permissions',
    description: 'Allow deleting data (use with caution)',
    scopes: [
      {
        key: 'DELETE_USERS',
        name: 'Delete Users',
        description: 'Delete user accounts',
        dangerous: true
      },
      {
        key: 'DELETE_BRANDS',
        name: 'Delete Brands',
        description: 'Delete brands and assets',
        dangerous: true
      },
      {
        key: 'DELETE_CATEGORIES',
        name: 'Delete Categories',
        description: 'Delete categories',
        dangerous: true
      }
    ]
  },
  {
    name: 'API Key Management',
    description: 'Manage API keys and access',
    scopes: [
      {
        key: 'MANAGE_API_KEYS',
        name: 'Manage API Keys',
        description: 'Full API key management capabilities'
      },
      {
        key: 'REVOKE_API_KEYS',
        name: 'Revoke API Keys',
        description: 'Revoke and deactivate API keys'
      }
    ]
  },
  {
    name: 'Business API',
    description: 'Access business-related functionality',
    scopes: [
      {
        key: 'BUSINESS_READ',
        name: 'Business Read',
        description: 'Read business-related data via API'
      },
      {
        key: 'BUSINESS_WRITE',
        name: 'Business Write',
        description: 'Write business-related data via API'
      }
    ]
  },
  {
    name: 'Admin Permissions',
    description: 'Administrative access (restricted)',
    scopes: [
      {
        key: 'ADMIN_ACCESS',
        name: 'Admin Access',
        description: 'Access administrative functions',
        adminOnly: true,
        dangerous: true
      },
      {
        key: 'SYSTEM_MONITOR',
        name: 'System Monitor',
        description: 'Monitor system health and metrics',
        adminOnly: true
      },
      {
        key: 'FULL_ACCESS',
        name: 'Full Access',
        description: 'Complete system access (super admin equivalent)',
        adminOnly: true,
        dangerous: true
      }
    ]
  }
];

export function getScopesByGroup(): Record<string, ScopeDefinition[]> {
  const result: Record<string, ScopeDefinition[]> = {};
  SCOPE_GROUPS.forEach(group => {
    result[group.name] = group.scopes;
  });
  return result;
}

export function getAllScopes(): ScopeDefinition[] {
  return SCOPE_GROUPS.flatMap(group => group.scopes);
}

export function getScopeByKey(key: string): ScopeDefinition | undefined {
  return getAllScopes().find(scope => scope.key === key);
}