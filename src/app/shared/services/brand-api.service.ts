import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import {
  BrandDataResponse,
  PageBrandDataResponse,
  BrandStatistics
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class BrandApiService {
  private readonly baseUrl = environment.baseApiUrl;
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  /**
   * Get all brands with pagination
   * GET /api/brands
   */
  getAllBrands(page: number = 0, size: number = 20): Observable<PageBrandDataResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageBrandDataResponse>(`${this.baseUrl}/api/brands`, { params })
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

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
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