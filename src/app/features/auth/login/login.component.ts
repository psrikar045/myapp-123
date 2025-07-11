import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ReactiveFormsModule,
  Validators,
  FormGroup, // Explicitly import FormGroup
  FormControl, // Explicitly import FormControl
  NonNullableFormBuilder, // Using NonNullableFormBuilder
  AbstractControl, // Import if needed, though direct control access is often typed
  ValidationErrors
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // <-- Add this to imports array
import { Router, RouterModule } from '@angular/router'; // <-- Import Router
import { AuthService, RegisterData } from '../../../core/services/auth.service'; // <-- Import AuthService (adjust path)
import { emailOrUsernameValidator } from '../../../core/validators/custom-validators'; // Import the custom validator
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs'; // Correct way to import 'of'
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    HttpClientModule, // <-- Ensure this is here for Auth Service
  RouterModule, // <-- Add RouterModule for routerLink
  MatSnackBarModule // <-- Add MatSnackBarModule for notifications
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder); // Using NonNullableFormBuilder
  private readonly matIconRegistry = inject(MatIconRegistry);
  private readonly domSanitizer = inject(DomSanitizer);
  public readonly themeService = inject(ThemeService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService); // <-- Inject AuthService
  private readonly router = inject(Router); // <-- Inject Router
  private readonly snackBar = inject(MatSnackBar); // <-- Inject MatSnackBar

  // --- Form Definitions ---
  loginForm!: FormGroup<{
    identifier: FormControl<string>;
    password: FormControl<string>;
    rememberMe: FormControl<boolean>;
  }>;
  registerForm!: FormGroup; // Typed below

  // --- State Properties ---
  showRegisterForm: boolean = false;
  isLoading = false;
  errorMessage: string | null = null; // For login form errors
  isDarkMode = false;

  // Password visibility toggles
  hideLoginPassword = true;
  hideRegisterPassword = true;
  hideRegisterConfirmPassword = true;

  // --- Carousel Properties ---
  readonly loginCarouselImages: readonly string[] = ['images/gallery1.png','images/gallery2.png','images/gallery3.png'];
  readonly registerFormImage: string = 'images/gallery2.png';
  currentImageIndex: number = 0; // For login carousel
  carouselImage: string = ''; // Holds the src for the currently displayed image
  private carouselIntervalId: any;
  readonly CAROUSEL_INTERVAL_MS = 3000;

  // --- Subscriptions & Timers ---
  private themeSubscription!: Subscription;
  // private carouselIntervalId: any; // Already declared above

  iconsRegistered = false;

  constructor() {
    // Form initializations moved to ngOnInit as NonNullableFormBuilder (fb) might not be fully ready in constructor
    // if it's injected and its own dependencies are complex. ngOnInit is safer.
    if (isPlatformBrowser(this.platformId)) {
      this.registerSvgIcons();
      this.iconsRegistered = true;
    }
  }

  ngOnInit(): void {
    // Initialize forms here
    this.loginForm = this.fb.group({
      identifier: this.fb.control('', [Validators.required, emailOrUsernameValidator()]),
      password: this.fb.control('', [Validators.required]),
      rememberMe: this.fb.control(false),
    });

    this.registerForm = this.fb.group({
      firstName: this.fb.control('', [Validators.required]),
      lastName: this.fb.control('', [Validators.required]),
      email: this.fb.control('', [Validators.required, Validators.email]),
      phoneNumber: this.fb.control('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\+\-\s()]*$/)]), // More flexible phone pattern
      password: this.fb.control('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: this.fb.control('', [Validators.required]),
      termsAccepted: this.fb.control(false, [Validators.requiredTrue]),
    }, { validators: passwordMatchValidator });

    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
      this.cdr.markForCheck();
    });
    this.isDarkMode = this.themeService.getIsDarkMode();

    if (!this.showRegisterForm) {
      this.startCarousel();
    } else {
      this.carouselImage = this.registerFormImage;
    }
    this.cdr.markForCheck();
  }

  startCarousel(): void {
    this.stopCarousel(); // Clear existing interval first
    if (isPlatformBrowser(this.platformId) && this.loginCarouselImages.length > 0) {
      this.currentImageIndex = 0;
      this.carouselImage = this.loginCarouselImages[this.currentImageIndex];
      this.cdr.markForCheck();

      this.carouselIntervalId = setInterval(() => {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.loginCarouselImages.length;
        this.carouselImage = this.loginCarouselImages[this.currentImageIndex];
        this.cdr.markForCheck();
      }, this.CAROUSEL_INTERVAL_MS);
    }
  }

  stopCarousel(): void {
    if (isPlatformBrowser(this.platformId) && this.carouselIntervalId) {
      clearInterval(this.carouselIntervalId);
      this.carouselIntervalId = null;
    }
  }

  private registerSvgIcons(): void {
    const iconPath = '/icons/';
    this.matIconRegistry.addSvgIcon(
      'google',
      this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'google.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'facebook',
      this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'facebook.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'apple',
      this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'apple.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'sun',
      this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'sun.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'moon',
      this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'moon.svg')
    );
  }

  // --- Getters for form controls (optional, for cleaner template access) ---
  get loginIdentifierCtrl() { return this.loginForm.get('identifier') as FormControl<string>; }
  get loginPasswordCtrl() { return this.loginForm.get('password') as FormControl<string>; }

  get regFirstNameCtrl() { return this.registerForm.get('firstName') as FormControl<string>; }
  get regLastNameCtrl() { return this.registerForm.get('lastName') as FormControl<string>; }
  get regEmailCtrl() { return this.registerForm.get('email') as FormControl<string>; }
  get regPhoneCtrl() { return this.registerForm.get('phoneNumber') as FormControl<string>; }
  get regPasswordCtrl() { return this.registerForm.get('password') as FormControl<string>; }
  get regConfirmPasswordCtrl() { return this.registerForm.get('confirmPassword') as FormControl<string>; }
  get regTermsCtrl() { return this.registerForm.get('termsAccepted') as FormControl<boolean>; }


  // --- Methods for Login Form ---
  clearIdentifier(): void {
    this.loginIdentifierCtrl.setValue('');
  }

  toggleLoginPasswordVisibility(): void {
    this.hideLoginPassword = !this.hideLoginPassword;
  }

  onSubmitLogin(): void {
    this.errorMessage = null;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const { identifier, password } = this.loginForm.getRawValue();
    this.authService.login(identifier, password)
      .pipe(
        tap(response => {
          console.log('Login API success!', response);
          this.router.navigate(['/dashboard']);
        }),
        catchError(error => {
          this.errorMessage = error.message || 'Login failed. Please try again.';
          console.error('Login API error:', error);
          this.loginPasswordCtrl.setValue('');
          return of(null); // Consumed error
        })
      )
      .subscribe(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  // --- Methods for Registration Form ---
  toggleRegisterPasswordVisibility(): void {
    this.hideRegisterPassword = !this.hideRegisterPassword;
  }

  toggleRegisterConfirmPasswordVisibility(): void {
    this.hideRegisterConfirmPassword = !this.hideRegisterConfirmPassword;
  }

  onSubmitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      // Manually trigger validation for confirmPassword due to potential issues with form group validator
      this.regConfirmPasswordCtrl.updateValueAndValidity();
      this.cdr.markForCheck();
      return;
    }
    this.isLoading = true;
    const rawValues = this.registerForm.getRawValue();
    const registerData: RegisterData = {
      firstName: rawValues.firstName,
      lastName: rawValues.lastName,
      email: rawValues.email,
      phoneNumber: rawValues.phoneNumber,
      password: rawValues.password,
    };

    this.authService.register(registerData)
      .pipe(
        tap(() => {
          this.snackBar.open('Registration successful! Please login.', 'Close', { duration: 5000 });
          this.toggleToLogin(); // Switch to login form
          this.loginForm.reset(); // Optionally reset login form
          this.registerForm.reset(); // Reset register form
        }),
        catchError(error => {
          this.snackBar.open(error.message || 'Registration failed. Please try again.', 'Close', { duration: 7000 });
          console.error('Register API error:', error);
          return of(null); // Consumed error
        })
      )
      .subscribe(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  // --- Methods for Toggling Forms & UI ---
  toggleToRegister(): void {
    this.showRegisterForm = true;
    this.stopCarousel();
    this.carouselImage = this.registerFormImage; // Static image for registration
    this.errorMessage = null; // Clear login error message
    this.cdr.markForCheck();
  }

  toggleToLogin(): void {
    this.showRegisterForm = false;
    this.startCarousel(); // This will set the initial login image and start cycling
    this.cdr.markForCheck();
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  // --- Carousel Logic (Original - adapt if needed) ---
  // If you want a continuously cycling carousel on the right, use this.
  // If you just want a static image per form (login vs register), then setting this.carouselImage is enough.
  // private startOrUpdateCarousel(): void {
  //   if (isPlatformBrowser(this.platformId)) {
  //     if (this.carouselIntervalId) {
  //       clearInterval(this.carouselIntervalId);
  //     }
  //     // Determine which set of images to use or how to behave based on this.showRegisterForm
  //     // This is a placeholder for more complex carousel logic if needed
  //     const imagesToShow = this.showRegisterForm ? [this.GALLERY_IMAGE_PATHS[1]] : [this.GALLERY_IMAGE_PATHS[2]];

  //     if (imagesToShow.length > 0) {
  //       this.currentImageIndex = 0; // Reset index
  //       this.carouselImage = imagesToShow[this.currentImageIndex]; // Set initial image for the current view
  //       this.cdr.markForCheck();

  //       if (imagesToShow.length > 1) { // Only set interval if multiple images for current view
  //         this.carouselIntervalId = setInterval(() => {
  //           this.currentImageIndex = (this.currentImageIndex + 1) % imagesToShow.length;
  //           this.carouselImage = imagesToShow[this.currentImageIndex];
  //           this.cdr.markForCheck();
  //         }, this.CAROUSEL_INTERVAL_MS);
  //       }
  //     }
  //   }
  // }

  // Simplified from original: if you want a cycling carousel for the "login" view and a static for "register"
  // you would call this from ngOnInit and toggleToLogin, and just set static image in toggleToRegister.
  // private startCarousel(): void {
  //   if (isPlatformBrowser(this.platformId) && !this.showRegisterForm && this.GALLERY_IMAGE_PATHS.length > 0) {
  //     // Example: only cycle gallery3 for login view, or a specific subset
  //     const loginImages = [this.GALLERY_IMAGE_PATHS[2], this.GALLERY_IMAGE_PATHS[0]]; // e.g. gallery3 and gallery1
  //     this.currentImageIndex = 0;
  //     this.carouselImage = loginImages[this.currentImageIndex];
  //     this.cdr.markForCheck();

  //     this.carouselIntervalId = setInterval(() => {
  //       this.currentImageIndex = (this.currentImageIndex + 1) % loginImages.length;
  //       this.carouselImage = loginImages[this.currentImageIndex];
  //       this.cdr.markForCheck();
  //     }, this.CAROUSEL_INTERVAL_MS);
  //   } else if (this.carouselIntervalId) {
  //     clearInterval(this.carouselIntervalId);
  //   }
  // }


  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    this.stopCarousel(); // Ensure carousel stops on component destruction
  }
}

// Standalone passwordMatchValidator function
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ mismatch: true });
    return { mismatch: true }; // Error set on the form group
  } else {
    // If passwords match or one field is empty, clear the mismatch error from confirmPassword
    if (confirmPassword?.hasError('mismatch')) {
      confirmPassword.setErrors(null);
    }
  }
  return null;
}
