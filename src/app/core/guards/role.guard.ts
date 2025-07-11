import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Ensure path is correct

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First, check if the user is authenticated at all
  if (!authService.isAuthenticated()) { // <-- Corrected from isLoggedIn() to isAuthenticated()
    router.navigate(['/login']); // Redirect to login if not authenticated
    return false;
  }

  // --- Placeholder for Role-based logic ---
  // If you are not implementing roles yet, you can simplify this or remove the role-specific parts.
  const requiredRoles = route.data?.['roles'] as string[]; // Get roles from route data
  // You would need a method in AuthService to get the user's roles, e.g.:
  // const userRoles = authService.getUserRoles(); // Requires implementation in AuthService

  // For demonstration, let's assume any authenticated user can access if no specific roles are required
  // If roles are required, and userRoles are available:
  // if (requiredRoles && userRoles && !requiredRoles.every(role => userRoles.includes(role))) {
  //   router.navigate(['/unauthorized']); // Or some other forbidden page
  //   return false;
  // }
  // --- End Placeholder ---

  return true; // User is authenticated (and optionally, roles check passes)
};
