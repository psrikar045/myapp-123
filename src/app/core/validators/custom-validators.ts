import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function emailOrUsernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Don't validate empty values, handled by Validators.required
    }
    const value = control.value;
    // Email validation regex (simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Username validation regex (alphanumeric, hyphens, underscores, 3-20 characters)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

    const isEmail = emailRegex.test(value);
    const isUsername = usernameRegex.test(value);

    if (isEmail || isUsername) {
      return null; // Valid
    } else {
      return { emailOrUsernameInvalid: true }; // Invalid
    }
  };
}
