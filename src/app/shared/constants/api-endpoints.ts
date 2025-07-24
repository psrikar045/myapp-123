/**
 * API Endpoints Configuration
 * Centralized location for all API endpoints
 */

export const API_ENDPOINTS = {
  // Base URLs
  BASE_URL: '/api',
  AUTH_BASE: '/api/auth',
  BRANDS_BASE: '/api/brands',
  SEARCH_BASE: '/api/search',
  BLOG_BASE: '/api/blog',
  USER_BASE: '/api/user',
  ADMIN_BASE: '/api/admin',

  // Authentication Endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    REFRESH_TOKEN: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    CHANGE_PASSWORD: '/api/auth/change-password'
  },

  // Brand & Category Endpoints
  BRANDS: {
    CATEGORIES: '/api/brands/categories',
    SUBCATEGORIES: '/api/brands/subcategories',
    BRAND_DATA: '/api/brands/data',
    COMPANY_INFO: '/api/brands/company',
    BRAND_SEARCH: '/api/brands/search',
    BRAND_DETAILS: '/api/brands/details'
  },

  // Search Endpoints
  SEARCH: {
    GENERAL: '/api/search',
    SUGGESTIONS: '/api/search/suggestions',
    HISTORY: '/api/search/history',
    FILTERS: '/api/search/filters',
    ADVANCED: '/api/search/advanced'
  },

  // Blog Endpoints
  BLOG: {
    POSTS: '/api/blog/posts',
    POST_DETAILS: '/api/blog/posts',
    CATEGORIES: '/api/blog/categories',
    TAGS: '/api/blog/tags',
    COMMENTS: '/api/blog/comments'
  },

  // User Profile Endpoints
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
    PREFERENCES: '/api/user/preferences',
    SUBSCRIPTION: '/api/user/subscription',
    BILLING: '/api/user/billing',
    ACTIVITY: '/api/user/activity'
  },

  // Admin Endpoints
  ADMIN: {
    USERS: '/api/admin/users',
    ANALYTICS: '/api/admin/analytics',
    SETTINGS: '/api/admin/settings',
    LOGS: '/api/admin/logs',
    REPORTS: '/api/admin/reports'
  },

  // Utility Endpoints
  UTILS: {
    HEALTH_CHECK: '/api/health',
    VERSION: '/api/version',
    CONFIG: '/api/config'
  }
} as const;

// Helper function to build full URLs
export function buildApiUrl(endpoint: string, params?: Record<string, string | number>): string {
  let url = endpoint;
  
  if (params) {
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, String(params[key]));
    });
  }
  
  return url;
}

// Helper function to build query string
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}