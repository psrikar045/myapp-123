import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { UserAuthService } from '../../shared/services/user-auth.service';

import {
  AuthResponse,
  EmailLoginRequest,
  UsernameLoginRequest,
  RegisterRequest,
  ProfileUpdateRequest,
  ForgotPasswordRequest,
  VerifyCodeRequest,
  SetNewPasswordRequest,
  GoogleSignInRequest,
  PublicForwardRequest,
  AuthRequest,
  LoginRequest
} from '../../shared/models/api.models';
import { jwtDecode } from 'jwt-decode';
// Define interfaces for clarity
interface LoginResponse {
  token: string;
  user: { // You can expand this interface based on actual user data returned
    id: string;
    username: string;
    email: string;
    // Add other user properties like roles, etc.
  };
  refreshToken?: string; // Include refreshToken if needed
  // Potentially include refreshToken if your auth flow uses it
}

// Define an interface for the registration data payload
export interface RegisterData {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  location?: string;
  brandId?: string;
  // termsAccepted: boolean; // You might send this or handle it purely client-side
}

// Define interface for user details
export interface UserDetails {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  location?: string;
  userId?: string;
  roles?: string[];
  exp?: number; // JWT expiration
  iat?: number; // JWT issued at
  code?: string;
  token?: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // IMPORTANT: Replace with your actual backend base URL 
  private readonly API_BASE_URL = 'http://202.65.155.125:8080/myapp'; // Example backend URL
  private readonly LOGIN_URL = `${this.API_BASE_URL}/auth/login/email`;
  // Define new API endpoints here
  private readonly FORGOT_PASSWORD_URL = `${this.API_BASE_URL}/auth/forgot-password`;
  private readonly VERIFY_CODE_URL = `${this.API_BASE_URL}/auth/verify-reset-code`;
  private readonly RESET_PASSWORD_URL = `${this.API_BASE_URL}/auth/reset-password`;
  private readonly REGISTER_URL = `${this.API_BASE_URL}/auth/register`; // Adjust to your actual backend endpoint


  private readonly platformId = inject(PLATFORM_ID); // <-- Inject PLATFORM_ID
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private userDetailsSubject = new BehaviorSubject<UserDetails | null>(this.getUserDetailsFromStorage());
  userDetails$ = this.userDetailsSubject.asObservable();
  userDetails: any = {};
  constructor(
    private http: HttpClient, 
    private router: Router,
    private userAuthService: UserAuthService
  ) {
    // Initialize user details from storage on service creation
    this.userDetails = this.getUserDetailsFromStorage();
    
    // Initialize authentication state properly
    this.isAuthenticatedSubject.next(this.isAuthenticated());
  }

  /**
   * Store user details from login response
   * @param response AuthResponse from login
   */
  storeUserDetails(response: AuthResponse): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      // Decode JWT token to extract user details
      const decodedToken: any = jwtDecode(response.token);
      
      const userDetails: UserDetails = {
        id: decodedToken.sub || decodedToken.userId,
        username: decodedToken.username,
        email: decodedToken.email,
        firstName: decodedToken.firstName,
        lastName: decodedToken.lastName,
        phoneNumber: decodedToken.phoneNumber,
        location: decodedToken.location,
        userId: response.brandId || decodedToken.brandId,
        roles: decodedToken.roles || [],
        exp: decodedToken.exp,
        iat: decodedToken.iat,
        token: response.token
      };

      // Store in localStorage
      localStorage.setItem('user_details', JSON.stringify(userDetails));
      
      // Update BehaviorSubject and local variable
      this.userDetails = userDetails;
      this.userDetailsSubject.next(userDetails);
      
