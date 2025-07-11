import { Component, OnInit, inject, PLATFORM_ID, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription, catchError, of, tap } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service'; // Assuming theme service might be used

// Custom validator for password matching
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
    confirmPassword.setErrors({ mismatch: true });
    return { mismatch: true }; // Return error at form group level
  } else {
    // If passwords match, and confirmPassword has the mismatch error, clear it
    if (confirmPassword?.hasError('mismatch')) {
      confirmPassword.setErrors(null);
    }
  }
  return null; // Passwords match or fields not present
}


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    // MatSlideToggleModule, // If dark mode toggle is added
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  currentStep: number = 1;
  emailForm!: FormGroup<{ email: FormControl<string> }>;
  codeForm!: FormGroup<{ code: FormControl<string> }>;
  passwordForm!: FormGroup<{ newPassword: FormControl<string>; confirmPassword: FormControl<string> }>;

  hideNewPassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  carouselImage: string = '';

  // Injected services
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);
  public readonly themeService = inject(ThemeService); // Public if used in template
  private readonly matIconRegistry = inject(MatIconRegistry);
  private readonly domSanitizer = inject(DomSanitizer);


  isDarkMode = false;
  iconsRegistered = false;
  private themeSubscription!: Subscription;
  private carouselIntervalId: any;
  readonly CAROUSEL_INTERVAL_MS = 3000;


  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.registerSvgIcons(); // For sun/moon if dark mode toggle is used
      this.iconsRegistered = true;
    }
  }

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      email: this.fb.control('', [Validators.required, Validators.email]),
    });

    this.codeForm = this.fb.group({
      code: this.fb.control('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]{6}$/)]),
    });

    this.passwordForm = this.fb.group({
      newPassword: this.fb.control('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: this.fb.control('', [Validators.required]),
    }, { validators: passwordMatchValidator });

    this.updateCarouselImage();

    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
      this.cdr.markForCheck();
    });
    this.isDarkMode = this.themeService.getIsDarkMode();

    if (isPlatformBrowser(this.platformId)) {
      this.startCarousel();
    }
  }

  private registerSvgIcons(): void {
    const iconPath = '/icons/'; // Adjust if your icon path is different
    this.matIconRegistry.addSvgIcon('sun', this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'sun.svg'));
    this.matIconRegistry.addSvgIcon('moon', this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'moon.svg'));
    // Add other SVGs if needed (e.g. social icons if they are part of this component's layout)
    this.matIconRegistry.addSvgIcon('google', this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'google.svg'));
    this.matIconRegistry.addSvgIcon('facebook', this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'facebook.svg'));
    this.matIconRegistry.addSvgIcon('apple', this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'apple.svg'));
  }


  updateCarouselImage(): void {
    if (this.currentStep === 1) {
      this.carouselImage = 'images/gallery1.png'; // Ensure path is correct, from root or assets
    } else if (this.currentStep === 2 || this.currentStep === 3) {
      this.carouselImage = 'images/gallery3.png'; // Ensure path is correct
    }
    this.cdr.markForCheck();
  }

  toggleNewPasswordVisibility(): void {
    this.hideNewPassword = !this.hideNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  back(step: number): void {
    this.currentStep = step;
    this.updateCarouselImage();
  }

  cancel(): void {
    this.router.navigate(['/login']);
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }

  onSubmitEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.authService.forgotPassword(this.emailForm.value.email!)
      .pipe(
        tap(() => {
          this.isLoading = false;
          this.currentStep = 2;
          this.updateCarouselImage();
          this.snackBar.open('Verification code sent to your email.', 'Close', { duration: 5000 });
          this.cdr.markForCheck();
        }),
        catchError(error => {
          this.isLoading = false;
          this.snackBar.open(error.message || 'Failed to send verification code. Please try again.', 'Close', { duration: 7000 });
          this.cdr.markForCheck();
          return of(null); // Prevent error from propagating further if handled
        })
      ).subscribe();
  }

  onSubmitCode(): void {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    // Email is needed for verifyResetCode according to AuthService
    const email = this.emailForm.value.email;
    if (!email) {
        this.isLoading = false;
        this.snackBar.open('Email not found. Please restart the process.', 'Close', { duration: 7000 });
        this.currentStep = 1; // Go back to email step
        this.updateCarouselImage();
        this.cdr.markForCheck();
        return;
    }

    this.authService.verifyResetCode(email, this.codeForm.value.code!)
      .pipe(
        tap(() => {
          this.isLoading = false;
          this.currentStep = 3;
          this.updateCarouselImage();
          this.snackBar.open('Code verified. Please set your new password.', 'Close', { duration: 5000 });
          this.cdr.markForCheck();
        }),
        catchError(error => {
          this.isLoading = false;
          this.snackBar.open(error.message || 'Invalid or expired code. Please try again.', 'Close', { duration: 7000 });
          this.cdr.markForCheck();
          return of(null);
        })
      ).subscribe();
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      // Manually trigger validation for confirmPassword due to potential issues with form group validator not always updating individual control error states
      this.passwordForm.controls.confirmPassword.updateValueAndValidity();
      this.cdr.markForCheck();
      return;
    }
    this.isLoading = true;
    const email = this.emailForm.value.email;
    const code = this.codeForm.value.code;

    if (!email || !code) {
        this.isLoading = false;
        this.snackBar.open('Session data missing. Please restart the password reset process.', 'Close', { duration: 7000 });
        this.currentStep = 1; // Go back to email step
        this.updateCarouselImage();
        this.cdr.markForCheck();
        return;
    }

    this.authService.resetPassword(email, code, this.passwordForm.value.newPassword!)
      .pipe(
        tap(() => {
          this.isLoading = false;
          this.snackBar.open('Password successfully reset. Please login.', 'Close', { duration: 5000 });
          this.router.navigate(['/login']);
          this.cdr.markForCheck();
        }),
        catchError(error => {
          this.isLoading = false;
          this.snackBar.open(error.message || 'Failed to reset password. Please try again.', 'Close', { duration: 7000 });
          this.cdr.markForCheck();
          return of(null);
        })
      ).subscribe();
  }

  // For dark mode toggle, if used in template
  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  private startCarousel(): void {
    if (isPlatformBrowser(this.platformId) && (this.currentStep === 1 || this.currentStep === 2 || this.currentStep === 3)) { // Only run if an image is expected
      // Clear existing interval if any
      if (this.carouselIntervalId) {
        clearInterval(this.carouselIntervalId);
      }
      // Start new one - though for static images per step, carousel might not be needed.
      // If it's a single image per step, just setting `this.carouselImage` in `updateCarouselImage` is enough.
      // The original login page had a carousel for multiple images on the right.
      // For this component, it seems like one image per step.
      // If you want a multi-image carousel on the right for each step, this needs more logic.
      // For now, `updateCarouselImage` just sets one image.
    }
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.carouselIntervalId && isPlatformBrowser(this.platformId)) {
      clearInterval(this.carouselIntervalId);
    }
  }

  // Getter for easier access in template, if needed
  get emailControl() { return this.emailForm.get('email'); }
  get codeControl() { return this.codeForm.get('code'); }
  get newPasswordControl() { return this.passwordForm.get('newPassword'); }
  get confirmPasswordControl() { return this.passwordForm.get('confirmPassword'); }

}
