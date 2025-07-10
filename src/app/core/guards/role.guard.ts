import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Assuming AuthService holds role info or can fetch it
// import { NotificationService } from '../services/notification.service'; // Example

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    // private notificationService: NotificationService // Example
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // This is a placeholder implementation.
    // A real implementation would check user roles against route data.
    // For example, if route.data.expectedRole is 'admin'
    // const expectedRole = route.data.expectedRole;
    // const userRole = this.authService.getUserRole(); // Assuming AuthService has a method like this

    // For now, let's assume if the user is logged in, they pass the role guard.
    // This is NOT a secure or correct role check for a real app.
    if (this.authService.isLoggedIn()) { // isLoggedIn() is synchronous check from AuthService
      // In a real app:
      // if (this.authService.hasRole(expectedRole)) {
      //   return true;
      // } else {
      //   this.notificationService.showError('You do not have permission to access this page.');
      //   return this.router.createUrlTree(['/dashboard']); // Or an unauthorized page
      // }
      return true; // Placeholder: allow if logged in
    }

    // If not logged in, AuthGuard should have already redirected.
    // But as a fallback, redirect to login.
    return this.router.createUrlTree(['/login'], { queryParams: { redirectUrl: state.url } });
  }
}
