import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ReactiveFormsModule,
  Validators,
  FormGroup, // Explicitly import FormGroup
  FormControl, // Explicitly import FormControl
  NonNullableFormBuilder, // Using NonNullableFormBuilder
  AbstractControl // Import if needed, though direct control access is often typed
} from '@angular/forms';
import { emailOrUsernameValidator } from '../../../core/validators/custom-validators'; // Import the custom validator
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
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
    MatProgressSpinnerModule
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

  // Explicitly type loginForm as per requirements
  loginForm: FormGroup<{
    identifier: FormControl<string>; // Changed from email to identifier
    password: FormControl<string>;
    rememberMe: FormControl<boolean>;
  }>;

  hidePassword = true;
  isLoading = false;
  errorMessage: string | null = null;
  isDarkMode = false;

  private themeSubscription!: Subscription;
  private carouselIntervalId: any;

  readonly GALLERY_IMAGE_PATHS: readonly string[] = [
    'images/gallery1.png',
    'images/gallery2.png',
    'images/gallery3.png',
  ];
  readonly CAROUSEL_INTERVAL_MS = 3000;

  galleryImages = this.GALLERY_IMAGE_PATHS;
  currentImageIndex = 0;

  constructor() {
    // Initialize the form using NonNullableFormBuilder.
    // The return type of this.fb.group should align with the explicit type of loginForm.
    this.loginForm = this.fb.group({
      identifier: this.fb.control('', [Validators.required, emailOrUsernameValidator()]), // Changed email to identifier and added custom validator
      password: this.fb.control('', [Validators.required]),
      rememberMe: this.fb.control(false), // NonNullableFormBuilder ensures this is FormControl<boolean>
    });
    // No cast needed here because NonNullableFormBuilder's group method with NonNullableControls
    // will produce a FormGroup whose controls are non-nullable and match the types specified
    // (string for empty string initial value, boolean for boolean initial value).

    this.registerSvgIcons();
  }

  ngOnInit(): void {
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
    const iconPath = 'icons/';
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

  // Typed get accessor for identifier (renamed from email)
  get identifier(): FormControl<string> {
    // When loginForm is explicitly typed as FormGroup<{ identifier: FormControl<string>; ... }>,
    // this.loginForm.controls.identifier is already correctly typed as FormControl<string>.
    return this.loginForm.controls.identifier;
  }

  // Typed get accessor for password
  get password(): FormControl<string> {
    return this.loginForm.controls.password;
  }

  // Optional: Typed get accessor for rememberMe
  get rememberMe(): FormControl<boolean> {
    return this.loginForm.controls.rememberMe;
  }

  clearIdentifier(): void { // Renamed from clearEmail
    this.identifier.setValue('');
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      // Simulate a login error for demonstration
      if (this.identifier.value === 'error@example.com' || this.identifier.value === 'erroruser') { // Updated to use identifier
        this.errorMessage = 'Invalid identifier or password. Please try again.'; // Updated error message
      } else {
        // Simulate success
        console.log('Login successful:', this.loginForm.value);
      }
      this.cdr.markForCheck(); // Needed due to setTimeout
    }, 1500);
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  private startCarousel(): void {
    if (this.galleryImages.length > 0) {
      this.carouselIntervalId = setInterval(() => {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.galleryImages.length;
        this.cdr.markForCheck();
      }, this.CAROUSEL_INTERVAL_MS);
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
}