      console.log('User details stored:', userDetails);
    } catch (error) {
      console.error('Error decoding token or storing user details:', error);
    }
  }

  /**
   * Get user details from localStorage
   * @returns UserDetails or null
   */
  private getUserDetailsFromStorage(): UserDetails | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    try {
      const storedDetails = localStorage.getItem('user_details');
      return storedDetails ? JSON.parse(storedDetails) : null;
    } catch (error) {
      console.error('Error parsing stored user details:', error);
      return null;
    }
  }

  /**
   * Get current user details
   * @returns Current user details or null
   */
  getCurrentUserDetails(): UserDetails | null {
    return this.userDetails;
  }

  /**
   * Clear user details from storage and memory
   */
  private clearUserDetails(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user_details');
    }
    this.userDetails = null;
    this.userDetailsSubject.next(null);
  }

  /**
   * Sends login credentials to the backend API.
   * On success, stores the JWT and user data, then returns the response.
   * @param identifier Email or username
   * @param password User's password
   * @returns An Observable of the LoginResponse
   */
  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.LOGIN_URL, { email:identifier, password:password })
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) { // <-- Add this check
            localStorage.setItem('jwt_token', response.token);
            localStorage.setItem('user_data', JSON.stringify(response.user));
            this.isAuthenticatedSubject.next(true);
            
            console.log('Login successful, token stored.');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Retrieves the stored JWT.
   * @returns The JWT string or null if not found.
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) { // <-- Add this check
      return localStorage.getItem('jwt_token');
    }
    return null; // Return null if not in a browser environment
  }
private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) {
      return false; // No token found
    }

    try {
      // Decode the JWT to check its expiry
      const decodedToken: any = jwtDecode(token);
      // JWT 'exp' (expiration time) is in seconds since epoch
      if (decodedToken.exp * 1000 < Date.now()) {
        console.warn('Token has expired.');
        this.logout(); // Automatically log out if token is expired
        return false;
      }
      return true; // Token exists and is not expired
    } catch (error) {
      console.error('Error decoding token or token is invalid:', error);
      this.logout(); // Treat invalid token as logged out
      return false;
    }
  }

   // ⭐ New Method to Check Status and Navigate ⭐
  /**
   * @method checkAuthStatusAndNavigate
   * @description Checks if a valid token exists in storage.
   * If valid, navigates to the home page; otherwise, navigates to the login page.
   */
  checkAuthStatusAndNavigate(): void {
    if (this.hasValidToken()) {
      console.log('Valid token found. Navigating to home.');
      this.router.navigate(['/home']);
    } else {
      console.log('No valid token found. Navigating to login.');
      this.router.navigate(['/login']);
    }
  }
  /**
   * Checks if the user is authenticated (based on token presence).
   * For production, also consider token expiry validation.
   * @returns True if a token is present, false otherwise.
   */
  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return this.hasValidToken();
    }
    return false; // Not authenticated if not in a browser
  }

  /**
   * Retrieves user roles from stored user data.
   * This is a placeholder; you'll need to parse your actual user data structure.
   * @returns An array of strings representing user roles, or null if not available.
   */
  getUserRoles(): string[] | null {
    if (isPlatformBrowser(this.platformId)) { // <-- Add this check
      const userDataString = localStorage.getItem('user_data');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          if (userData && Array.isArray(userData.roles)) {
            return userData.roles;
          }
        } catch (e) {
          console.error('Error parsing user data from localStorage', e);
        }
      }
    }
    return null;
  }

  /**
   * Clears authentication data and redirects to login.
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) { // <-- Add this check
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_data');
      this.isAuthenticatedSubject.next(false);
    }
    
    // Clear user details
    this.clearUserDetails();
    this.router.navigate(['/landing']);
    console.log('Logged out.');
  }

  /**
   * Initiates the forgot password process by sending a reset code to the user's email.
   * @param email The user's email address.
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(this.FORGOT_PASSWORD_URL, { email }).pipe(
      tap(() => console.log('Forgot password request sent successfully.')),
      catchError(this.handleError)
    );
  }

  /**
   * Registers a new user.
   * @param userData The registration data (firstName, lastName, email, phoneNumber, password).
   */
  register(userData: RegisterData): Observable<any> { // Adjust return type based on API response
    // Remove confirmPassword and termsAccepted from the payload if your backend doesn't expect them
    const payload = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      password: userData.password,
      // Add other fields as per your backend API contract
    };
    return this.http.post<any>(this.REGISTER_URL, payload).pipe(
      tap(() => console.log('User registered successfully.')),
      catchError(this.handleError)
    );
  }

  /**
   * Verifies the authentication code sent to the user's email.
   * @param email The user's email address.
   * @param code The verification code.
   */
  verifyResetCode(email: string, code: string): Observable<any> {
    return this.http.post<any>(this.VERIFY_CODE_URL, { email, code }).pipe(
      tap(() => console.log('Verification code checked successfully.')),
      catchError(this.handleError)
    );
  }

  /**
   * Resets the user's password after successful code verification.
   * @param email The user's email address.
   * @param code The verification code.
   * @param newPassword The new password.
   */
  resetPassword(email: string, code: string, newPassword: string): Observable<any> {
    return this.http.post<any>(this.RESET_PASSWORD_URL, { email, code, newPassword }).pipe(
      tap(() => console.log('Password reset successfully.')),
      catchError(this.handleError)
    );
  }

  // ==================== NEW SWAGGER API METHODS ====================

  /**
   * Login with email
   * @param email User's email
   * @param password User's password
   * @returns Observable of AuthResponse
   */
  loginWithEmail(email: string, password: string): Observable<AuthResponse> {
    const request: EmailLoginRequest = { email, password };
    return this.userAuthService.loginWithEmail(request).pipe(
      tap(response => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('jwt_token', response.token);
          if (response.refreshToken) {
            localStorage.setItem('refresh_token', response.refreshToken);
          }
          if (response.brandId) {
            localStorage.setItem('brand_id', response.brandId);
          }
          this.isAuthenticatedSubject.next(true);
          
          // Store user details from the response
          this.storeUserDetails(response);
          
          console.log('Login successful, token and user details stored.');
        }
      }),
      catchError(this.handleError)
    );
  }
   /**
   * Login with username or email
   * @param username User's username or email
   * @param password User's password
   * @returns Observable of AuthResponse
   */
