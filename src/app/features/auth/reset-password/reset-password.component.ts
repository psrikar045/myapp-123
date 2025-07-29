import { Component, OnInit, inject, PLATFORM_ID, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule,ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription, catchError, of, tap, interval } from 'rxjs';
import { takeWhile, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { AuthService } from '../../../core/services/auth.service';
import { AppThemeService } from '../../../core/services/app-theme.service';
import { ValidationService } from '../../../core/services/validation.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

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
    MatSlideToggleModule, // If dark mode toggle is added
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('successAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'scale(0.8)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'scale(1)'
      })),
      transition('void => *', [
        animate('0.3s ease-out')
      ])
    ]),
    trigger('buttonScale', [
      state('normal', style({
        transform: 'scale(1)'
      })),
      state('loading', style({
        transform: 'scale(0.95)'
      })),
      transition('normal <=> loading', [
        animate('0.2s ease-in-out')
      ])
    ])
  ]
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  currentStep: number = 1;
  emailForm!: FormGroup<{ email: FormControl<string> }>;
  codeForm!: FormGroup<{ code: FormControl<string> }>;
  passwordForm!: FormGroup<{ newPassword: FormControl<string>; confirmPassword: FormControl<string> }>;
  profilePasswordForm!: FormGroup<{ 
    email: FormControl<string>; 
    currentPassword: FormControl<string>; 
  }>;
  hideNewPassword = true;
  hideConfirmPassword = true;
  hideCurrentPassword = true;
  isLoading = false;
  carouselImage: string = '';
  buttonState: 'normal' | 'loading' = 'normal';
  mode:'login' | 'profile' = 'login'
  // Success message state
  showSuccessMessage = false;
  
  // Password strength indicator
  passwordStrength = 0;
  passwordStrengthText = '';
  passwordStrengthColor = '';
  
  // Countdown timer for verification code
  codeExpiryTime = 10 * 60; // 10 minutes in seconds
  remainingTime = 0;
  formattedTime = '10:00';
  timerWarning = false;
  private timerSubscription?: Subscription;
  private passwordSubscription?: Subscription;
  private submitTimeoutId?: number;
  private apiSubscription?: Subscription;
  // Injected services
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);
  public readonly appThemeService = inject(AppThemeService); // Public if used in template
  private readonly validationService = inject(ValidationService);
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
    // Get mode from route query parameters
    this.route.queryParams.subscribe(params => {
      this.mode = params['mode'] === 'profile' ? 'profile' : 'login';
      this.cdr.markForCheck();
    });
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

    // Monitor password strength
    this.passwordSubscription = this.newPasswordControl?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((password: string) => {
      this.checkPasswordStrength(password);
      this.cdr.markForCheck();
    });
