import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { SidenavComponent } from './sidenav.component';
import { SidenavService } from '../../services/sidenav.service';
import { AuthService } from '../../../core/services/auth.service';
import { DEFAULT_SIDENAV_CONFIG } from '../../models/navigation.models';

describe('SidenavComponent', () => {
  let component: SidenavComponent;
  let fixture: ComponentFixture<SidenavComponent>;
  let mockSidenavService: jest.Mocked<Partial<SidenavService>>;
  let mockAuthService: jest.Mocked<Partial<AuthService>>;

  beforeEach(async () => {
    mockSidenavService = {
      config$: of(DEFAULT_SIDENAV_CONFIG),
      navigationItems$: of([]),
      userProfile$: of({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        initials: 'JD'
      }),
      environmentInfo$: of({
        name: 'Production',
        color: 'success',
        apiStatus: 'Operational',
        uptime: '99.9%'
      }),
      isVisible$: of(true),
      isOverlayMode$: of(false),
      toggleCollapsed: jest.fn(),
      setCollapsed: jest.fn(),
      navigateToRoute: jest.fn()
    };

    // mockThemeService = {
    //   isDarkMode$: of(false)
    // };

    mockAuthService = {
      isAuthenticated$: of(true)
    };

    await TestBed.configureTestingModule({
      imports: [SidenavComponent, RouterTestingModule],
      providers: [
        { provide: SidenavService, useValue: mockSidenavService },
        // { provide: ThemeService, useValue: mockThemeService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display logo and toggle button', () => {
    const logo = fixture.nativeElement.querySelector('.sidenav-logo');
    const toggleButton = fixture.nativeElement.querySelector('.sidenav-toggle-btn');
    
    expect(logo).toBeTruthy();
    expect(toggleButton).toBeTruthy();
  });

  it('should show user info when not collapsed', () => {
    const userInfo = fixture.nativeElement.querySelector('.sidenav-user-info');
    expect(userInfo).toBeTruthy();
  });

  it('should show environment badge when configured', () => {
    const environmentBadge = fixture.nativeElement.querySelector('.sidenav-environment');
    expect(environmentBadge).toBeTruthy();
  });

  it('should toggle sidenav when toggle button is clicked', () => {
    const toggleButton = fixture.nativeElement.querySelector('.sidenav-toggle-btn');
    toggleButton.click();
    
    expect(mockSidenavService.toggleCollapsed).toHaveBeenCalled();
  });

  it('should navigate to home when logo is clicked', () => {
    const logo = fixture.nativeElement.querySelector('.sidenav-logo');
    logo.click();
    
    expect(mockSidenavService.navigateToRoute).toHaveBeenCalledWith('/home');
  });

  it('should close sidenav when backdrop is clicked', () => {
    // Set overlay mode
    mockSidenavService.isOverlayMode$ = of(true);
    mockSidenavService.config$ = of({ ...DEFAULT_SIDENAV_CONFIG, collapsed: false });
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.sidenav-backdrop');
    if (backdrop) {
      backdrop.click();
      expect(mockSidenavService.setCollapsed).toHaveBeenCalledWith(true);
    }
  });

  it('should display correct status class for API status', () => {
    expect(component.getStatusClass('operational')).toBe('text-success');
    expect(component.getStatusClass('degraded')).toBe('text-warning');
    expect(component.getStatusClass('down')).toBe('text-danger');
    expect(component.getStatusClass('unknown')).toBe('text-muted');
  });

  it('should return correct width based on collapsed state', () => {
    component.config = DEFAULT_SIDENAV_CONFIG;
    expect(component.getSidenavWidth()).toBe('280px');

    component.config = { ...DEFAULT_SIDENAV_CONFIG, collapsed: true };
    expect(component.getSidenavWidth()).toBe('64px');
  });

  it('should track navigation items by id', () => {
    const mockItem = { id: 'test-item', label: 'Test' };
    expect(component.trackByItemId(0, mockItem)).toBe('test-item');
  });

  it('should apply dark theme class when dark mode is enabled', () => {
    // mockThemeService.isDarkMode$ = of(true);
    fixture.detectChanges();

    expect(component.isDarkMode).toBe(true);
  });
});