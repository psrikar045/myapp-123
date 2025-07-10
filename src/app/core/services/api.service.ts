import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // Removed HttpHeaders
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseApiUrl = environment.baseApiUrl;

  constructor(private http: HttpClient) {} // Inject HttpClient

  // Example GET request
  get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
    return this.http.get<T>(`${this.baseApiUrl}${path}`, { params });
  }

  // Example POST request
  post<T>(path:string, body: object = {}): Observable<T> {
    return this.http.post<T>(`${this.baseApiUrl}${path}`, body);
  }

  // Example PUT request
  put<T>(path: string, body: object = {}): Observable<T> {
    return this.http.put<T>(`${this.baseApiUrl}${path}`, body);
  }

  // Example DELETE request
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseApiUrl}${path}`);
  }
}
