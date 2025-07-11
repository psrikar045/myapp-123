import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, Validators, FormGroup, FormControl, NonNullableFormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service'; // Assuming similar theme service usage

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly matIconRegistry = inject(MatIconRegistry);
  private readonly domSanitizer = inject(DomSanitizer);
  public readonly themeService = inject(ThemeService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  forgotPasswordForm: FormGroup<{
    email: FormControl<string>;
  }>;

  isLoading = false;
  errorMessage: string | null = null;
  isDarkMode = false;
  iconsRegistered = false;

  private themeSubscription!: Subscription;
  private carouselIntervalId: any;

  readonly GALLERY_IMAGE_PATHS: readonly string[] = ['images/gallery1.png']; // Using gallery1.png
  currentImageIndex = 0;
  readonly CAROUSEL_INTERVAL_MS = 3000; // Same as login

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: this.fb.control('', [Validators.required, Validators.email]),
    });

    if (isPlatformBrowser(this.platformId)) {
      this.registerSvgIcons();
      this.iconsRegistered = true;
    }
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
    const iconPath = '/icons/'; // Assuming icons are in the same path
    this.matIconRegistry.addSvgIcon('google', this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'google.svg'));
    this.matIconRegistry.addSvgIcon('facebook', this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'facebook.svg'));
    this.matIconRegistry.addSvgIcon('apple', this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'apple.svg'));
     // Add sun/moon if dark mode toggle is used, or remove if not
    this.matIconRegistry.addSvgIcon('sun', this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'sun.svg'));
    this.matIconRegistry.addSvgIcon('moon', this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'moon.svg'));
  }

  get email(): FormControl<string> {
    return this.forgotPasswordForm.controls.email;
  }

  clearEmail(): void {
    this.email.setValue('');
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    // Simulate API call
    console.log('Forgot password form submitted:', this.forgotPasswordForm.value);
    // For now, navigate to /verify-code
    setTimeout(() => { // Simulate async operation
      this.isLoading = false;
      this.router.navigate(['/verify-code']);
      this.cdr.markForCheck();
    }, 1000);
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }

  toggleDarkMode(): void { // If you want to keep the dark mode toggle
    this.themeService.toggleDarkMode();
  }

  private startCarousel(): void {
    if (this.GALLERY_IMAGE_PATHS.length > 0) {
      this.carouselIntervalId = setInterval(() => {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.GALLERY_IMAGE_PATHS.length;
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
