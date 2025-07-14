import { Injectable } from '@angular/core';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface DomainValidationResult extends ValidationResult {
  finalUrl?: string;
}

export interface PasswordStrengthResult {
  strength: number; // 0-100
  text: string; // 'Weak', 'Medium', 'Strong'
  color: string; // CSS color value
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  /**
   * Validate if a string is a valid URL
   */
  isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validate if a string is a valid domain name
   */
  isValidDomain(domain: string): boolean {
    // Remove protocol if present
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    
    // Basic domain validation regex
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    return domainRegex.test(cleanDomain) && 
           cleanDomain.length <= 253 && 
           cleanDomain.includes('.') &&
           !cleanDomain.startsWith('.') && 
           !cleanDomain.endsWith('.');
  }

  /**
   * Validate and convert domain to proper URL
   */
  async validateAndConvertDomain(domain: string): Promise<string> {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    
    // Try HTTPS first, then HTTP
    const httpsUrl = `https://${cleanDomain}`;
    const httpUrl = `http://${cleanDomain}`;
    
    try {
      // Try to fetch the HTTPS version first
      const response = await fetch(httpsUrl, { 
        method: 'HEAD', 
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return httpsUrl;
    } catch {
      try {
        // If HTTPS fails, try HTTP
        const response = await fetch(httpUrl, { 
          method: 'HEAD', 
          mode: 'no-cors',
          signal: AbortSignal.timeout(5000)
        });
        return httpUrl;
      } catch {
        throw new Error('Website not accessible');
      }
    }
  }

  /**
   * Comprehensive URL/Domain validation (reused from search component)
   */
  async validateUrlOrDomain(input: string): Promise<DomainValidationResult> {
    if (!input || input.trim().length === 0) {
      return {
        isValid: false,
        error: 'Please enter a website URL or domain name'
      };
    }

    const trimmedInput = input.trim();

    try {
      // Check if input is a URL
      if (trimmedInput.startsWith('http://') || trimmedInput.startsWith('https://')) {
        if (!this.isValidUrl(trimmedInput)) {
          return {
            isValid: false,
            error: 'Please enter a valid URL (e.g., https://example.com)'
          };
        }
        return {
          isValid: true,
          finalUrl: trimmedInput
        };
      } else {
        // Check if input is a valid domain name
        if (!this.isValidDomain(trimmedInput)) {
          return {
            isValid: false,
            error: 'Please enter a valid domain name (e.g., example.com)'
          };
        }

        // Try to validate and convert domain to proper URL
        try {
          const finalUrl = await this.validateAndConvertDomain(trimmedInput);
          return {
            isValid: true,
            finalUrl: finalUrl
          };
        } catch (error) {
          return {
            isValid: false,
            error: 'No website found for the provided domain name'
          };
        }
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to validate the provided input. Please try again.'
      };
    }
  }

  /**
   * Extract brand name from company name (reused from search component)
   */
  extractBrandName(companyName: string): string {
    // If there's a dash, take the part after the last dash
    if (companyName.includes(' - ')) {
      const parts = companyName.split(' - ');
      return parts[parts.length - 1].trim();
    }
    
    // If there's "Inc.", "LLC", "Corp", etc., remove them
    const suffixes = ['Inc.', 'LLC', 'Corp', 'Corporation', 'Ltd', 'Limited', 'Co.', 'Company'];
    let cleanName = companyName;
    
    suffixes.forEach(suffix => {
      const regex = new RegExp(`\\s+${suffix}\\s*$`, 'i');
      cleanName = cleanName.replace(regex, '');
    });
    
    return cleanName.trim();
  }

  /**
   * Checks password strength and returns strength indicators
   * @param password The password to check
   * @returns PasswordStrengthResult object with strength, text, and color
   */
  checkPasswordStrength(password: string): PasswordStrengthResult {
    if (!password) {
      return {
        strength: 0,
        text: '',
        color: ''
      };
    }

    // Calculate password strength
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 1; // Has uppercase
    if (/[a-z]/.test(password)) strength += 1; // Has lowercase
    if (/[0-9]/.test(password)) strength += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Has special char
    
    // Normalize to 0-100 scale
    const normalizedStrength = Math.min(Math.floor((strength / 6) * 100), 100);
    
    // Set text and color based on strength
    let text: string;
    let color: string;
    
    if (normalizedStrength < 40) {
      text = 'Weak';
      color = 'var(--password-strength-weak, #f44336)';
    } else if (normalizedStrength < 70) {
      text = 'Medium';
      color = 'var(--password-strength-medium, #ff9800)';
    } else {
      text = 'Strong';
      color = 'var(--password-strength-strong, #4caf50)';
    }

    return {
      strength: normalizedStrength,
      text,
      color
    };
  }

  /**
   * Email validation
   */
  validateEmail(email: string): ValidationResult {
    if (!email || email.trim().length === 0) {
      return {
        isValid: false,
        error: 'Email is required'
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        isValid: false,
        error: 'Please enter a valid email address'
      };
    }

    return { isValid: true };
  }

  /**
   * Verification code validation
   */
  validateVerificationCode(code: string): ValidationResult {
    if (!code || code.trim().length === 0) {
      return {
        isValid: false,
        error: 'Verification code is required'
      };
    }

    const codeRegex = /^[a-zA-Z0-9]{6}$/;
    if (!codeRegex.test(code.trim())) {
      return {
        isValid: false,
        error: 'Code must be 6 alphanumeric characters'
      };
    }

    return { isValid: true };
  }

  /**
   * Password validation
   */
  validatePassword(password: string): ValidationResult {
    if (!password || password.length === 0) {
      return {
        isValid: false,
        error: 'Password is required'
      };
    }

    if (password.length < 8) {
      return {
        isValid: false,
        error: 'Password must be at least 8 characters long'
      };
    }

    return { isValid: true };
  }

  /**
   * Password confirmation validation
   */
  validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
    if (!confirmPassword || confirmPassword.length === 0) {
      return {
        isValid: false,
        error: 'Please confirm your password'
      };
    }

    if (password !== confirmPassword) {
      return {
        isValid: false,
        error: 'Passwords do not match'
      };
    }

    return { isValid: true };
  }
}