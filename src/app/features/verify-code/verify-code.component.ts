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
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-verify-code',
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
  templateUrl: './verify-code.component.html',
  styleUrls: ['./verify-code.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyCodeComponent implements OnInit, OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly matIconRegistry = inject(MatIconRegistry);
  private readonly domSanitizer = inject(DomSanitizer);
  public readonly themeService = inject(ThemeService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  verifyCodeForm: FormGroup<{
    code: FormControl<string>;
  }>;

  hideCode = true;
  isLoading = false;
  errorMessage: string | null = null;
  isDarkMode = false;
  iconsRegistered = false; // Keep this if you use any svg icons like sun/moon for dark mode

  private themeSubscription!: Subscription;
  private carouselIntervalId: any;

  readonly GALLERY_IMAGE_PATHS: readonly string[] = ['images/gallery2.png']; // Using gallery2.png
  currentImageIndex = 0;
  readonly CAROUSEL_INTERVAL_MS = 3000;

  constructor() {
    this.verifyCodeForm = this.fb.group({
      // Example validation: required and 6 characters long. Adjust as needed.
      code: this.fb.control('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]),
    });

    if (isPlatformBrowser(this.platformId)) {
      this.registerSvgIcons(); // Call if you have SVG icons to register (e.g., for dark mode toggle)
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

  // Register SVG icons if needed (e.g., for dark mode toggle)
  private registerSvgIcons(): void {
    const iconPath = '/icons/';
    this.matIconRegistry.addSvgIcon('sun', this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'sun.svg'));
    this.matIconRegistry.addSvgIcon('moon', this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'moon.svg'));
  }

  get code(): FormControl<string> {
    return this.verifyCodeForm.controls.code;
  }

  toggleCodeVisibility(): void {
    this.hideCode = !this.hideCode;
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.verifyCodeForm.invalid) {
      this.verifyCodeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    console.log('Verify code form submitted:', this.verifyCodeForm.value);
    // For now, navigate to /set-password
    setTimeout(() => { // Simulate async operation
      this.isLoading = false;
      this.router.navigate(['/set-password']);
      this.cdr.markForCheck();
    }, 1000);
  }

  back(): void {
    this.router.navigate(['/forgot-password']);
  }

  cancel(): void {
    this.router.navigate(['/login']);
  }

  resendCode(): void {
    // Placeholder for resend code logic
    console.log('Resend code clicked');
    // Optionally, show a message like "Code resent"
  }

  toggleDarkMode(): void {
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
