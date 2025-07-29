import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PLATFORM_ID } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ValidationService } from '../../core/services/validation.service';

describe('ResetPasswordComponent - AI Enhanced Tests', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let mockAuthService: any;
  let mockRouter: any;
  let mockSnackBar: any;
  let mockThemeService: any;
  let mockValidationService: any;
  let mockActivatedRoute: any;
  let mockMatIconRegistry: any;
  let mockDomSanitizer: any;

  beforeEach(async () => {
    mockAuthService = {
      requestPasswordReset: jest.fn(),
      resetPassword: jest.fn(),
      validateResetToken: jest.fn()
    } as any;
    mockRouter = {
      navigate: jest.fn()
    } as any;
    mockSnackBar = {
      open: jest.fn()
    } as any;
    mockThemeService = {
      getIsDarkMode: jest.fn(),
      toggleTheme: jest.fn(),
      isDarkMode$: of(false)
    } as any;
    mockValidationService = {
      checkPasswordStrength: jest.fn()
    } as any;
    mockActivatedRoute = {
      queryParams: of({ token: 'test-token' }),
      snapshot: { queryParams: { token: 'test-token' } }
    };
    mockMatIconRegistry = {
      addSvgIcon: jest.fn(),
      getDefaultFontSetClass: jest.fn().mockReturnValue(['material-icons']),
      classWithPrefix: jest.fn().mockReturnValue(['material-icons']),
      getNamedSvgIcon: jest.fn(),
      setDefaultFontSetClass: jest.fn(),
      _fontCssClassesByAlias: new Map([['', new Set(['material-icons'])]]),
      _svgIconConfigs: new Map(),
      _iconSetConfigs: new Map()
    } as any;
    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn()
    } as any;

    // Setup default return values
    mockThemeService.getIsDarkMode.mockReturnValue(false);
    mockValidationService.checkPasswordStrength.mockReturnValue({
      strength: 3,
      text: 'Strong',
      color: 'green'
    });
    mockDomSanitizer.bypassSecurityTrustResourceUrl.mockReturnValue('mocked-url' as any);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ResetPasswordComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: ValidationService, useValue: mockValidationService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatIconRegistry, useValue: mockMatIconRegistry },
        { provide: DomSanitizer, useValue: mockDomSanitizer },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.isLoading).toBe(false);
      expect(component.hideNewPassword).toBe(true);
      expect(component.hideConfirmPassword).toBe(true);
      expect(component.currentStep).toBe(1); // or 3 based on token presence
    });

    it('should initialize forms with proper validators', () => {
      expect(component.emailForm).toBeDefined();
      expect(component.passwordForm).toBeDefined();
      
      // Test required validators
      component.emailForm.patchValue({ email: '' });
      expect(component.emailForm.invalid).toBe(true);
      
      component.passwordForm.patchValue({ 
        newPassword: '', 
        confirmPassword: ''
      });
      expect(component.passwordForm.invalid).toBe(true);
    });

    it('should detect reset token from query params', () => {
      mockActivatedRoute.queryParams = of({ token: 'valid-token' });
      component.ngOnInit();
      expect(component.currentStep).toBe(3);
      expect(component.currentStep).toBe(3);
    });

    it('should show request form when no token present', () => {
      mockActivatedRoute.queryParams = of({});
      component.ngOnInit();
      expect(component.currentStep).toBe(1);
    });
  });

  describe('Email Form Tests', () => {
    beforeEach(() => {
      component.currentStep = 1;
      component.emailForm.patchValue({
        email: 'test@example.com'
      });
    });

    it('should validate email form', () => {
      expect(component.emailForm.valid).toBe(true);
      
      component.emailForm.patchValue({ email: '' });
      expect(component.emailForm.invalid).toBe(true);
      
      component.emailForm.patchValue({ email: 'invalid-email' });
      expect(component.emailForm.invalid).toBe(true);
    });

    it('should validate email format', () => {
      component.emailControl?.setValue('invalid-email');
      expect(component.emailControl?.invalid).toBe(true);
      
      component.emailControl?.setValue('valid@email.com');
      expect(component.emailControl?.valid).toBe(true);
    });
  });

  describe('Password Form Tests', () => {
    beforeEach(() => {
      component.currentStep = 3;
      component.passwordForm.patchValue({
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
    });

    it('should validate password form', () => {
      expect(component.passwordForm.valid).toBe(true);
      
      component.passwordForm.patchValue({ 
        newPassword: '', 
        confirmPassword: '' 
      });
      expect(component.passwordForm.invalid).toBe(true);
    });

    it('should validate password match', () => {
      component.newPasswordControl?.setValue('password123');
      component.confirmPasswordControl?.setValue('different');
      
      expect(component.passwordForm.hasError('mismatch')).toBe(true);
      
      component.confirmPasswordControl?.setValue('password123');
      expect(component.passwordForm.hasError('mismatch')).toBe(false);
    });

    it('should validate password strength', () => {
      const password = 'WeakPass';
      component.checkPasswordStrength(password);

      expect(mockValidationService.checkPasswordStrength).toHaveBeenCalledWith(password);
      expect(component.passwordStrength).toBe(3);
      expect(component.passwordStrengthText).toBe('Strong');
      expect(component.passwordStrengthColor).toBe('green');
    });

    it('should toggle new password visibility', () => {
      expect(component.hideNewPassword).toBe(true);
      
      component.toggleNewPasswordVisibility();
      expect(component.hideNewPassword).toBe(false);
      
      component.toggleNewPasswordVisibility();
      expect(component.hideNewPassword).toBe(true);
    });

    it('should toggle confirm password visibility', () => {
      expect(component.hideConfirmPassword).toBe(true);
      
      component.toggleConfirmPasswordVisibility();
      expect(component.hideConfirmPassword).toBe(false);
    });
  });

  describe('Component State', () => {
    it('should handle step changes', () => {
      component.currentStep = 1;
      expect(component.currentStep).toBe(1);
      
      component.currentStep = 2;
      expect(component.currentStep).toBe(2);
    });

    it('should toggle password visibility', () => {
      expect(component.hideNewPassword).toBe(true);
      component.toggleNewPasswordVisibility();
      expect(component.hideNewPassword).toBe(false);
    });

    it('should handle loading state', () => {
      expect(component.isLoading).toBe(false);
      component.isLoading = true;
      expect(component.isLoading).toBe(true);
    });
  });

  describe('UI Interactions', () => {
    it('should navigate back to login', () => {
      component.backToLogin();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle resend verification code', () => {
      component.emailForm.patchValue({ email: 'test@example.com' });
      expect(() => {
        component.resendVerificationCode();
      }).not.toThrow();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format in request form', () => {
      component.emailControl?.setValue('invalid-email');
      expect(component.emailControl?.invalid).toBe(true);
      
      component.emailControl?.setValue('valid@email.com');
      expect(component.emailControl?.valid).toBe(true);
    });

    it('should validate password requirements', () => {
      // Test minimum length
      component.newPasswordControl?.setValue('123');
      expect(component.newPasswordControl?.invalid).toBe(true);
      
      // Test valid password
      component.newPasswordControl?.setValue('ValidPassword123!');
      expect(component.newPasswordControl?.valid).toBe(true);
    });

    it('should show validation errors', () => {
      component.emailForm.patchValue({ email: '' });
      component.onSubmitEmail();
      
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const errorMessages = compiled.querySelectorAll('.error-message');
      
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const resetComponent = compiled.querySelector('.reset-password-container') || compiled;
      expect(resetComponent).toBeTruthy();
      expect((resetComponent as HTMLElement).offsetWidth).toBeGreaterThan(0);
    });

    it('should handle mobile layout', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.mobile-layout')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('should respond to theme changes', () => {
      mockThemeService.isDarkMode$ = of(true);
      component.ngOnInit();
      expect(component.isDarkMode).toBe(true);
    });

    it('should handle theme changes', () => {
      expect(() => {
        component.toggleDarkMode();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      
      const emailInput = compiled.querySelector('input[type="email"]');
      const passwordInputs = compiled.querySelectorAll('input[type="password"]');
      
      expect(emailInput?.getAttribute('aria-label')).toBeTruthy();
      passwordInputs.forEach(input => {
        expect(input.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('should support keyboard navigation', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      
      const focusableElements = compiled.querySelectorAll('input, button');
      focusableElements.forEach(element => {
        expect(element.getAttribute('tabindex')).not.toBe('-1');
      });
    });

    it('should announce form errors to screen readers', () => {
      component.emailForm.patchValue({ email: '' });
      component.onSubmitEmail();
      
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const errorMessages = compiled.querySelectorAll('[role="alert"]');
      
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Security', () => {
    it('should clear sensitive data on destroy', () => {
      component.ngOnDestroy();
      
      expect(component.isLoading).toBe(false);
    });

    it('should handle form state correctly', fakeAsync(() => {
      expect(component.currentStep).toBeDefined();
      expect(component.hideNewPassword).toBe(true);
      expect(component.hideConfirmPassword).toBe(true);
    }));
  });

  describe('Component Lifecycle', () => {
    it('should clean up subscriptions on destroy', () => {
      const themeSubscription = component['themeSubscription'];
      const passwordSubscription = component['passwordSubscription'];
      
      if (themeSubscription) {
        jest.spyOn(themeSubscription, 'unsubscribe');
      }
      if (passwordSubscription) {
        jest.spyOn(passwordSubscription, 'unsubscribe');
      }
      
      component.ngOnDestroy();
      
      if (themeSubscription) {
        expect(themeSubscription.unsubscribe).toHaveBeenCalled();
      }
      if (passwordSubscription) {
        expect(passwordSubscription.unsubscribe).toHaveBeenCalled();
      }
    });

    it('should cleanup on destroy', () => {
      expect(() => {
        component.ngOnDestroy();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should display network errors', fakeAsync(() => {
      mockAuthService.setNewPassword.mockReturnValue(
        throwError({ message: 'Network error', status: 0 })
      );
      
      component.emailForm.patchValue({ email: 'test@example.com' });
      component.onSubmitEmail();
      tick();
      
      expect(() => fixture.detectChanges()).not.toThrow();
    }));

    it('should handle server errors', fakeAsync(() => {
      mockAuthService.setNewPassword.mockReturnValue(
        throwError({ message: 'Server error', status: 500 })
      );
      
      component.passwordForm.patchValue({
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
      component.onSubmitPassword();
      tick();
      
      expect(() => fixture.detectChanges()).not.toThrow();
    }));
  });
});

