// Authentication Models
export interface AuthRequest {
  username: string;
  password: string;
  brandId?: string;
}

export interface EmailLoginRequest {
  email: string;
  password: string;
}

export interface UsernameLoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  brandId?: string;
  expirationTime: number;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  location?: string;
  brandId?: string;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  location?: string;
  email?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface SetNewPasswordRequest {
  userId: string;
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
}

export interface GoogleSignInRequest {
  idToken: string;
}

export interface CheckUsernameRequest {
  username: string;
  brandId: string;
}

export interface SimpleCheckUsernameRequest {
  username: string;
}

export interface CheckEmailRequest {
  email: string;
  brandId: string;
}

// Two-Factor Authentication Models
export interface TfaRequest {
  username: string;
  code: string;
}

// Brand Data Models
export interface AssetInfo {
  id: number;
  assetType: string;
  originalUrl: string;
  accessUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  downloadStatus: string;
  downloadedAt: string;
}

export interface ColorInfo {
  id: number;
  hexCode: string;
  rgbValue: string;
  brightness: number;
  colorName: string;
  usageContext: string;
}

export interface FontInfo {
  id: number;
  fontName: string;
  fontType: string;
  fontStack: string;
}

export interface ImageInfo {
  id: number;
  sourceUrl: string;
  altText: string;
  accessUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  downloadStatus: string;
  downloadedAt: string;
}

export interface SocialLinkInfo {
  id: number;
  platform: string;
  url: string;
  extractionError?: string;
}

export interface BrandDataResponse {
  id: number;
  name: string;
  website: string;
  description: string;
  industry: string;
  location: string;
  founded: string;
  companyType: string;
  employees: string;
  extractionTimeSeconds: number;
  lastExtractionTimestamp: string;
  extractionMessage: string;
  freshnessScore: number;
  needsUpdate: boolean;
  isBrandClaimed: boolean;
  createdAt: string;
  updatedAt: string;
  assets: AssetInfo[];
  colors: ColorInfo[];
  fonts: FontInfo[];
  socialLinks: SocialLinkInfo[];
  images: ImageInfo[];
}

export interface BrandStatistics {
  totalBrands: number;
  brandsCreatedLastMonth: number;
  claimedBrands: number;
}

// Pagination Models
export interface SortObject {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableObject {
  offset: number;
  sort: SortObject;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
  paged: boolean;
}

export interface PageBrandDataResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  content: BrandDataResponse[];
  number: number;
  sort: SortObject;
  last: boolean;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

// Forward Request Models
export interface PublicForwardRequest {
  url: string;
}

// Generic API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Error Response
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path: string;
}

// Brand Search Filters
export interface BrandSearchFilters {
  industry?: string;
  location?: string;
  companyType?: string;
  isClaimed?: boolean;
  needsUpdate?: boolean;
  minFreshnessScore?: number;
}

// Brand Data Summary
export interface BrandDataSummary {
  id: number;
  name: string;
  website: string;
  industry: string;
  location: string;
  isBrandClaimed: boolean;
  freshnessScore: number;
  needsUpdate: boolean;
  lastExtractionTimestamp: string;
}

// Brand Extraction Request
export interface BrandExtractionRequest {
  url: string;
  mockResponse?: string;
  forceReExtraction?: boolean;
}