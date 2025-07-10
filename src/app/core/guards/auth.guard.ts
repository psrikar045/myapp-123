import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
  CanActivate // Re-add CanActivate since it's a class-based guard
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Note: The plan generated class-based guards and provided them.
// If we want to switch to functional guards, the provision in app.config.ts would change.
// For now, sticking to class-based as generated and provided.
// To fix linter 'prefer-inject', constructor injection is used.

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate { // Still implements CanActivate for class-based
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot, // Parameter is used for potential future use (e.g. roles from route data)
    state: RouterStateSnapshot // Parameter is used for redirect URL
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.loggedIn$.pipe(
      take(1), // Take the latest value and complete
      map(isLoggedIn => {
        if (isLoggedIn) {
          return true;
        }
        // Store the attempted URL for redirecting after login
        const redirectUrl = state.url;
        // Redirect to the login page
        return this.router.createUrlTree(['/login'], { queryParams: { redirectUrl } });
      })
    );
  }
}

// Example of a functional AuthGuard (if we were to switch)
// export const authGuardFn: CanActivateFn = (
//   route: ActivatedRouteSnapshot,
//   state: RouterStateSnapshot
// ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
//   const authService = inject(AuthService);
//   const router = inject(Router);
//   return authService.loggedIn$.pipe(
//     take(1),
//     map(isLoggedIn => {
//       if (isLoggedIn) {
//         return true;
//       }
//       return router.createUrlTree(['/login'], { queryParams: { redirectUrl: state.url } });
//     })
//   );
// };
