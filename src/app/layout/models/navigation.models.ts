export interface SidenavItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  children?: SidenavItem[];
  badge?: SidenavBadge;
  isExpanded?: boolean;
  isActive?: boolean;
  isParentActive?: boolean; // Flag for when parent is active due to child selection
  requiredRoles?: string[];
  isVisible?: boolean;
  action?: () => void;
  cssClass?: string;
}

export interface SidenavBadge {
  count?: number;
  text?: string;
  type: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'light' | 'dark';
  pulse?: boolean;
}

export interface SidenavConfig {
  collapsed: boolean;
  showUserInfo: boolean;
  showEnvironmentBadge: boolean;
  autoCollapseOnMobile: boolean;
  overlayMode: boolean;
  width: {
    expanded: string;
    collapsed: string;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  initials: string;
}

export interface EnvironmentInfo {
  name: 'Development' | 'Staging' | 'Production';
  color: 'primary' | 'warning' | 'success';
  apiStatus: 'Operational' | 'Degraded' | 'Down';
  uptime: string;
}

export const DEFAULT_SIDENAV_CONFIG: SidenavConfig = {
  collapsed: false,
  showUserInfo: true,
  showEnvironmentBadge: true,
  autoCollapseOnMobile: true,
  overlayMode: false,
  width: {
    expanded: '280px',
    collapsed: '72px'
  }
};