loginWithEmailOrUserName(emailOrUserName: string, password: string): Observable<AuthResponse> {
    const request: LoginRequest = { username: emailOrUserName, password };
    return this.userAuthService.login(request).pipe(
      tap(response => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('jwt_token', response.token);
          if (response.refreshToken) {
            localStorage.setItem('refresh_token', response.refreshToken);
          }
          if (response.brandId) {
            localStorage.setItem('brand_id', response.brandId);
          }
          this.isAuthenticatedSubject.next(true);
          // Store user details from the response
          this.storeUserDetails(response);
          console.log('Login successful, token and user details stored.');
        }
      }),
      catchError(this.handleError)
    );
  }
  /**
   * Login with username
   * @param username User's username
   * @param password User's password
   * @returns Observable of AuthResponse
   */
  loginWithUsername(username: string, password: string): Observable<AuthResponse> {
    const request: UsernameLoginRequest = { username, password };
    return this.userAuthService.loginWithUsername(request).pipe(
      tap(response => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('jwt_token', response.token);
          if (response.refreshToken) {
            localStorage.setItem('refresh_token', response.refreshToken);
          }
          if (response.brandId) {
            localStorage.setItem('brand_id', response.brandId);
          }
          this.isAuthenticatedSubject.next(true);
          console.log('Login successful, token stored.');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Register new user
   * @param userData Registration data
   * @returns Observable of registration response
   */
  registerUser(userData: RegisterRequest): Observable<any> {
    return this.userAuthService.register(userData).pipe(
      tap(() => console.log('User registered successfully.')),
      catchError(this.handleError)
    );
  }

  /**
   * Update user profile
   * @param profileData Profile update data
   * @param brandId Brand identifier
   * @returns Observable of update response
   */
  updateProfile(profileData: ProfileUpdateRequest, brandId: string): Observable<any> {
    return this.userAuthService.updateProfile(profileData, brandId).pipe(
      tap(() => console.log('Profile updated successfully.')),
      catchError(this.handleError)
    );
  }

  /**
   * Refresh authentication token
   * @returns Observable of refresh response
   */
  refreshToken(): Observable<any> {
    if (isPlatformBrowser(this.platformId)) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        return this.userAuthService.refreshToken(refreshToken).pipe(
          tap(response => {
            if (response.token) {
              localStorage.setItem('jwt_token', response.token);
            }
            if (response.refreshToken) {
              localStorage.setItem('refresh_token', response.refreshToken);
            }
            console.log('Token refreshed successfully.');
          }),
          catchError(this.handleError)
        );
      }
    }
    return throwError(() => new Error('No refresh token available'));
  }

  /**
   * Verify email address
   * @param token Verification token
   * @returns Observable of verification response
   */
  verifyEmail(token: string): Observable<any> {
    return this.userAuthService.verifyEmail(token).pipe(
      tap(() => console.log('Email verified successfully.')),
      catchError(this.handleError)
    );
  }

  /**
   * Google Sign-In authentication
   * @param idToken Google ID token
   * @returns Observable of AuthResponse
   */
  googleSignIn(idToken: string): Observable<AuthResponse> {
    const request: GoogleSignInRequest = { idToken };
    return this.userAuthService.googleSignIn(request).pipe(
      tap(response => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('jwt_token', response.token);
          if (response.refreshToken) {
            localStorage.setItem('refresh_token', response.refreshToken);
          }
          if (response.brandId) {
            localStorage.setItem('brand_id', response.brandId);
          }
          this.isAuthenticatedSubject.next(true);
          console.log('Google Sign-In successful, token stored.');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Check if username exists
   * @param username Username to check
   * @returns Observable of check result
   */
  checkUsernameExists(username: string): Observable<string> {
    return this.userAuthService.usernameExists(username).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Check if email exists
   * @param email Email to check
   * @param brandId Brand identifier
   * @returns Observable of check result
   */
  checkEmailExists(email: string, brandId: string): Observable<any> {
    return this.userAuthService.checkEmail({ email, brandId }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Send password reset code
   * @param email Email address
   * @returns Observable of response
   */
  sendPasswordResetCode(email: string): Observable<any> {
    const request: ForgotPasswordRequest = { email };
    return this.userAuthService.sendPasswordResetCode(request).pipe(
      tap(() => console.log('Password reset code sent successfully.')),
      catchError(this.handleError)
    );
  }

  /**
   * Verify password reset code
   * @param email Email address
   * @param code Verification code
   * @returns Observable of verification response
   */
  verifyPasswordResetCode(email: string, code: string): Observable<any> {
    const request: VerifyCodeRequest = { email, code };
    return this.userAuthService.verifyResetCode(request).pipe(
      tap(() => console.log('Reset code verified successfully.')),
      catchError(this.handleError)
    );
  }

  /**
   * Set new password after verification
   * @param userId User ID
   * @param email Email address
   * @param code Verification code
   * @param newPassword New password
   * @returns Observable of response
   */
  setNewPassword(userId: string, email: string, code: string, newPassword: string): Observable<any> {
    const request: SetNewPasswordRequest = { userId, email, code, newPassword };
    return this.userAuthService.setNewPassword(request).pipe(
      tap(() => console.log('Password set successfully.')),
      catchError(this.handleError)
    );
  }

  /**
   * Get stored brand ID
   * @returns Brand ID or null
   */
  getBrandId(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('brand_id');
    }
    return null;
  }

  /**
   * Get stored refresh token
   * @returns Refresh token or null
   */
  getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  /**
   * Complete logout that clears all tokens
   */
  logoutComplete(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('brand_id');
      localStorage.removeItem('user_data');
      this.isAuthenticatedSubject.next(false);
    }
    // Clear user details
    this.clearUserDetails();
    this.router.navigate(['/login']);
    console.log('Logged out successfully.');
  }

  /**
   * Handles HTTP errors from API calls.
   * @param error The HttpErrorResponse object.
   * @returns An Observable that throws an error with a user-friendly message.
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unexpected error occurred. Please try again later.';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error occurred.
      console.error('Client-side or network error:', error.error.message);
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`);

      // Enhanced error message extraction
      if (error.error?.message) {
        // First priority: error.error.message
        errorMessage = error.error.message;
      } else if (error.error?.error) {
        // Second priority: error.error.error
        errorMessage = error.error.error;
      } else if (typeof error.error === 'string') {
        // Third priority: error.error as string
        errorMessage = error.error;
      } else if (error.message) {
        // Fourth priority: error.message
        errorMessage = error.message;
      } else {
        // Fallback based on status codes
        if (error.status === 401 || error.status === 400) {
          errorMessage = 'Invalid email/username or password.';
        } else if (error.status === 403) {
          errorMessage = 'Access denied. You do not have permission to perform this action.';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again or contact support.';
        }
      }
    }
    
    console.error('AuthService handleError - Final error message:', errorMessage);
    // Return an observable with a user-facing error message
    return throwError(() => new Error(errorMessage));
  };
   /**
   * Generate a username based on first letter of first name and last name
   * @param firstName The user's first name
   * @param lastName The user's last name
   * @returns Generated username string
   */
generateUsername(firstName: string, lastName: string): string {
  if (!firstName || !lastName) {
    return '';
  }
  // Clean and prepare names
  const cleanFirstName = firstName.toLowerCase().replace(/\s+/g, '');
  const cleanLastName = lastName.toLowerCase().replace(/\s+/g, '');
  
  let username = '';
  
  // Scenario 1: Normal case (lastName length > 1)
  if (cleanLastName.length > 1) {
    username = `${cleanFirstName.charAt(0)}${cleanLastName}`;
  } 
  // Scenario 2: Single character lastName
  else {
    username = `${cleanLastName.charAt(0)}${cleanFirstName}`;
  }
  
  // Validation: Ensure minimum length of 3
  if (username.length < 3) {
    // Fallback: use more characters from firstName if available
    if (cleanFirstName.length >= 2 && cleanLastName.length >= 1) {
      username = `${cleanFirstName.substring(0, 2)}${cleanLastName}`;
    } else if (cleanFirstName.length >= 3) {
      username = cleanFirstName.substring(0, 3);
    } else {
      // If still too short, pad with numbers or return as is
      username = username.padEnd(3, '1');
    }
  }
  return username;
}
   publicForward(url: any): Observable<any> {
    const request: PublicForwardRequest = { url };
    return this.userAuthService.publicForward(request).pipe(
      tap(() => console.log('Password set successfully.', request)),
      catchError(this.handleError)
    );
  }
   privateForward(url: any): Observable<any> {
    return this.userAuthService.forwardRequest(url,this.userDetails?.token).pipe(
      tap((response:any) => console.log('Password set successfully.',response)),
      catchError(this.handleError)
    );
  }
  categoryFetch(): Observable<any> {
    return this.userAuthService.getCategories().pipe(
      tap((response:any) => console.log('Category fetched successfully.',response)),
      catchError(this.handleError)
    );
  }
  userProfileFetch(): Observable<any> {
    return this.userAuthService.getUserProfile().pipe(
      tap((response:any) => console.log('User profile fetched successfully.',response)),
      catchError(this.handleError)
    );
  }
  userProfileUpdate(data:any): Observable<any> {
    return this.userAuthService.updateUserProfile(data).pipe(
      tap((response:any) => console.log('User profile updated successfully.',response)),
      catchError(this.handleError)
    );
  }
  // ==================== BRAND DATA METHODS ====================

  /**
   * Get all brands with pagination
   * @param page Page number (default: 0)
   * @param size Page size (default: 20)
   * @returns Observable of paginated brand data
   */
  getAllBrands(page: number = 0, size: number = 20): Observable<any> {
    return this.userAuthService.getAllBrands(page, size).pipe(
      tap((response: any) => console.log('Brands fetched successfully.')),
      catchError(this.handleError)
    );
  }

  /**
   * Get brand by ID
   * @param id Brand ID
   * @returns Observable of brand data
   */
  getBrandById(id: number): Observable<any> {
    return this.userAuthService.getBrandById(id).pipe(
      tap((response: any) => console.log('Brand fetched successfully.', response)),
      catchError(this.handleError)
    );
  }

  // ==================== BRAND SEARCH AND FILTERING METHODS ====================

  /**
   * Search brands by query
   * @param query Search query
   * @param page Page number (default: 0)
   * @param size Page size (default: 20)
   * @returns Observable of paginated search results
   */
  searchBrands(query: string, page: number = 0, size: number = 20): Observable<any> {
    return this.userAuthService.searchBrands(query, page, size).pipe(
      tap((response: any) => console.log('Brand search completed successfully.', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get brand by website URL
   * @param website Website URL
   * @returns Observable of brand data
   */
  getBrandByWebsite(website: string): Observable<any> {
    return this.userAuthService.getBrandByWebsite(website).pipe(
      tap((response: any) => console.log('Brand fetched by website successfully.', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get brand by name
   * @param name Brand name
   * @returns Observable of brand data
   */
  getBrandByName(name: string): Observable<any> {
    return this.userAuthService.getBrandByName(name).pipe(
      tap((response: any) => console.log('Brand fetched by name successfully.', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get brands by domain
   * @param domain Domain name
   * @returns Observable of brand data array
   */
  getBrandsByDomain(domain: string): Observable<any> {
    return this.userAuthService.getBrandsByDomain(domain).pipe(
      tap((response: any) => console.log('Brands fetched by domain successfully.', response)),
      catchError(this.handleError)
    );
  }

  // ==================== BRAND EXTRACTION AND CLAIMING METHODS ====================

  /**
   * Extract brand data from URL
   * @param url Website URL to extract brand data from
   * @param mockResponse Optional mock response for testing
   * @returns Observable of extraction result
   */
  extractBrandData(url: string, mockResponse?: string): Observable<any> {
    return this.userAuthService.extractBrandData(url, mockResponse).pipe(
      tap((response: any) => console.log('Brand data extraction completed successfully.', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Claim a brand
   * @param brandId Brand ID to claim
   * @returns Observable of claim result
   */
  claimBrand(brandId: number): Observable<any> {
    return this.userAuthService.claimBrand(brandId).pipe(
      tap((response: any) => console.log('Brand claimed successfully.', response)),
      catchError(this.handleError)
    );
  }

  // ==================== BRAND ASSET AND IMAGE SERVING METHODS ====================

  /**
   * Get brand asset file
   * @param assetId Asset ID
   * @returns Observable of asset blob
   */
  getBrandAsset(assetId: number): Observable<Blob> {
    return this.userAuthService.serveBrandAsset(assetId).pipe(
      tap(() => console.log('Brand asset retrieved successfully.')),
      catchError(this.handleError)
    );
  }

  /**
   * Get brand image file
   * @param imageId Image ID
   * @returns Observable of image blob
   */
  getBrandImage(imageId: number): Observable<Blob> {
    return this.userAuthService.serveBrandImage(imageId).pipe(
      tap(() => console.log('Brand image retrieved successfully.')),
      catchError(this.handleError)
    );
  }

  /**
   * Get brand asset URL for direct access
   * @param assetId Asset ID
   * @returns Full URL to the asset
   */
  getBrandAssetUrl(assetId: number): string {
    return `${this.API_BASE_URL}/api/brands/assets/${assetId}`;
  }

  /**
   * Get brand image URL for direct access
   * @param imageId Image ID
   * @returns Full URL to the image
   */
  getBrandImageUrl(imageId: number): string {
    return `${this.API_BASE_URL}/api/brands/images/${imageId}`;
  }

  // ==================== BRAND STATISTICS AND ANALYTICS METHODS ====================

  /**
   * Get brand statistics
   * @returns Observable of brand statistics
   */
  getBrandStatistics(): Observable<any> {
    return this.userAuthService.getBrandStatistics().pipe(
      tap((response: any) => console.log('Brand statistics fetched successfully.', response)),
      catchError(this.handleError)
    );
  }

  // ==================== ADDITIONAL BRAND UTILITY METHODS ====================

  /**
   * Check if a brand is claimed
   * @param brandId Brand ID
   * @returns Promise<boolean> indicating if brand is claimed
   */
  async isBrandClaimed(brandId: number): Promise<boolean> {
    try {
      const brand = await this.getBrandById(brandId).toPromise();
      return brand?.isBrandClaimed || false;
    } catch (error) {
      console.error('Error checking brand claim status:', error);
      return false;
    }
  }

  /**
   * Get brand freshness score
   * @param brandId Brand ID
   * @returns Promise<number> brand freshness score
   */
  async getBrandFreshnessScore(brandId: number): Promise<number> {
    try {
      const brand = await this.getBrandById(brandId).toPromise();
      return brand?.freshnessScore || 0;
    } catch (error) {
      console.error('Error getting brand freshness score:', error);
      return 0;
    }
  }

  /**
   * Check if brand needs update
   * @param brandId Brand ID
   * @returns Promise<boolean> indicating if brand needs update
   */
  async doesBrandNeedUpdate(brandId: number): Promise<boolean> {
    try {
      const brand = await this.getBrandById(brandId).toPromise();
      return brand?.needsUpdate || false;
    } catch (error) {
      console.error('Error checking brand update status:', error);
      return false;
    }
  }

  /**
   * Get brand colors
   * @param brandId Brand ID
   * @returns Promise<any[]> array of brand colors
   */
  async getBrandColors(brandId: number): Promise<any[]> {
    try {
      const brand = await this.getBrandById(brandId).toPromise();
      return brand?.colors || [];
    } catch (error) {
      console.error('Error getting brand colors:', error);
      return [];
    }
  }

  /**
   * Get brand fonts
   * @param brandId Brand ID
   * @returns Promise<any[]> array of brand fonts
   */
  async getBrandFonts(brandId: number): Promise<any[]> {
    try {
      const brand = await this.getBrandById(brandId).toPromise();
      return brand?.fonts || [];
    } catch (error) {
      console.error('Error getting brand fonts:', error);
      return [];
    }
  }

  /**
   * Get brand social links
   * @param brandId Brand ID
   * @returns Promise<any[]> array of brand social links
   */
  async getBrandSocialLinks(brandId: number): Promise<any[]> {
    try {
      const brand = await this.getBrandById(brandId).toPromise();
      return brand?.socialLinks || [];
    } catch (error) {
      console.error('Error getting brand social links:', error);
      return [];
    }
  }

  /**
   * Get brand assets
   * @param brandId Brand ID
   * @returns Promise<any[]> array of brand assets
   */
  async getBrandAssets(brandId: number): Promise<any[]> {
    try {
      const brand = await this.getBrandById(brandId).toPromise();
      return brand?.assets || [];
    } catch (error) {
      console.error('Error getting brand assets:', error);
      return [];
    }
  }

  /**
   * Get brand images
   * @param brandId Brand ID
   * @returns Promise<any[]> array of brand images
   */
  async getBrandImages(brandId: number): Promise<any[]> {
    try {
      const brand = await this.getBrandById(brandId).toPromise();
      return brand?.images || [];
    } catch (error) {
      console.error('Error getting brand images:', error);
      return [];
    }
  }

  // ==================== BRAND SEARCH UTILITY METHODS ====================

  /**
   * Search brands by industry
   * @param industry Industry name
   * @param page Page number (default: 0)
   * @param size Page size (default: 20)
   * @returns Observable of filtered brand results
   */
  searchBrandsByIndustry(industry: string, page: number = 0, size: number = 20): Observable<any> {
    return this.searchBrands(`industry:${industry}`, page, size);
  }

  /**
   * Search brands by location
   * @param location Location name
   * @param page Page number (default: 0)
   * @param size Page size (default: 20)
   * @returns Observable of filtered brand results
   */
  searchBrandsByLocation(location: string, page: number = 0, size: number = 20): Observable<any> {
    return this.searchBrands(`location:${location}`, page, size);
  }

  /**
   * Search brands by company type
   * @param companyType Company type
   * @param page Page number (default: 0)
   * @param size Page size (default: 20)
   * @returns Observable of filtered brand results
   */
  searchBrandsByCompanyType(companyType: string, page: number = 0, size: number = 20): Observable<any> {
    return this.searchBrands(`companyType:${companyType}`, page, size);
  }

  /**
   * Get recently updated brands
   * @param page Page number (default: 0)
   * @param size Page size (default: 20)
   * @returns Observable of recently updated brands
   */
  getRecentlyUpdatedBrands(page: number = 0, size: number = 20): Observable<any> {
    return this.getAllBrands(page, size).pipe(
      map((response: any) => ({
        ...response,
        content: response.content?.sort((a: any, b: any) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      }))
    );
  }

  /**
   * Get claimed brands only
   * @param page Page number (default: 0)
   * @param size Page size (default: 20)
   * @returns Observable of claimed brands
   */
  getClaimedBrands(page: number = 0, size: number = 20): Observable<any> {
    return this.getAllBrands(page, size).pipe(
      map((response: any) => ({
        ...response,
        content: response.content?.filter((brand: any) => brand.isBrandClaimed)
      }))
    );
  }

  /**
   * Get unclaimed brands only
   * @param page Page number (default: 0)
   * @param size Page size (default: 20)
   * @returns Observable of unclaimed brands
   */
  getUnclaimedBrands(page: number = 0, size: number = 20): Observable<any> {
    return this.getAllBrands(page, size).pipe(
      map((response: any) => ({
        ...response,
        content: response.content?.filter((brand: any) => !brand.isBrandClaimed)
      }))
    );
  }

  /**
   * Upload profile image
   * @param formData FormData containing the image file and userId
   * @returns Observable of upload response
   */
  uploadProfileImage(formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.API_BASE_URL}/api/users/profile/image`, formData).pipe(
      tap((response: any) => console.log('Profile image uploaded successfully.', response)),
      catchError(this.handleError)
    );
  }


}
