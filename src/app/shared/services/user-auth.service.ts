import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AuthRequest,
  AuthResponse,
  EmailLoginRequest,
  UsernameLoginRequest,
  RegisterRequest,
  ProfileUpdateRequest,
  ForgotPasswordRequest,
  VerifyCodeRequest,
  SetNewPasswordRequest,
  ResetPasswordConfirmRequest,
  GoogleSignInRequest,
  CheckUsernameRequest,
  SimpleCheckUsernameRequest,
  CheckEmailRequest,
  TfaRequest,
  BrandDataResponse,
  PageBrandDataResponse,
  BrandStatistics,
  PublicForwardRequest,
  ApiResponse,
  ApiError,
  LoginRequest
} from '../models/api.models';
import { UserBackendResponse, UserProfileUpdateRequest } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
  private readonly baseUrl = environment.baseApiUrl;

  constructor(private http: HttpClient) {}

  // ==================== AUTHENTICATION ENDPOINTS ====================

  /**
   * Email-based login
   * POST /auth/login/email
   */
  loginWithEmail(request: EmailLoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login/email`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Username-based login
   * POST /auth/login/username
   */
  loginWithUsername(request: UsernameLoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login/username`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Legacy login endpoint
   * POST /auth/login
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Generate authentication token
   * POST /auth/token
   */
  createAuthenticationToken(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/token`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Register a new user
   * POST /auth/register
   */
  register(request: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/register`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Refresh JWT token
   * POST /auth/refresh
   */
  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/refresh`, refreshToken)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update user profile
   * PUT /auth/profile
   */
  updateProfile(request: ProfileUpdateRequest, brandId: string): Observable<any> {
    const headers = new HttpHeaders({
      'X-Brand-Id': brandId,
      'Authorization': `Bearer ${this.getAuthToken()}`
    });
    return this.http.put<any>(`${this.baseUrl}/auth/profile`, request, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Initiate password reset
   * POST /auth/forgot-password
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/forgot-password`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Send password reset verification code
   * POST /auth/forgot-password-code
   */
  sendPasswordResetCode(request: ForgotPasswordRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/forgot-password-code`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Verify password reset code
   * POST /auth/verify-reset-code
   */
  verifyResetCode(request: VerifyCodeRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/verify-reset-code`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Set new password after verification
   * POST /auth/set-new-password
   */
  setNewPassword(request: SetNewPasswordRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/set-new-password`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Reset password (legacy)
   * POST /auth/reset-password
   */
  resetPassword(request: ResetPasswordConfirmRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/reset-password`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Verify email address
   * GET /auth/verify-email
   */
  verifyEmail(token: string): Observable<any> {
    const params = new HttpParams().set('token', token);
    return this.http.get<any>(`${this.baseUrl}/auth/verify-email`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Google Sign-In
   * POST /auth/google
   */
  googleSignIn(request: GoogleSignInRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/google`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Check if username exists (GET method)
   * GET /auth/username-exists
   */
  usernameExists(username: string): Observable<string> {
    const params = new HttpParams().set('username', username);
    return this.http.get<string>(`${this.baseUrl}/auth/username-exists`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Check if username exists (POST method)
   * POST /auth/check-username
   */
  checkUsername(request: CheckUsernameRequest): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/auth/check-username`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Check if username exists (simple version)
   * POST /auth/check-username/simple
   */
  checkUsernameSimple(request: SimpleCheckUsernameRequest): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/auth/check-username/simple`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Check if email exists
   * POST /auth/check-email
   */
  checkEmail(request: CheckEmailRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/check-email`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Public forward request
   * POST /auth/public-forward
   */
  publicForward(request: PublicForwardRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/public-forward`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Forward request
   * POST /auth/forward
   */
  forwardRequest(forwardUrl: string, token: any): Observable<any> {
    let jwtToken: any = this.getAuthToken();
    if (jwtToken == null && token) {
      jwtToken = token;
    }
    let request = {
      "url": forwardUrl
    };
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${jwtToken}`,
    });
    return this.http.post<any>(`${this.baseUrl}/forward`, request, { headers })
      .pipe(catchError(this.handleError));
  }

  // ==================== TWO-FACTOR AUTHENTICATION ====================

  /**
   * Setup Two-Factor Authentication
   * POST /auth/tfa/setup
   */
  setupTfa(username: string): Observable<any> {
    const params = new HttpParams().set('username', username);
    return this.http.post<any>(`${this.baseUrl}/auth/tfa/setup`, {}, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Enable Two-Factor Authentication
   * POST /auth/tfa/enable
   */
  enableTfa(username: string): Observable<any> {
    const params = new HttpParams().set('username', username);
    return this.http.post<any>(`${this.baseUrl}/auth/tfa/enable`, {}, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Disable Two-Factor Authentication
   * POST /auth/tfa/disable
   */
  disableTfa(username: string): Observable<any> {
    const params = new HttpParams().set('username', username);
    return this.http.post<any>(`${this.baseUrl}/auth/tfa/disable`, {}, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Verify Two-Factor Authentication code
   * POST /auth/tfa/verify
   */
  verifyTfa(request: TfaRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/tfa/verify`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get 2FA QR Code
   * GET /auth/tfa/qr-code
   */
  getTfaQrCode(username: string): Observable<Blob> {
    const params = new HttpParams().set('username', username);
    return this.http.get(`${this.baseUrl}/auth/tfa/qr-code`, { 
      params, 
      responseType: 'blob' 
    }).pipe(catchError(this.handleError));
  }

  /**
   * Get current TOTP code
   * GET /auth/tfa/current-code
   */
  getCurrentTotpCode(username: string): Observable<any> {
    const params = new HttpParams().set('username', username);
    return this.http.get<any>(`${this.baseUrl}/auth/tfa/current-code`, { params })
      .pipe(catchError(this.handleError));
  }

  // ==================== BRAND DATA ENDPOINTS ====================

  /**
   * Get all brands with pagination and optional search
   * GET /api/brands/all
   */
  getAllBrands(page: number = 0, size: number = 20, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('paginated', 'true')
      .set('page', page.toString())
      .set('size', size.toString());
    
    // Add search parameter if provided
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    
    return this.http.get<any>(`${this.baseUrl}/api/brands/all`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get brand by ID
   * GET /api/brands/{id}
   */
  getBrandById(id: number): Observable<BrandDataResponse> {
    return this.http.get<BrandDataResponse>(`${this.baseUrl}/api/brands/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Search brands
   * GET /api/brands/search
   */
  searchBrands(query: string, page: number = 0, size: number = 20): Observable<PageBrandDataResponse> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageBrandDataResponse>(`${this.baseUrl}/api/brands/search`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get brand by website URL
   * GET /api/brands/by-website
   */
  getBrandByWebsite(website: string): Observable<any> {
    const params = new HttpParams().set('website', website);
    return this.http.get<any>(`${this.baseUrl}/api/brands/by-website`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get brand by name
   * GET /api/brands/by-name
   */
  getBrandByName(name: string): Observable<any> {
    const params = new HttpParams().set('name', name);
    return this.http.get<any>(`${this.baseUrl}/api/brands/by-name`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get brands by domain
   * GET /api/brands/by-domain
   */
  getBrandsByDomain(domain: string): Observable<BrandDataResponse[]> {
    const params = new HttpParams().set('domain', domain);
    return this.http.get<BrandDataResponse[]>(`${this.baseUrl}/api/brands/by-domain`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get brand statistics
   * GET /api/brands/statistics
   */
  getBrandStatistics(): Observable<BrandStatistics> {
    return this.http.get<BrandStatistics>(`${this.baseUrl}/api/brands/statistics`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Claim a brand
   * PUT /api/brands/{id}/claim
   */
  claimBrand(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/brands/${id}/claim`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Manual brand extraction
   * POST /api/brands/extract
   */
  extractBrandData(url: string, mockResponse?: string): Observable<any> {
    let params = new HttpParams().set('url', url);
    if (mockResponse) {
      params = params.set('mockResponse', mockResponse);
    }
    return this.http.post<any>(`${this.baseUrl}/api/brands/extract`, {}, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Serve brand asset file
   * GET /api/brands/assets/{assetId}
   */
  serveBrandAsset(assetId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/brands/assets/${assetId}`, { 
      responseType: 'blob' 
    }).pipe(catchError(this.handleError));
  }

  /**
   * Serve brand image file
   * GET /api/brands/images/{imageId}
   */
  serveBrandImage(imageId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/brands/images/${imageId}`, { 
      responseType: 'blob' 
    }).pipe(catchError(this.handleError));
  }

  // ==================== PROTECTED RESOURCES ====================

  /**
   * Access protected resource
   * GET /api/protected
   */
  accessProtectedResource(brandId: string): Observable<string> {
    const headers = new HttpHeaders({
      'X-Brand-Id': brandId
    });
    return this.http.get<string>(`${this.baseUrl}/api/protected`, { headers })
      .pipe(catchError(this.handleError));
  }

  // ==================== ID GENERATOR ENDPOINTS ====================

  /**
   * Generate next ID with default prefix
   * POST /api/id-generator/generate
   */
  generateNextId(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/id-generator/generate`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Generate next ID with custom prefix
   * POST /api/id-generator/generate/{prefix}
   */
  generateNextIdWithPrefix(prefix: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/id-generator/generate/${prefix}`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Get current ID counter
   * GET /api/id-generator/current
   */
  getCurrentIdCounter(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/id-generator/current`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get current ID counter for prefix
   * GET /api/id-generator/current/{prefix}
   */
  getCurrentIdCounterForPrefix(prefix: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/id-generator/current/${prefix}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get authentication token from local storage
   * This method should be replaced with proper token management
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('jwt_token');
    }
    return null;
  }
  private getUserDetails(): any {
    if (typeof window !== 'undefined' && window.localStorage) {
      return JSON.parse(localStorage.getItem('user_details') || '{}');
    }
    return null;
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'An unexpected error occurred. Please try again later.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      console.error('Client-side error:', error.error.message);
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Backend error
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`
      );
      
      if (error.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    // Return an observable with a user-facing error message
    return throwError(() => new Error(errorMessage));
  };
  /**http://localhost:8080/myapp/api/category/hierarchy
   * Fetch categories
   * GET /api/categories
   */
  getCategories(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/category/hierarchy`)
      .pipe(catchError(this.handleError));
  }
  getUserProfile(): Observable<any> {
    const userId = this.getUserDetails()?.userId; // Assuming the token contains user ID
    const data = { id: userId };
        let jwtToken: any = this.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${jwtToken}`,
    });
    return this.http.post<any>(`${this.baseUrl}/api/users/get-by-id`, data, { headers })
      .pipe(catchError(this.handleError));
  }
   updateUserProfile(profileData: UserProfileUpdateRequest): Observable<UserBackendResponse> {
        let jwtToken: any = this.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${jwtToken}`,
    });
    return this.http.put<UserBackendResponse>(`${this.baseUrl}/api/users/profile`, profileData, { headers });
  }
}