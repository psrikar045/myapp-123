import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { of, Subject } from 'rxjs';

import { SidenavService } from './sidenav.service';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';

describe('SidenavService', () => {
  let service: SidenavService;
  let mockAuthService: jest.Mocked<Partial<AuthService>>;
  let mockLayoutService: jest.Mocked<Partial<LayoutService>>;
  let mockRouter: jest.Mocked<Partial<Router>>;
  let routerEventsSubject: Subject<any>;

  beforeEach(() => {
    routerEventsSubject = new Subject();
    
    mockAuthService = {
      isAuthenticated$: of(true),
      userDetails$: of({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        roles: ['ADMIN']
      })
    };

    mockLayoutService = {
      isMobileOrTablet$: of(false)
    };

    mockRouter = {
      events: routerEventsSubject.asObservable(),
      navigate: jest.fn().mockReturnValue(Promise.resolve(true))
    };

    TestBed.configureTestingModule({
      providers: [
        SidenavService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(SidenavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize navigation items', () => {
    service.navigationItems$.subscribe(items => {
      expect(items).toBeDefined();
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].label).toBe('Home');
    });
  });

  it('should toggle collapsed state', () => {
    service.config$.subscribe(config => {
      expect(config.collapsed).toBe(false);
    });

    service.toggleCollapsed();

    service.config$.subscribe(config => {
      expect(config.collapsed).toBe(true);
    });
  });

  it('should set user profile from auth service', () => {
    service.userProfile$.subscribe(profile => {
      expect(profile).toBeDefined();
      expect(profile?.name).toBe('John Doe');
      expect(profile?.email).toBe('john.doe@example.com');
      expect(profile?.role).toBe('Admin');
      expect(profile?.initials).toBe('JD');
    });
  });

  it('should update active states on route change', () => {
    const navigationEndEvent = new NavigationEnd(1, '/dashboard', '/dashboard');
    routerEventsSubject.next(navigationEndEvent);

    service.navigationItems$.subscribe(items => {
      const homeSection = items.find(item => item.id === 'home');
      const dashboardItem = homeSection?.children?.find(item => item.id === 'dashboard');
      expect(dashboardItem?.isActive).toBe(true);
      expect(homeSection?.isExpanded).toBe(true);
    });
  });

  it('should navigate to route', () => {
    service.navigateToRoute('/test-route');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/test-route']);
  });

  it('should toggle item expanded state', () => {
    service.toggleItemExpanded('home');

    service.navigationItems$.subscribe(items => {
      const homeItem = items.find(item => item.id === 'home');
      expect(homeItem?.isExpanded).toBe(true);
    });
  });

  it('should be visible when authenticated', () => {
    service.isVisible$.subscribe(isVisible => {
      expect(isVisible).toBe(true);
    });
  });

  it('should set overlay mode on mobile', () => {
    mockLayoutService.isMobileOrTablet$ = of(true);
    
    service.isOverlayMode$.subscribe(isOverlay => {
      expect(isOverlay).toBe(true);
    });
  });
});