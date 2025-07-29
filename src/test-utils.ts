import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';

// Common mock services
export const createMockAuthService = () => ({
  isAuthenticated: jest.fn().mockReturnValue(true),
  getToken: jest.fn().mockReturnValue('mock-token'),
  getBrandId: jest.fn().mockReturnValue('mock-brand-id'),
  login: jest.fn().mockReturnValue(of({ success: true })),
  logout: jest.fn(),
  refreshToken: jest.fn().mockReturnValue(of({ success: true })),
  resetPassword: jest.fn().mockReturnValue(of({ success: true })),
  forgotPassword: jest.fn().mockReturnValue(of({ success: true })),
  verifyResetCode: jest.fn().mockReturnValue(of({ success: true })),
  setNewPassword: jest.fn().mockReturnValue(of({ success: true })),
  user$: of({ id: 1, username: 'testuser', email: 'test@example.com' })
});

export const createMockToolbarService = () => ({
  profileAvatar: of('mock-avatar-url'),
  updateProfileAvatar: jest.fn(),
  getProfileAvatar: jest.fn().mockReturnValue('mock-avatar-url'),
  toggleSidenav: jest.fn(),
  closeSidenav: jest.fn()
});

export const createMockThemeService = () => ({
  isDarkMode$: of(false),
  getIsDarkMode: jest.fn().mockReturnValue(false),
  toggleDarkMode: jest.fn(),
  setDarkMode: jest.fn()
});

export const createMockValidationService = () => ({
  checkPasswordStrength: jest.fn().mockReturnValue({
    strength: 3,
    text: 'Strong',
    color: 'green'
  }),
  validateEmail: jest.fn().mockReturnValue(true),
  validatePassword: jest.fn().mockReturnValue(true)
});

export const createMockSearchModalService = () => ({
  showModal: jest.fn(),
  hideModal: jest.fn(),
  updateProgress: jest.fn(),
  toggleDarkMode: jest.fn(),
  toggleTheme: jest.fn(),
  isVisible$: of(false),
  searchResults$: of([])
});

export const createMockRouter = () => ({
  navigate: jest.fn().mockResolvedValue(true),
  navigateByUrl: jest.fn().mockResolvedValue(true),
  url: '/test',
  events: of()
});

export const createMockActivatedRoute = () => ({
  params: of({}),
  queryParams: of({}),
  snapshot: {
    params: {},
    queryParams: {},
    url: []
  }
});

export const createMockMatSnackBar = () => ({
  open: jest.fn().mockReturnValue({
    dismiss: jest.fn(),
    onAction: jest.fn().mockReturnValue(of())
  }),
  dismiss: jest.fn()
});

// Common test setup function
export function setupTestBed(component: any, additionalProviders: any[] = [], additionalImports: any[] = []) {
  return TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      RouterTestingModule,
      NoopAnimationsModule,
      MatSnackBarModule,
      MatDialogModule,
      MatIconModule,
      ...additionalImports
    ],
    providers: [
      { provide: 'AuthService', useValue: createMockAuthService() },
      { provide: 'ToolbarService', useValue: createMockToolbarService() },
      { provide: 'ThemeService', useValue: createMockThemeService() },
      { provide: 'ValidationService', useValue: createMockValidationService() },
      { provide: 'SearchModalService', useValue: createMockSearchModalService() },
      ...additionalProviders
    ]
  });
}

// Helper to create a basic component test
export function createBasicComponentTest(componentClass: any, additionalSetup?: () => void) {
  return () => {
    let component: any;
    let fixture: any;

    beforeEach(async () => {
      await setupTestBed(componentClass).compileComponents();
      fixture = TestBed.createComponent(componentClass);
      component = fixture.componentInstance;
      
      if (additionalSetup) {
        additionalSetup();
      }
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    return { getComponent: () => component, getFixture: () => fixture };
  };
}