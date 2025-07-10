import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Verify path

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const authToken = authService.getToken();

  // Exclude token for specific URLs if needed (e.g., login, register, refresh token endpoint)
  // if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh')) {
  //   return next(req);
  // }

  if (authToken) {
    // Clone the request and add the authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return next(authReq);
  }

  // If no token, pass the original request
  return next(req);
};
