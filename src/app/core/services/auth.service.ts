import { Injectable, inject, PLATFORM_ID } from '@angular/core'; // <-- Add PLATFORM_ID
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common'; // <-- Import isPlatformBrowser

// Define interfaces for clarity
interface LoginResponse {
  token: string;
  user: { // You can expand this interface based on actual user data returned
    id: string;
    username: string;
    email: string;
    // Add other user properties like roles, etc.
  };
  // Potentially include refreshToken if your auth flow uses it
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // IMPORTANT: Replace with your actual backend base URL
  private readonly API_BASE_URL = 'http://localhost:3000'; // Example backend URL
  private readonly LOGIN_URL = `${this.API_BASE_URL}/api/auth/login`;

  private readonly platformId = inject(PLATFORM_ID); // <-- Inject PLATFORM_ID

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Sends login credentials to the backend API.
   * On success, stores the JWT and user data, then returns the response.
   * @param identifier Email or username
   * @param password User's password
   * @returns An Observable of the LoginResponse
   */
  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.LOGIN_URL, { identifier, password })
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) { // <-- Add this check
            localStorage.setItem('jwt_token', response.token);
            localStorage.setItem('user_data', JSON.stringify(response.user));
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

  /**
   * Checks if the user is authenticated (based on token presence).
   * For production, also consider token expiry validation.
   * @returns True if a token is present, false otherwise.
   */
  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) { // <-- Add this check
      const token = this.getToken();
      // For production, also check token expiry:
      // const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
      // return !!token && payload && payload.exp * 1000 > Date.now();
      return !!token;
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
    }
    this.router.navigate(['/login']);
    console.log('Logged out.');
  }

  /**
   * Handles HTTP errors from API calls.
   * @param error The HttpErrorResponse object.
   * @returns An Observable that throws an error with a user-friendly message.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
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

      if (error.status === 401 || error.status === 400) {
        // Specific errors for invalid credentials or bad request
        errorMessage = error.error?.message || 'Invalid email/username or password.';
      } else if (error.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again or contact support.';
      } else if (error.error && error.error.message) {
        // Generic error message from backend if available
        errorMessage = error.error.message;
      }
    }
    // Return an observable with a user-facing error message
    return throwError(() => new Error(errorMessage));
  }
}
