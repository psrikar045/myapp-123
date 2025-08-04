import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('roleGuard', () => {
  let mockAuthService: any;
  let mockRouter: any;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: jest.fn()
    } as any;
    mockRouter = {
      navigate: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    route = { data: {} } as ActivatedRouteSnapshot;
    state = {} as RouterStateSnapshot;
  });

  it('should allow access when user is authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should allow access for authenticated user with no role requirements', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    route.data = {}; // No roles required

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

    expect(result).toBe(true);
  });
});

