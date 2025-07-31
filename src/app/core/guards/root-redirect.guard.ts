import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const rootRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // During SSR/prerendering, redirect to landing page to avoid authentication checks
  if (!isPlatformBrowser(platformId)) {
    router.navigate(['/landing']);
    return false;
  }

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
