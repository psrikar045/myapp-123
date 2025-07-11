import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, Validators, FormGroup, FormControl, NonNullableFormBuilder, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';
// Assuming a custom validator for strong passwords might exist or be added later
// For now, using minLength. A real app would use a more complex validator.
// import { strongPasswordValidator } from '../../core/validators/custom-validators';

// Custom validator for password matching
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else if (confirmPassword?.hasError('passwordMismatch')) {
    // Clear error if they now match, but only if the error was 'passwordMismatch'
    // This prevents clearing other potential errors on the confirmPassword field
    confirmPassword.setErrors(null);
  }
  return null;
};

@Component({
  selector: 'app-set-password',
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
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetPasswordComponent implements OnInit, OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly matIconRegistry = inject(MatIconRegistry);
  private readonly domSanitizer = inject(DomSanitizer);
  public readonly themeService = inject(ThemeService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  setPasswordForm: FormGroup<{
    newPassword: FormControl<string>;
    confirmPassword: FormControl<string>;
  }>;

  hideNewPassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  errorMessage: string | null = null;
  isDarkMode = false;
  iconsRegistered = false;

  private themeSubscription!: Subscription;
  private carouselIntervalId: any;

  readonly GALLERY_IMAGE_PATHS: readonly string[] = ['images/gallery3.png']; // Using gallery3.png
  currentImageIndex = 0;
  readonly CAROUSEL_INTERVAL_MS = 3000;

  constructor() {
    this.setPasswordForm = this.fb.group({
      newPassword: this.fb.control('', [
        Validators.required,
        Validators.minLength(8),
        // strongPasswordValidator() // Add this if you have a custom strong password validator
      ]),
      confirmPassword: this.fb.control('', [Validators.required]),
    }, { validators: passwordMatchValidator });

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
    const iconPath = '/icons/';
    this.matIconRegistry.addSvgIcon('sun', this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'sun.svg'));
    this.matIconRegistry.addSvgIcon('moon', this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath + 'moon.svg'));
  }

  get newPassword(): FormControl<string> {
    return this.setPasswordForm.controls.newPassword;
  }

  get confirmPassword(): FormControl<string> {
    return this.setPasswordForm.controls.confirmPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.hideNewPassword = !this.hideNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.setPasswordForm.invalid) {
      this.setPasswordForm.markAllAsTouched();
      // Manually trigger validation update for confirmPassword if newPassword has changed
      // and the form-level validator might not have re-run for the confirmPassword field specifically.
      this.confirmPassword.updateValueAndValidity();
      return;
    }

    this.isLoading = true;
    console.log('Set password form submitted:', this.setPasswordForm.value.newPassword); // Don't log confirmPassword
    // For now, navigate to /login
    setTimeout(() => { // Simulate async operation
      this.isLoading = false;
      this.router.navigate(['/login']);
      this.cdr.markForCheck();
    }, 1000);
  }

  back(): void {
    this.router.navigate(['/verify-code']);
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
