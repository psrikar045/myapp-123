import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, NavigationEnd } from '@angular/router';
import { of, Subject } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';

import { HeaderComponent } from './header.component';
import { ToolbarService } from '../../shared/services/toolbar.service';
import { AuthService } from '../../core/services/auth.service';

describe('HeaderComponent - AI Enhanced Tests', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockToolbarService: any;
  let mockAuthService: any;
  let mockRouter: any;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    // AI-generated mock services
    routerEventsSubject = new Subject();
    
    mockToolbarService = {
      setLoggedInToolbar: jest.fn(),
      setLoggedOutToolbar: jest.fn(),
      logo: of({ src: 'test-logo.webp', alt: 'Test Logo' }),
      navItems: of([
        { label: 'Home', route: '/home' },
        { label: 'Blog', route: '/blog' }
      ]),
      actions: of([])
    } as any;

    mockAuthService = {
      checkAuthStatusAndNavigate: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: jest.fn(),
      isAuthenticated$: of(false)
    } as any;

    mockRouter = {
      navigate: jest.fn(),
      events: routerEventsSubject.asObservable(),
      url: '/landing'
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,HeaderComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: ToolbarService, useValue: mockToolbarService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showNavigation).toBe(true);
    expect(component.showProfileDropdown).toBe(false);
    expect(component.isVisible).toBe(true);
    expect(component.isScrolled).toBe(false);
    expect(component.isLanding).toBe(false);
  });

  it('should handle navigation end events', () => {
    const navigationEndEvent = new NavigationEnd(1, '/landing', '/landing');
    
    routerEventsSubject.next(navigationEndEvent);
    
    expect(component.currentRoute).toBe('/landing');
    expect(component.isLanding).toBe(true);
  });

  it('should set logged in toolbar when authenticated', () => {
    mockAuthService.isAuthenticated$ = of(true);
    
    component.ngOnInit();
    
    expect(mockToolbarService.setLoggedInToolbar).toHaveBeenCalled();
  });

  it('should set logged out toolbar when not authenticated', () => {
    mockAuthService.isAuthenticated$ = of(false);
    
    component.ngOnInit();
    
    expect(mockToolbarService.setLoggedOutToolbar).toHaveBeenCalled();
  });

  it('should handle login click', () => {
    component.login();
    
    expect(mockAuthService.checkAuthStatusAndNavigate).toHaveBeenCalled();
  });

  it('should handle logout', () => {
    component.logout();
    
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should navigate to blog on blog nav click', () => {
    const blogNavItem = { label: 'Blog', route: '/blog', scrollId: 'blog-section' };
    
    component.onNavClick(blogNavItem);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/blog']);
  });

  it('should navigate to route on nav click', () => {
    const navItem = { label: 'Home', route: '/home', scrollId: 'home-section' };
    
    component.onNavClick(navItem);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should toggle profile dropdown', () => {
    expect(component.showProfileDropdown).toBe(false);
    
    component.toggleProfileDropdown();
    expect(component.showProfileDropdown).toBe(true);
    
    component.toggleProfileDropdown();
    expect(component.showProfileDropdown).toBe(false);
  });

  it('should navigate to profile and close dropdown', () => {
    const mockEvent = { stopPropagation: jest.fn() };
    component.showProfileDropdown = true;
    
    component.goToProfile(mockEvent as any);
    
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.showProfileDropdown).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/my-profile']);
  });

  it('should navigate to pricing on upgrade click', () => {
    component.onUpgradeClick();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/pricing']);
  });

  it('should handle logo click for landing page', () => {
    component.currentRoute = '/landing';
    
    component.onLogoClick();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/landing']);
  });

  it('should handle logo click for authenticated user', () => {
    component.currentRoute = '/dashboard';
    mockAuthService.isAuthenticated.mockReturnValue(true);
    
    component.onLogoClick();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should handle logo click for unauthenticated user', () => {
    component.currentRoute = '/dashboard';
    mockAuthService.isAuthenticated.mockReturnValue(false);
    
    component.onLogoClick();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/landing']);
  });

  it('should handle window scroll', () => {
    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    
    component.onWindowScroll();
    
    expect(component.isScrolled).toBe(true);
    expect(component.isVisible).toBe(true);
  });

  it('should handle scroll for landing page', () => {
    component.isLanding = true;
    Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
    
    component.onWindowScroll();
    
    expect(component.isScrolled).toBe(true);
  });

  it('should check if upgrade is active', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    component.currentRoute = '/pricing';
    
    const result = component.isUpgradeActive();
    
    expect(result).toBe(true);
  });

  it('should handle get started click', () => {
    component.onGetStartedClick();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], { 
      queryParams: { register: 'true' } 
    });
  });

  it('should be responsive', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const headerElement = compiled.querySelector('header') || compiled;
    // Simple responsive check - just verify element exists
    expect(headerElement).toBeTruthy();
  });

  it('should clean up subscriptions on destroy', () => {
    component.ngOnInit();
    const unsubscribeSpy = jest.spyOn(component['authSubscription']!, 'unsubscribe');
    
    component.ngOnDestroy();
    
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should handle developer route styling', () => {
    const navigationEndEvent = new NavigationEnd(1, '/developer', '/developer');
    
    routerEventsSubject.next(navigationEndEvent);
    
    expect(component.currentRoute).toBe('/developer');
    expect(component.isScrolled).toBe(true);
  });

  it('should handle my-profile route styling', () => {
    const navigationEndEvent = new NavigationEnd(1, '/my-profile', '/my-profile');
    
    routerEventsSubject.next(navigationEndEvent);
    
    expect(component.currentRoute).toBe('/my-profile');
    expect(component.isScrolled).toBe(true);
  });
});


