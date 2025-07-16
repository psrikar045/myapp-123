import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IdGeneratorApiService {
  private readonly baseUrl = environment.baseApiUrl;
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

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
   * Generate DOMBR user ID
   * POST /api/id-generator/user-id/generate
   */
  generateDombrUserId(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/id-generator/user-id/generate`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Generate a simple DOMBR user ID
   * POST /api/id-generator/user-id/generate-simple
   */
  generateSimpleDombrUserId(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/id-generator/user-id/generate-simple`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Initialize DOMBR sequence
   * POST /api/id-generator/user-id/init
   */
  initDombrSequence(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/id-generator/user-id/init`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Preview next DOMBR user ID without generating it
   * GET /api/id-generator/user-id/preview
   */
  previewNextDombrUserId(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/id-generator/user-id/preview`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Preview next ID with default prefix without generating it
   * GET /api/id-generator/preview
   */
  previewNextId(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/id-generator/preview`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Preview next ID with custom prefix without generating it
   * GET /api/id-generator/preview/{prefix}
   */
  previewNextIdWithPrefix(prefix: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/id-generator/preview/${prefix}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all available prefixes
   * GET /api/id-generator/prefixes
   */
  getAllPrefixes(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/id-generator/prefixes`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get current number for a specific prefix
   * GET /api/id-generator/current/{prefix}
   */
  getCurrentNumber(prefix: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/id-generator/current/${prefix}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Reset sequence for a prefix (use with caution!)
   * POST /api/id-generator/reset/{prefix}
   */
  resetSequence(prefix: string, startNumber: number = 0): Observable<any> {
    const params = new HttpParams().set('startNumber', startNumber.toString());
    return this.http.post<any>(`${this.baseUrl}/api/id-generator/reset/${prefix}`, {}, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'An unexpected error occurred. Please try again later.';
    
    // Check if we're in browser environment and ErrorEvent is available
    if (isPlatformBrowser(this.platformId) && 
        typeof ErrorEvent !== 'undefined' && 
        error.error instanceof ErrorEvent) {
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
}