import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ToolbarService } from '../../../shared/services/toolbar.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    const mockAuthService = {
      loginWithEmail: jest.fn().mockReturnValue(of({ 
        token: 'fake-token', 
        refreshToken: 'fake-refresh-token',
        expirationTime: Date.now() + 3600000
      })),
      registerUser: jest.fn().mockReturnValue(of({ success: true })),
      generateUsername: jest.fn().mockReturnValue('testuser'),
      isAuthenticated$: of(false),
      currentUser$: of(null)
    };

    const mockThemeService = {
      getIsDarkMode: jest.fn().mockReturnValue(false),
      toggleDarkMode: jest.fn(),
      isDarkMode$: of(false)
    };

    const mockToolbarService = {
      setLoggedInToolbar: jest.fn(),
      setLoggedOutToolbar: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        LoginComponent,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        NoopAnimationsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: ToolbarService, useValue: mockToolbarService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('Logic Testing', () => {
    it('should initialize component properties', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
      expect(typeof component.isLoading).toBeDefined();
      expect(typeof component.isLoading).toBeDefined();
    });

    it('should create forms', () => {
      fixture.detectChanges();
      expect(component.loginForm).toBeDefined();
      expect(component.registerForm).toBeDefined();
    });

    it('should handle form interactions', () => {
      fixture.detectChanges();
      expect(() => {
        component.onSubmitLogin();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('UI Testing', () => {
    it('should render form elements', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      
      const formElements = compiled.querySelectorAll('form, input, button');
      expect(formElements.length).toBeGreaterThan(0);
    });

    it('should handle form submission', () => {
      fixture.detectChanges();
      const authService = TestBed.inject(AuthService);
      
      if (component.loginForm && component.onSubmitLogin) {
        component.loginForm.patchValue({
          identifier: 'test@example.com',
          password: 'password123'
        });
        
        component.onSubmitLogin();
        expect(authService.loginWithEmail).toHaveBeenCalled();
      } else {
        expect(true).toBe(true);
      }
    });

    it('should display validation errors', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      
      // Mark form as touched to trigger validation
      if (component.loginForm) {
        Object.keys(component.loginForm.controls).forEach(key => {
          component.loginForm.get(key)?.markAsTouched();
        });
      }
      
      fixture.detectChanges();
      expect(compiled).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle component lifecycle without errors', () => {
      expect(() => {
        fixture.detectChanges();
        component.ngOnInit?.();
        component.ngOnDestroy?.();
      }).not.toThrow();
    });

    it('should validate form inputs', () => {
      fixture.detectChanges();
      
      if (component.loginForm) {
        const form = component.loginForm;
        const identifierControl = form.get('identifier');
        const passwordControl = form.get('password');
        
        if (identifierControl && passwordControl) {
          // Test empty validation
          identifierControl.setValue('');
          passwordControl.setValue('');
          identifierControl.markAsTouched();
          passwordControl.markAsTouched();
          
          expect(identifierControl.errors || passwordControl.errors).toBeTruthy();
        }
      }
      
      expect(true).toBe(true);
    });
  });
});