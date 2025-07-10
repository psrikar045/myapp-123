import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private loggedInStatus = new BehaviorSubject<boolean>(this.hasToken());

  // Observable for components to subscribe to login status changes
  loggedIn$ = this.loggedInStatus.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
      this.loggedInStatus.next(true);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  removeToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      this.loggedInStatus.next(false);
    }
  }

  isLoggedIn(): boolean {
    return this.loggedInStatus.value;
  }

  private hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem(this.TOKEN_KEY);
    }
    return false;
  }

  // Placeholder for login method
  login(credentials: any): /* Observable<any> | */ Promise<any> {
    // Replace with actual API call
    // For example:
    // return this.apiService.post('/auth/login', credentials).pipe(
    //   tap((response: any) => {
    //     if (response && response.token) {
    //       this.saveToken(response.token);
    //     }
    //   })
    // );
    return new Promise((resolve) => {
      // Simulate API call
      setTimeout(() => {
        const fakeToken = 'fake-jwt-token';
        this.saveToken(fakeToken);
        resolve({ token: fakeToken });
      }, 1000);
    });
  }

  // Placeholder for logout method
  logout(): void {
    this.removeToken();
    // Additional cleanup if needed, e.g., redirect to login
    // this.router.navigate(['/login']);
  }

  // Placeholder for token refresh logic
  refreshToken(): /* Observable<any> | */ Promise<any> {
    // This would typically involve an API call to a refresh token endpoint
    // Example:
    // return this.apiService.post('/auth/refresh', { refreshToken: this.getRefreshToken() }).pipe(
    //   tap((response: any) => {
    //     if (response && response.token) {
    //       this.saveToken(response.token);
    //     }
    //   })
    // );
    return new Promise((resolve, reject) => {
      // Simulate refresh
      const currentToken = this.getToken();
      if (currentToken) {
        setTimeout(() => {
          const refreshedToken = 'refreshed-fake-jwt-token';
          this.saveToken(refreshedToken);
          resolve({ token: refreshedToken });
        }, 500);
      } else {
        reject('No token to refresh');
      }
    });
  }
}
