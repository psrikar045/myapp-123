import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseApiUrl = environment.baseApiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Generic GET request
   * @param path API endpoint path
   * @param params HTTP parameters
   * @param headers HTTP headers
   * @returns Observable of response
   */
  get<T>(
    path: string, 
    params: HttpParams = new HttpParams(),
    headers?: HttpHeaders
  ): Observable<any> {
    const options: any = { params };
    if (headers) {
      options.headers = headers;
    }
    return this.http.get<T>(`${this.baseApiUrl}${path}`, options);
  }

  /**
   * Generic POST request
   * @param path API endpoint path
   * @param body Request body
   * @param headers HTTP headers
   * @returns Observable of response
   */
  post<T>(
    path: string, 
    body: object = {},
    headers?: HttpHeaders
  ): Observable<any> {
    const options: any = {};
    if (headers) {
      options.headers = headers;
    }
    return this.http.post<T>(`${this.baseApiUrl}${path}`, body, options);
  }

  /**
   * Generic PUT request
   * @param path API endpoint path
   * @param body Request body
   * @param headers HTTP headers
   * @returns Observable of response
   */
  put<T>(
    path: string, 
    body: object = {},
    headers?: HttpHeaders
  ): Observable<any> {
    const options: any = {};
    if (headers) {
      options.headers = headers;
    }
    return this.http.put<T>(`${this.baseApiUrl}${path}`, body, options);
  }

  /**
   * Generic DELETE request
   * @param path API endpoint path
   * @param headers HTTP headers
   * @returns Observable of response
   */
  delete<T>(
    path: string,
    headers?: HttpHeaders
  ): Observable<any> {
    const options: any = {};
    if (headers) {
      options.headers = headers;
    }
    return this.http.delete<T>(`${this.baseApiUrl}${path}`, options);
  }

  /**
   * Generic PATCH request
   * @param path API endpoint path
   * @param body Request body
   * @param headers HTTP headers
   * @returns Observable of response
   */
  patch<T>(
    path: string, 
    body: object = {},
    headers?: HttpHeaders
  ): Observable<any> {
    const options: any = {};
    if (headers) {
      options.headers = headers;
    }
    return this.http.patch<T>(`${this.baseApiUrl}${path}`, body, options);
  }

  /**
   * File upload request
   * @param path API endpoint path
   * @param file File to upload
   * @param additionalData Additional form data
   * @returns Observable of response
   */
  uploadFile<T>(
    path: string, 
    file: File, 
    additionalData?: { [key: string]: string }
  ): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }
    
    return this.http.post<T>(`${this.baseApiUrl}${path}`, formData);
  }

  /**
   * Download file request
   * @param path API endpoint path
   * @param params HTTP parameters
   * @returns Observable of blob
   */
  downloadFile(
    path: string, 
    params: HttpParams = new HttpParams()
  ): Observable<Blob> {
    return this.http.get(`${this.baseApiUrl}${path}`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Get full API URL
   * @param path API endpoint path
   * @returns Full URL string
   */
  getFullUrl(path: string): string {
    return `${this.baseApiUrl}${path}`;
  }

  /**
   * Create HTTP headers with authentication
   * @param additionalHeaders Additional headers to include
   * @returns HttpHeaders object
   */
  createAuthHeaders(additionalHeaders?: { [key: string]: string }): HttpHeaders {
    let headers = new HttpHeaders();
    
    // Note: Authentication headers are now handled by the interceptor
    // This method is kept for cases where manual header creation is needed
    
    if (additionalHeaders) {
      Object.keys(additionalHeaders).forEach(key => {
        headers = headers.set(key, additionalHeaders[key]);
      });
    }
    
    return headers;
  }

  /**
   * Create HTTP parameters from object
   * @param params Parameters object
   * @returns HttpParams object
   */
  createHttpParams(params: { [key: string]: string | number | boolean }): HttpParams {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    
    return httpParams;
  }
}
