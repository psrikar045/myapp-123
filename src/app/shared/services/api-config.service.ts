import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly baseUrl = environment.baseApiUrl;

  // Authentication endpoints
  readonly auth = {
    login: `${this.baseUrl}/auth/login`,
    loginEmail: `${this.baseUrl}/auth/login/email`,
    loginUsername: `${this.baseUrl}/auth/login/username`,
    register: `${this.baseUrl}/auth/register`,
    token: `${this.baseUrl}/auth/token`,
    refresh: `${this.baseUrl}/auth/refresh`,
    profile: `${this.baseUrl}/auth/profile`,
    forgotPassword: `${this.baseUrl}/auth/forgot-password`,
    forgotPasswordCode: `${this.baseUrl}/auth/forgot-password-code`,
    verifyResetCode: `${this.baseUrl}/auth/verify-reset-code`,
    setNewPassword: `${this.baseUrl}/auth/set-new-password`,
    resetPassword: `${this.baseUrl}/auth/reset-password`,
    verifyEmail: `${this.baseUrl}/auth/verify-email`,
    google: `${this.baseUrl}/auth/google`,
    usernameExists: `${this.baseUrl}/auth/username-exists`,
    checkUsername: `${this.baseUrl}/auth/check-username`,
    checkUsernameSimple: `${this.baseUrl}/auth/check-username/simple`,
    checkEmail: `${this.baseUrl}/auth/check-email`,
    publicForward: `${this.baseUrl}/auth/public-forward`,
    forward: `${this.baseUrl}/auth/forward`
  };

  // Two-Factor Authentication endpoints
  readonly tfa = {
    setup: `${this.baseUrl}/auth/tfa/setup`,
    enable: `${this.baseUrl}/auth/tfa/enable`,
    disable: `${this.baseUrl}/auth/tfa/disable`,
    verify: `${this.baseUrl}/auth/tfa/verify`,
    qrCode: `${this.baseUrl}/auth/tfa/qr-code`,
    currentCode: `${this.baseUrl}/auth/tfa/current-code`
  };

  // Brand Data endpoints
  readonly brands = {
    base: `${this.baseUrl}/api/brands`,
    search: `${this.baseUrl}/api/brands/search`,
    byWebsite: `${this.baseUrl}/api/brands/by-website`,
    byName: `${this.baseUrl}/api/brands/by-name`,
    byDomain: `${this.baseUrl}/api/brands/by-domain`,
    statistics: `${this.baseUrl}/api/brands/statistics`,
    extract: `${this.baseUrl}/api/brands/extract`,
    assets: `${this.baseUrl}/api/brands/assets`,
    images: `${this.baseUrl}/api/brands/images`,
    claim: (id: number) => `${this.baseUrl}/api/brands/${id}/claim`,
    byId: (id: number) => `${this.baseUrl}/api/brands/${id}`,
    asset: (assetId: number) => `${this.baseUrl}/api/brands/assets/${assetId}`,
    image: (imageId: number) => `${this.baseUrl}/api/brands/images/${imageId}`
  };

  // Protected Resources endpoints
  readonly protected = {
    resource: `${this.baseUrl}/api/protected`
  };

  // ID Generator endpoints
  readonly idGenerator = {
    generate: `${this.baseUrl}/api/id-generator/generate`,
    generateWithPrefix: (prefix: string) => `${this.baseUrl}/api/id-generator/generate/${prefix}`,
    userIdGenerate: `${this.baseUrl}/api/id-generator/user-id/generate`,
    userIdSimple: `${this.baseUrl}/api/id-generator/user-id/simple`,
    userIdInitSequence: `${this.baseUrl}/api/id-generator/user-id/init-sequence`,
    userIdPreview: `${this.baseUrl}/api/id-generator/user-id/preview`,
    preview: `${this.baseUrl}/api/id-generator/preview`,
    previewWithPrefix: (prefix: string) => `${this.baseUrl}/api/id-generator/preview/${prefix}`,
    prefixes: `${this.baseUrl}/api/id-generator/prefixes`,
    current: (prefix: string) => `${this.baseUrl}/api/id-generator/current/${prefix}`,
    reset: (prefix: string) => `${this.baseUrl}/api/id-generator/reset/${prefix}`
  };

  // Test endpoints (excluded from main implementation but kept for reference)
  readonly test = {
    status: `${this.baseUrl}/test/status`,
    googleSigninDemo: `${this.baseUrl}/test/google-signin-demo`
  };

  /**
   * Get the base API URL
   * @returns Base API URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Check if the API is configured
   * @returns True if base URL is set
   */
  isConfigured(): boolean {
    return !!this.baseUrl && this.baseUrl.trim() !== '';
  }

  /**
   * Get all authentication endpoints
   * @returns Object with all auth endpoints
   */
  getAuthEndpoints(): typeof this.auth {
    return this.auth;
  }

  /**
   * Get all brand endpoints
   * @returns Object with all brand endpoints
   */
  getBrandEndpoints(): typeof this.brands {
    return this.brands;
  }

  /**
   * Get all 2FA endpoints
   * @returns Object with all 2FA endpoints
   */
  getTfaEndpoints(): typeof this.tfa {
    return this.tfa;
  }

  /**
   * Get all ID generator endpoints
   * @returns Object with all ID generator endpoints
   */
  getIdGeneratorEndpoints(): typeof this.idGenerator {
    return this.idGenerator;
  }

  /**
   * Build URL with query parameters
   * @param baseUrl Base URL
   * @param params Query parameters
   * @returns URL with parameters
   */
  buildUrlWithParams(baseUrl: string, params: { [key: string]: string | number | boolean }): string {
    const url = new URL(baseUrl);
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, value.toString());
      }
    });
    
    return url.toString();
  }

  /**
   * Validate endpoint URL
   * @param endpoint Endpoint to validate
   * @returns True if endpoint is valid
   */
  validateEndpoint(endpoint: string): boolean {
    try {
      new URL(endpoint);
      return endpoint.startsWith(this.baseUrl);
    } catch {
      return false;
    }
  }

  /**
   * Get endpoint category from URL
   * @param url Endpoint URL
   * @returns Category name or 'unknown'
   */
  getEndpointCategory(url: string): string {
    if (url.includes('/auth/')) return 'authentication';
    if (url.includes('/api/brands/')) return 'brands';
    if (url.includes('/api/protected')) return 'protected';
    if (url.includes('/api/id-generator/')) return 'id-generator';
    if (url.includes('/test/')) return 'test';
    return 'unknown';
  }

  /**
   * Check if endpoint requires authentication
   * @param url Endpoint URL
   * @returns True if authentication is required
   */
  requiresAuthentication(url: string): boolean {
    const publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/verify-email',
      '/auth/check-username',
      '/auth/check-email',
      '/auth/google',
      '/auth/public-forward',
      '/test/'
    ];
    
    return !publicEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Check if endpoint requires brand ID header
   * @param url Endpoint URL
   * @returns True if brand ID is required
   */
  requiresBrandId(url: string): boolean {
    const brandIdEndpoints = [
      '/api/protected',
      '/api/brands/',
      '/auth/profile'
    ];
    
    return brandIdEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Get API documentation URL
   * @returns Swagger documentation URL
   */
  getDocumentationUrl(): string {
    return `${this.baseUrl}/swagger-ui/index.html`;
  }

  /**
   * Get API schema URL
   * @returns OpenAPI schema URL
   */
  getSchemaUrl(): string {
    return `${this.baseUrl}/v3/api-docs`;
  }
}