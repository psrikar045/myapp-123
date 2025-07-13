import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserAuthService } from './user-auth.service';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProtectedResourceService {

  constructor(
    private userAuthService: UserAuthService,
    private authService: AuthService
  ) {}

  /**
   * Access protected resource with brand ID
   * @param brandId Brand identifier
   * @returns Observable of protected resource response
   */
  access(brandId?: string): Observable<string> {
    // Use provided brandId or get from auth service
    const activeBrandId = brandId || this.authService.getBrandId();
    
    if (!activeBrandId) {
      throw new Error('Brand ID is required to access protected resources');
    }
    
    return this.userAuthService.accessProtectedResource(activeBrandId);
  }

  /**
   * Check if user has access to protected resources
   * @returns True if user is authenticated and has brand ID
   */
  hasAccess(): boolean {
    return this.authService.isAuthenticated() && !!this.authService.getBrandId();
  }

  /**
   * Get current user's brand ID
   * @returns Brand ID or null
   */
  getCurrentBrand(): string | null {
    return this.authService.getBrandId();
  }

  /**
   * Validate brand ID format
   * @param brandId Brand ID to validate
   * @returns True if format is valid
   */
  validateBrand(brandId: string): boolean {
    // Basic validation for brand ID format
    const brandIdRegex = /^[a-zA-Z0-9_-]+$/;
    return brandIdRegex.test(brandId) && brandId.length >= 3 && brandId.length <= 50;
  }

  /**
   * Set brand ID for current session
   * @param brandId Brand ID to set
   */
  setBrand(brandId: string): void {
    if (this.validateBrand(brandId)) {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('brand_id', brandId);
      }
    } else {
      throw new Error('Invalid brand ID format');
    }
  }

  /**
   * Clear brand ID from current session
   */
  clearBrand(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('brand_id');
    }
  }

  /**
   * Get available brand IDs for current user
   * This would typically come from user profile or a separate endpoint
   * @returns Array of available brand IDs
   */
  getAvailableBrands(): string[] {
    // This is a placeholder - in a real implementation, this would
    // fetch from user profile or a dedicated endpoint
    const userData = this.authService.getUserRoles();
    if (userData && Array.isArray(userData)) {
      return userData.filter(role => role.startsWith('brand_'));
    }
    return [];
  }

  /**
   * Switch to a different brand context
   * @param brandId New brand ID to switch to
   * @returns Observable indicating success
   */
  switchContext(brandId: string): Observable<boolean> {
    return new Observable(observer => {
      try {
        if (!this.validateBrand(brandId)) {
          throw new Error('Invalid brand ID format');
        }

        // Verify access to the new brand
        this.access(brandId).subscribe({
          next: () => {
            this.setBrand(brandId);
            observer.next(true);
            observer.complete();
          },
          error: (error) => {
            observer.error(new Error(`Cannot switch to brand ${brandId}: ${error.message}`));
          }
        });
      } catch (error) {
        observer.error(error);
      }
    });
  }
}