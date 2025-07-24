import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Form utility functions and custom validators
 */

export class FormUtils {
  /**
   * Mark all fields in a form group as touched
   */
  static markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Get all validation errors from a form group
   */
  static getFormValidationErrors(form: FormGroup): any[] {
    const formErrors: any[] = [];

    Object.keys(form.controls).forEach(key => {
      const controlErrors: ValidationErrors | null|any = form.get(key)?.errors;
      if (controlErrors) {
        Object.keys(controlErrors).forEach(keyError => {
          formErrors.push({
            control: key,
            error: keyError,
            value: controlErrors[keyError]
          });
        });
      }
    });

    return formErrors;
  }

  /**
   * Reset form to initial state
   */
  static resetForm(form: FormGroup, initialValues?: any): void {
    form.reset(initialValues);
    this.clearFormErrors(form);
  }

  /**
   * Clear all validation errors
   */
  static clearFormErrors(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.setErrors(null);
      control?.markAsUntouched();
      control?.markAsPristine();

      if (control instanceof FormGroup) {
        this.clearFormErrors(control);
      }
    });
  }

  /**
   * Check if form field has error
   */
  static hasError(form: FormGroup, fieldName: string, errorType?: string): boolean {
    const field = form.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  /**
   * Get error message for a field
   */
  static getErrorMessage(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) return `${fieldName} is required`;
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength}`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['pattern']) return 'Please enter a valid format';
    if (errors['passwordMismatch']) return 'Passwords do not match';
    if (errors['strongPassword']) return 'Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character';

    return 'Invalid input';
  }
}

/**
 * Custom Validators
 */
export class CustomValidators {
  /**
   * Email validator
   */
  static email(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(control.value) ? null : { email: true };
  }

  /**
   * Strong password validator
   */
  static strongPassword(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(control.value) ? null : { strongPassword: true };
  }

  /**
   * Phone number validator
   */
  static phone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(control.value) ? null : { phone: true };
  }

  /**
   * URL validator
   */
  static url(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    try {
      new URL(control.value);
      return null;
    } catch {
      return { url: true };
    }
  }

  /**
   * Password confirmation validator
   */
  static passwordMatch(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;

      const password = control.parent.get(passwordField);
      const confirmPassword = control.parent.get(confirmPasswordField);

      if (!password || !confirmPassword) return null;

      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    };
  }

  /**
   * Minimum age validator
   */
  static minAge(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age - 1 } };
      }

      return age >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age } };
    };
  }

  /**
   * File size validator
   */
  static fileSize(maxSizeInMB: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const file = control.value as File;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      return file.size <= maxSizeInBytes ? null : { 
        fileSize: { 
          maxSize: maxSizeInMB, 
          actualSize: Math.round(file.size / 1024 / 1024 * 100) / 100 
        } 
      };
    };
  }

  /**
   * File type validator
   */
  static fileType(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const file = control.value as File;
      const fileType = file.type.toLowerCase();

      return allowedTypes.includes(fileType) ? null : { 
        fileType: { 
          allowedTypes, 
          actualType: fileType 
        } 
      };
    };
  }

  /**
   * Credit card validator (Luhn algorithm)
   */
  static creditCard(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const cardNumber = control.value.replace(/\D/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      return { creditCard: true };
    }

    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0 ? null : { creditCard: true };
  }

  /**
   * No whitespace validator
   */
  static noWhitespace(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return control.value.trim().length === 0 ? { noWhitespace: true } : null;
  }

  /**
   * Alphanumeric validator
   */
  static alphanumeric(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(control.value) ? null : { alphanumeric: true };
  }

  /**
   * Custom pattern validator with message
   */
  static patternWithMessage(pattern: RegExp, message: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return pattern.test(control.value) ? null : { patternWithMessage: { message } };
    };
  }
}