// Profile mode form
    this.profilePasswordForm = this.fb.group({
      email: this.fb.control('', [Validators.required, Validators.email]),
      currentPassword: this.fb.control('', [Validators.required]),
    });
    this.updateCarouselImage();

    this.themeSubscription = this.appThemeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
      this.cdr.markForCheck();
    });
    this.appThemeService.isDarkMode$.subscribe(isDark => this.isDarkMode = isDark);

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
      this.carouselImage = 'images/gallery3.png'; // Ensure path is correct, from root or assets
    } else if (this.currentStep === 2 || this.currentStep === 3) {
      this.carouselImage = 'images/gallery3.png'; // Ensure path is correct
    }
    this.cdr.markForCheck();
  }

  /**
   * Checks password strength using the password strength service
   * @param password The password to check
   */
  checkPasswordStrength(password: string): void {
    const result = this.validationService.checkPasswordStrength(password);
    this.passwordStrength = result.strength;
    this.passwordStrengthText = result.text;
    this.passwordStrengthColor = result.color;
  }

  toggleNewPasswordVisibility(): void {
    this.hideNewPassword = !this.hideNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
  toggleCurrentPasswordVisibility(): void {
    this.hideCurrentPassword = !this.hideCurrentPassword;
  }
 back(step: number): void {
    // Clear any pending operations when going back
    this.clearPendingOperations();
    
    // Reset loading state
    this.isLoading = false;
    this.buttonState = 'normal';
    
    // Reset success message
    this.showSuccessMessage = false;
    
    // Update step and image
    this.currentStep = step;
    this.updateCarouselImage();
    
    // Stop timer if going back from step 2
    if (step < 2) {
      this.stopCodeExpiryTimer();
    }
    
    this.cdr.markForCheck();
  }

  /**
   * Clears any pending operations (timeouts, subscriptions)
   */
  private clearPendingOperations(): void {
    // Clear setTimeout if it exists
    if (this.submitTimeoutId) {
      clearTimeout(this.submitTimeoutId);
      this.submitTimeoutId = undefined;
    }
    
    // Unsubscribe from any pending API calls
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
      this.apiSubscription = undefined;
    }
  }

  cancel(): void {
    // Clean up any pending operations before navigating away
    this.clearPendingOperations();
    this.stopCodeExpiryTimer();
    
    if (this.mode === 'profile') {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  backToLogin(): void {
    // Clean up any pending operations before navigating away
    this.clearPendingOperations();
    this.stopCodeExpiryTimer();
    
    if (this.mode === 'profile') {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Starts the countdown timer for code expiration
   */
  startCodeExpiryTimer(): void {
    // Clear any existing timer
    this.stopCodeExpiryTimer();
    
    // Initialize timer values
    this.remainingTime = this.codeExpiryTime;
    this.updateFormattedTime();
    
    // Start the timer
    this.timerSubscription = interval(1000).pipe(
      takeWhile(() => this.remainingTime > 0)
    ).subscribe(() => {
      this.remainingTime--;
      this.timerWarning = this.remainingTime <= 60; // Warning when less than 1 minute remains
      this.updateFormattedTime();
      
      if (this.remainingTime === 0) {
        this.handleCodeExpiration();
      }
      
      this.cdr.markForCheck();
    });
  }
  
  /**
   * Stops the countdown timer
   */
  stopCodeExpiryTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }
  
  /**
   * Updates the formatted time display (MM:SS)
   */
  updateFormattedTime(): void {
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    this.formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Handles code expiration
   */
  handleCodeExpiration(): void {
    this.snackBar.open('Verification code has expired. Please request a new code.', 'Close', { duration: 7000 });
    this.codeForm.reset();
    this.codeForm.markAsPristine();
  }
  
  /**
   * Resends the verification code
   */
  resendVerificationCode(): void {
    if (!this.emailForm.value.email) {
      this.snackBar.open('Email not found. Please restart the process.', 'Close', { duration: 5000 });
      this.currentStep = 1;
      this.updateCarouselImage();
      return;
    }
    this.clearPendingOperations();
    this.isLoading = true;
    this.buttonState = 'loading';
    
    // Simulate API call
   this.submitTimeoutId = window.setTimeout(() => {
      // Only proceed if we're still on step 2 (user hasn't navigated away)
      if (this.currentStep === 2) {
        this.isLoading = false;
        this.buttonState = 'normal';
        this.startCodeExpiryTimer(); // Reset the timer
        this.snackBar.open('New verification code sent to your email.', 'Close', { duration: 5000 });
        this.cdr.markForCheck();
      }
      this.submitTimeoutId = undefined;
    }, 1000);
    
    // Actual API call
    this.apiSubscription = this.authService.sendPasswordResetCode(this.emailForm.value.email!)
      .pipe(
        tap(() => {
          // Only proceed if we're still on step 2 (user hasn't navigated away)
          if (this.currentStep === 2) {
            this.isLoading = false;
            this.buttonState = 'normal';
            this.startCodeExpiryTimer(); // Reset the timer
            this.snackBar.open('New verification code sent to your email.', 'Close', { duration: 5000 });
            this.cdr.markForCheck();
          }
        }),
        catchError(error => {
          // Only show error if we're still on step 2
          if (this.currentStep === 2) {
            this.isLoading = false;
            this.buttonState = 'normal';
            // Extract the error message from the response
            let errorMessage = 'Failed to send verification code. Please try again.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
            this.snackBar.open(errorMessage, 'Close', { duration: 7000 });
            this.cdr.markForCheck();
          }
          return of(null);
        })
      ).subscribe();
  }

  onSubmitEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    
    // Clear any existing pending operations before starting new ones
    this.clearPendingOperations();
    
    this.isLoading = true;
    this.buttonState = 'loading';
    this.showSuccessMessage = false;
    
    // Store the timeout ID so we can clear it if needed
    this.submitTimeoutId = window.setTimeout(() => {
      // Only proceed if we're still on step 1 (user hasn't navigated back)
      if (this.currentStep === 1) {
        this.isLoading = false;
        this.buttonState = 'normal';
        this.currentStep = 2;
        this.updateCarouselImage();
        this.showSuccessMessage = true;
        this.startCodeExpiryTimer(); // Start the countdown timer
        this.cdr.markForCheck();
      }
      this.submitTimeoutId = undefined;
    }, 1000); // Simulate network delay
    
    this.apiSubscription = this.authService.sendPasswordResetCode(this.emailForm.value.email!)
      .pipe(
        tap(() => {
          // Only proceed if we're still on step 1 (user hasn't navigated back)
          if (this.currentStep === 1) {
            this.isLoading = false;
            this.buttonState = 'normal';
            this.currentStep = 2;
            this.updateCarouselImage();
            this.showSuccessMessage = true;
            this.startCodeExpiryTimer(); // Start the countdown timer
            this.cdr.markForCheck();
          }
        }),
        catchError(error => {
          // Only show error if we're still on step 1
          if (this.currentStep === 1) {
            this.isLoading = false;
            this.buttonState = 'normal';
            
            // Extract the error message from the response
            let errorMessage = 'Failed to send verification code. Please try again.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
            
            this.snackBar.open(errorMessage, 'Close', { duration: 7000 });
            this.cdr.markForCheck();
          }
          return of(null); // Prevent error from propagating further if handled
        })
      ).subscribe();
  }
 // Profile mode form submission
  onSubmitProfilePassword(): void {
    if (this.profilePasswordForm.invalid) {
      this.profilePasswordForm.markAllAsTouched();
      return;
    }
    
    // Clear any existing pending operations before starting new ones
    this.clearPendingOperations();
    
    this.isLoading = true;
    this.buttonState = 'loading';
    this.showSuccessMessage = false;
    
    const { email, currentPassword } = this.profilePasswordForm.value;
    
    // Copy email to emailForm for consistency in step 2
    this.emailForm.patchValue({ email: email! });
    
    // Store the timeout ID so we can clear it if needed
    this.submitTimeoutId = window.setTimeout(() => {
      // Only proceed if we're still on step 1 (user hasn't navigated back)
      if (this.currentStep === 1) {
        this.isLoading = false;
        this.buttonState = 'normal';
        this.currentStep = 2;
        this.updateCarouselImage();
        this.showSuccessMessage = true;
        this.startCodeExpiryTimer(); // Start the countdown timer
        this.cdr.markForCheck();
      }
      this.submitTimeoutId = undefined;
    }, 1000); // Simulate network delay
    
    // TODO: Implement actual API call for profile password change
    // This would typically verify the current password and send a code
    console.log('Profile password change initiated:', { email, currentPassword });
    
    // For now, using the same forgot password API
    this.apiSubscription = this.authService.forgotPassword(email!)
      .pipe(
        tap(() => {
          // Only proceed if we're still on step 1 (user hasn't navigated back)
          if (this.currentStep === 1) {
            this.isLoading = false;
            this.buttonState = 'normal';
            this.currentStep = 2;
            this.updateCarouselImage();
            this.showSuccessMessage = true;
            this.startCodeExpiryTimer(); // Start the countdown timer
            this.cdr.markForCheck();
          }
        }),
        catchError(error => {
          // Only show error if we're still on step 1
          if (this.currentStep === 1) {
            this.isLoading = false;
            this.buttonState = 'normal';
            // Extract the error message from the response
            let errorMessage = 'Failed to send verification code. Please try again.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
            this.snackBar.open(errorMessage, 'Close', { duration: 7000 });
            this.cdr.markForCheck();
          }
          return of(null);
        })
      ).subscribe();
  }
  onSubmitCode(): void {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }
    this.clearPendingOperations();
    this.isLoading = true;
    this.buttonState = 'loading';
    
    // Email is needed for verifyResetCode according to AuthService
    const email = this.emailForm.value.email;
    if (!email) {
        this.isLoading = false;
        this.buttonState = 'normal';
        this.snackBar.open('Email not found. Please restart the process.', 'Close', { duration: 7000 });
        this.currentStep = 1; // Go back to email step
        this.updateCarouselImage();
        this.cdr.markForCheck();
        return;
    }
    
    // this.submitTimeoutId = window.setTimeout(() => {
    //   // Only proceed if we're still on step 2 (user hasn't navigated back)
    //   if (this.currentStep === 2) {
    //     this.isLoading = false;
    //     this.buttonState = 'normal';
    //     this.currentStep = 3;
    //     this.updateCarouselImage();
    //     this.stopCodeExpiryTimer(); // Stop the timer when code is verified
    //     this.snackBar.open('Code verified. Please set your new password.', 'Close', { duration: 5000 });
    //     this.cdr.markForCheck();
    //   }
    //   this.submitTimeoutId = undefined;
    // }, 1000); // Simulate network delay
    
    this.apiSubscription = this.authService.verifyPasswordResetCode(email, this.codeForm.value.code!)
      .pipe(
        tap(() => {
          // Only proceed if we're still on step 2 (user hasn't navigated back)
          if (this.currentStep === 2) {
            this.isLoading = false;
            this.buttonState = 'normal';
            this.currentStep = 3;
            this.updateCarouselImage();
            this.stopCodeExpiryTimer(); // Stop the timer when code is verified
            this.snackBar.open('Code verified. Please set your new password.', 'Close', { duration: 5000 });
            this.cdr.markForCheck();
          }
        }),
        catchError(error => {
          // Only show error if we're still on step 2
          if (this.currentStep === 2) {
            this.isLoading = false;
            this.buttonState = 'normal';
            // Extract the error message from the response
            let errorMessage = 'Invalid or expired code. Please try again.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
            
            this.snackBar.open(errorMessage, 'Close', { duration: 7000 });
            this.cdr.markForCheck();
          }
          return of(null);
        })
      ).subscribe((response: any) => {
        if (response && this.currentStep === 2) {
          this.authService.userDetails = {
userId: response?.userId,
          email: response?.email,
          code: response?.code
          }
        }
      });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      // Manually trigger validation for confirmPassword due to potential issues with form group validator not always updating individual control error states
      this.passwordForm.controls.confirmPassword.updateValueAndValidity();
      this.cdr.markForCheck();
      return;
    }
    
    // Clear any existing pending operations before starting new ones
    this.clearPendingOperations();
    
    this.isLoading = true;
    this.buttonState = 'loading';
    const email = this.emailForm.value.email;
    const code = this.codeForm.value.code;

    if (!email || !code) {
        this.isLoading = false;
        this.buttonState = 'normal';
        this.snackBar.open('Session data missing. Please restart the password reset process.', 'Close', { duration: 7000 });
        this.currentStep = 1; // Go back to email step
        this.updateCarouselImage();
        this.cdr.markForCheck();
        return;
    }
    
    // Store the timeout ID so we can clear it if needed
    this.submitTimeoutId = window.setTimeout(() => {
      // Only proceed if we're still on step 3 (user hasn't navigated back)
      if (this.currentStep === 3) {
        this.isLoading = false;
        this.buttonState = 'normal';
        if (this.mode === 'profile') {
          this.snackBar.open('Password successfully changed.', 'Close', { duration: 5000 });
          this.router.navigate(['/profile']);
        } else {
          this.snackBar.open('Password successfully reset. Please login.', 'Close', { duration: 5000 });
          this.router.navigate(['/login']);
        }
        this.cdr.markForCheck();
      }
      this.submitTimeoutId = undefined;
    }, 1000); // Simulate network delay
    
    const currentUserDetails:any = this.authService.getCurrentUserDetails();
    this.apiSubscription = this.authService.setNewPassword(currentUserDetails?.userId, email, code, this.passwordForm.value.newPassword!)
      .pipe(
        tap(() => {
          // Only proceed if we're still on step 3 (user hasn't navigated back)
          if (this.currentStep === 3) {
            this.isLoading = false;
            this.buttonState = 'normal';
            if (this.mode === 'profile') {
              this.snackBar.open('Password successfully changed.', 'Close', { duration: 5000 });
              this.router.navigate(['/profile']);
            } else {
              this.snackBar.open('Password successfully reset. Please login.', 'Close', { duration: 5000 });
              this.router.navigate(['/login']);
            }
            this.cdr.markForCheck();
          }
        }),
        catchError(error => {
          // Only show error if we're still on step 3
          if (this.currentStep === 3) {
            this.isLoading = false;
            this.buttonState = 'normal';
            // Extract the error message from the response
            let errorMessage = 'Failed to reset password. Please try again.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
            this.snackBar.open(errorMessage, 'Close', { duration: 7000 });
            this.cdr.markForCheck();
          }
          return of(null);
        })
      ).subscribe();
  }

  // For dark mode toggle, if used in template
  toggleDarkMode(): void {
    this.appThemeService.toggleDarkMode();
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
    if (this.passwordSubscription) {
      this.passwordSubscription.unsubscribe();
    }
    if (this.carouselIntervalId && isPlatformBrowser(this.platformId)) {
      clearInterval(this.carouselIntervalId);
    }
    this.stopCodeExpiryTimer(); // Clean up timer subscription
    this.clearPendingOperations();
  }

  // Getter for easier access in template, if needed
  get emailControl() { return this.emailForm.get('email'); }
  get codeControl() { return this.codeForm.get('code'); }
  get newPasswordControl() { return this.passwordForm.get('newPassword'); }
  get confirmPasswordControl() { return this.passwordForm.get('confirmPassword'); }
// Profile mode getters
  get profileEmailControl() { return this.profilePasswordForm.get('email'); }
  get profileCurrentPasswordControl() { return this.profilePasswordForm.get('currentPassword'); }
}
