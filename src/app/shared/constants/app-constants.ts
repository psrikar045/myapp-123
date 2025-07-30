/**
 * Application Constants
 * Global constants used throughout the application
 */

export const APP_CONSTANTS = {
  // Application Info
  APP_NAME: 'RIVO9',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Your Ultimate Brand Discovery Platform',

  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'RIVO9_auth_token',
    REFRESH_TOKEN: 'RIVO9_refresh_token',
    USER_PROFILE: 'RIVO9_user_profile',
    THEME_PREFERENCE: 'RIVO9_theme',
    SEARCH_HISTORY: 'RIVO9_search_history',
    LANGUAGE_PREFERENCE: 'RIVO9_language',
    SIDEBAR_STATE: 'RIVO9_sidebar_state'
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 100
  },

  // Search
  SEARCH: {
    MIN_SEARCH_LENGTH: 2,
    MAX_SEARCH_LENGTH: 100,
    DEBOUNCE_TIME: 300,
    MAX_SUGGESTIONS: 10,
    MAX_HISTORY_ITEMS: 20
  },

  // File Upload
  FILE_UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain', 'application/msword']
  },

  // UI Constants
  UI: {
    TOAST_DURATION: 5000,
    LOADING_DELAY: 200,
    ANIMATION_DURATION: 300,
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024
  },

  // Date Formats
  DATE_FORMATS: {
    SHORT: 'MM/dd/yyyy',
    LONG: 'MMMM dd, yyyy',
    WITH_TIME: 'MM/dd/yyyy HH:mm',
    ISO: 'yyyy-MM-ddTHH:mm:ss.SSSZ'
  },

  // Validation
  VALIDATION: {
    EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE_PATTERN: /^\+?[\d\s\-\(\)]+$/,
    PASSWORD_MIN_LENGTH: 8,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30
  },

  // HTTP
  HTTP: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
  },

  // Feature Flags
  FEATURES: {
    ENABLE_DARK_MODE: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_ANALYTICS: true,
    ENABLE_PWA: true,
    ENABLE_OFFLINE_MODE: false
  },

  // Social Media
  SOCIAL_LINKS: {
    TWITTER: 'https://twitter.com/RIVO9',
    FACEBOOK: 'https://facebook.com/RIVO9',
    LINKEDIN: 'https://linkedin.com/company/RIVO9',
    GITHUB: 'https://github.com/RIVO9'
  },

  // Support
  SUPPORT: {
    EMAIL: 'support@RIVO9.com',
    PHONE: '+1-800-RIVO9',
    HELP_CENTER: 'https://help.RIVO9.com',
    STATUS_PAGE: 'https://status.RIVO9.com'
  }
} as const;

// Environment-specific constants
export const ENV_CONSTANTS = {
  DEVELOPMENT: {
    API_BASE_URL: 'http://localhost:3000/api',
    ENABLE_LOGGING: true,
    ENABLE_DEBUG: true
  },
  PRODUCTION: {
    API_BASE_URL: 'https://api.RIVO9.com',
    ENABLE_LOGGING: false,
    ENABLE_DEBUG: false
  }
} as const;

// User Roles
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
  GUEST = 'guest'
}

// Subscription Plans
export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

// Theme Options
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

// Language Options
export enum Language {
  ENGLISH = 'en',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de'
}