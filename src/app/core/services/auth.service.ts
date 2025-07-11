import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router'; // For redirection after login/logout

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
          // Store JWT and user data securely (localStorage for simplicity here, consider alternatives for production)
          localStorage.setItem('jwt_token', response.token);
          localStorage.setItem('user_data', JSON.stringify(response.user));
          console.log('Login successful, token stored.');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Retrieves the stored JWT.
   * @returns The JWT string or null if not found.
   */
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  /**
   * Checks if the user is authenticated (based on token presence).
   * For production, also consider token expiry validation.
   * @returns True if a token is present, false otherwise.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    // In a real app, you'd also decode the token and check its expiry (exp claim)
    return !!token;
  }

  /**
   * Clears authentication data and redirects to login.
   */
  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    this.router.navigate(['/login']); // Redirect to login page
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
