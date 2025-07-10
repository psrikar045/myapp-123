import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { ThemeService } from '../../../core/services/theme.service'; // Adjusted path

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
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly matIconRegistry = inject(MatIconRegistry);
  private readonly domSanitizer = inject(DomSanitizer);
  public readonly themeService = inject(ThemeService); // Made public for template access
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  loginForm!: FormGroup<{
    email: NonNullableFormBuilder['control']<string>;
    password: NonNullableFormBuilder['control']<string>;
    rememberMe: NonNullableFormBuilder['control']<boolean>;
  }>;

  hidePassword = true;
  isLoading = false;
  errorMessage: string | null = null;
  isDarkMode = false;

  private themeSubscription!: Subscription;
  private carouselIntervalId: any;

  readonly LOGO_PATH = 'assets/images/logo.png'; // Not used in .ts but good for consistency
  readonly GALLERY_IMAGE_PATHS: readonly string[] = [
    'assets/images/gallery1.png',
    'assets/images/gallery2.png',
    'assets/images/gallery3.png',
  ];
  readonly CAROUSEL_INTERVAL_MS = 3000;

  galleryImages = this.GALLERY_IMAGE_PATHS;
  currentImageIndex = 0;

  constructor() {
    this.registerSvgIcons();
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });

    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
      this.cdr.markForCheck(); // Ensure view updates on theme change
    });

    // Initialize isDarkMode from service synchronously for initial render
    this.isDarkMode = this.themeService.getIsDarkMode();


    if (isPlatformBrowser(this.platformId)) {
      this.startCarousel();
    }
  }

  private registerSvgIcons(): void {
    const iconPath = 'assets/icons/';
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
  }

  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  clearEmail(): void {
    this.email.setValue('');
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
      if (this.email.value === 'error@example.com') {
        this.errorMessage = 'Invalid email or password. Please try again.';
      } else {
        // Simulate success
        console.log('Login successful:', this.loginForm.value);
        // Navigate to dashboard or home page here
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
        this.cdr.markForCheck(); // Needed as setInterval is outside Angular zone
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
