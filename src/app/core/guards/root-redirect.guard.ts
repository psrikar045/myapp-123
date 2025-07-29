import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const rootRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    // User is authenticated, redirect to home page
    router.navigate(['/home']);
    return false;
  } else {
    // User is not authenticated, redirect to landing page
    router.navigate(['/landing']);
    return false;
  }
};
