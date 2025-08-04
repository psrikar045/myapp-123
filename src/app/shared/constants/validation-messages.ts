/**
 * Validation error messages used throughout the application
 */

export const VALIDATION_MESSAGES = {
  // Required fields
  REQUIRED: 'This field is required',
  EMAIL_REQUIRED: 'Email address is required',
  PASSWORD_REQUIRED: 'Password is required',
  NAME_REQUIRED: 'Name is required',
  PHONE_REQUIRED: 'Phone number is required',

  // Format validation
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_NUMBER: 'Please enter a valid number',

  // Length validation
  MIN_LENGTH: (min: number) => `Minimum ${min} characters required`,
  MAX_LENGTH: (max: number) => `Maximum ${max} characters allowed`,
  EXACT_LENGTH: (length: number) => `Must be exactly ${length} characters`,

  // Password validation
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
  PASSWORD_WEAK: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  PASSWORD_MISMATCH: 'Passwords do not match',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',

  // Numeric validation
  MIN_VALUE: (min: number) => `Value must be at least ${min}`,
  MAX_VALUE: (max: number) => `Value must not exceed ${max}`,
  POSITIVE_NUMBER: 'Value must be a positive number',
  INTEGER_ONLY: 'Only whole numbers are allowed',

  // File validation
  FILE_REQUIRED: 'Please select a file',
  FILE_TOO_LARGE: (maxSize: string) => `File size must not exceed ${maxSize}`,
  INVALID_FILE_TYPE: (allowedTypes: string) => `Only ${allowedTypes} files are allowed`,
  FILE_UPLOAD_FAILED: 'File upload failed. Please try again',

  // Date validation
  FUTURE_DATE_ONLY: 'Date must be in the future',
  PAST_DATE_ONLY: 'Date must be in the past',
  DATE_RANGE_INVALID: 'End date must be after start date',
  MIN_AGE: (age: number) => `You must be at least ${age} years old`,

  // Custom validation
  ALPHANUMERIC_ONLY: 'Only letters and numbers are allowed',
  NO_WHITESPACE: 'Whitespace is not allowed',
  UNIQUE_VALUE: 'This value already exists',
  TERMS_ACCEPTANCE: 'You must accept the terms and conditions',
  PRIVACY_ACCEPTANCE: 'You must accept the privacy policy',

  // Credit card validation
  INVALID_CREDIT_CARD: 'Please enter a valid credit card number',
  INVALID_CVV: 'Please enter a valid CVV',
  INVALID_EXPIRY: 'Please enter a valid expiry date',
  CARD_EXPIRED: 'Credit card has expired',

  // Username validation
  USERNAME_TAKEN: 'This username is already taken',
  USERNAME_INVALID: 'Username can only contain letters, numbers, and underscores',
  USERNAME_TOO_SHORT: 'Username must be at least 3 characters long',
  USERNAME_TOO_LONG: 'Username must not exceed 20 characters',

  // Network/API errors
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  TIMEOUT_ERROR: 'Request timed out. Please try again',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'The requested resource was not found',

  // Form submission
  FORM_INVALID: 'Please correct the errors below',
  SAVE_SUCCESS: 'Changes saved successfully',
  SAVE_ERROR: 'Failed to save changes. Please try again',
  DELETE_SUCCESS: 'Item deleted successfully',
  DELETE_ERROR: 'Failed to delete item. Please try again',

  // Search validation
  SEARCH_QUERY_TOO_SHORT: 'Search query must be at least 2 characters long',
  NO_SEARCH_RESULTS: 'No results found for your search',
  SEARCH_ERROR: 'Search failed. Please try again',

  // Generic messages
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again',
  PLEASE_TRY_AGAIN: 'Please try again',
  OPERATION_CANCELLED: 'Operation was cancelled',
  CHANGES_NOT_SAVED: 'Your changes have not been saved',
  UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?'
} as const;

export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES;

/**
 * Get validation message by key
 */
export function getValidationMessage(key: ValidationMessageKey, ...args: any[]): string {
  const message = VALIDATION_MESSAGES[key];
  
  if (typeof message === 'function') {
    return (message as Function)(...args);
  }
  
  return message as string;
}

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  URL: /^https?:\/\/.+/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  USERNAME: /^[a-zA-Z0-9_]+$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  CREDIT_CARD: /^\d{13,19}$/,
  CVV: /^\d{3,4}$/,
  POSTAL_CODE: /^\d{5}(-\d{4})?$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
} as const;