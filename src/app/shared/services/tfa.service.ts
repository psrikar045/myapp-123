import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserAuthService } from './user-auth.service';
import { TfaRequest } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class TfaService {

  constructor(private userAuthService: UserAuthService) {}

  /**
   * Setup Two-Factor Authentication for a user
   * @param username Username to set up 2FA for
   * @returns Observable of setup response
   */
  setup(username: string): Observable<any> {
    return this.userAuthService.setupTfa(username);
  }

  /**
   * Enable Two-Factor Authentication for a user
   * @param username Username to enable 2FA for
   * @returns Observable of enable response
   */
  enable(username: string): Observable<any> {
    return this.userAuthService.enableTfa(username);
  }

  /**
   * Disable Two-Factor Authentication for a user
   * @param username Username to disable 2FA for
   * @returns Observable of disable response
   */
  disable(username: string): Observable<any> {
    return this.userAuthService.disableTfa(username);
  }

  /**
   * Verify Two-Factor Authentication code
   * @param username Username
   * @param code 2FA code to verify
   * @returns Observable of verification response
   */
  verify(username: string, code: string): Observable<any> {
    const request: TfaRequest = { username, code };
    return this.userAuthService.verifyTfa(request);
  }

  /**
   * Get 2FA QR Code for setup
   * @param username Username to get QR code for
   * @returns Observable of QR code blob
   */
  getQrCode(username: string): Observable<Blob> {
    return this.userAuthService.getTfaQrCode(username);
  }

  /**
   * Get current TOTP code (for testing purposes)
   * @param username Username to get TOTP code for
   * @returns Observable of current TOTP code
   */
  getCurrentCode(username: string): Observable<any> {
    return this.userAuthService.getCurrentTotpCode(username);
  }

  /**
   * Create a data URL from QR code blob for display
   * @param qrCodeBlob QR code blob
   * @returns Promise of data URL string
   */
  createQrCodeDataUrl(qrCodeBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read QR code blob'));
      };
      reader.readAsDataURL(qrCodeBlob);
    });
  }

  /**
   * Validate 2FA code format
   * @param code Code to validate
   * @returns True if format is valid (6 digits)
   */
  validateCodeFormat(code: string): boolean {
    const codeRegex = /^\d{6}$/;
    return codeRegex.test(code);
  }

  /**
   * Generate backup codes (client-side utility)
   * @param count Number of backup codes to generate
   * @returns Array of backup codes
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric backup code
      const code = this.generateRandomCode(8);
      codes.push(code);
    }
    
    return codes;
  }

  /**
   * Format backup code for display
   * @param code Raw backup code
   * @returns Formatted backup code (e.g., ABCD-EFGH)
   */
  formatBackupCode(code: string): string {
    if (code.length === 8) {
      return `${code.substring(0, 4)}-${code.substring(4, 8)}`;
    }
    return code;
  }

  /**
   * Check if 2FA is required for login
   * @param loginResponse Login response from server
   * @returns True if 2FA is required
   */
  isTfaRequired(loginResponse: any): boolean {
    return loginResponse && loginResponse.tfaRequired === true;
  }

  /**
   * Store 2FA setup state in session storage
   * @param username Username
   * @param setupComplete Whether setup is complete
   */
  storeSetupState(username: string, setupComplete: boolean): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const tfaState = {
        username,
        setupComplete,
        timestamp: Date.now()
      };
      sessionStorage.setItem('tfa_setup_state', JSON.stringify(tfaState));
    }
  }

  /**
   * Get 2FA setup state from session storage
   * @returns 2FA setup state or null
   */
  getSetupState(): { username: string; setupComplete: boolean; timestamp: number } | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stateJson = sessionStorage.getItem('tfa_setup_state');
      if (stateJson) {
        try {
          const state = JSON.parse(stateJson);
          // Check if state is not older than 1 hour
          if (Date.now() - state.timestamp < 3600000) {
            return state;
          }
        } catch (error) {
          console.error('Error parsing 2FA setup state:', error);
        }
      }
    }
    return null;
  }

  /**
   * Clear 2FA setup state from session storage
   */
  clearSetupState(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('tfa_setup_state');
    }
  }

  /**
   * Generate random alphanumeric code
   * @param length Length of the code
   * @returns Random code string
   */
  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Get 2FA setup instructions
   * @returns Array of setup instruction steps
   */
  getSetupInstructions(): string[] {
    return [
      'Download and install an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator on your mobile device.',
      'Click "Setup 2FA" to generate your unique QR code.',
      'Open your authenticator app and scan the QR code displayed on screen.',
      'Enter the 6-digit code from your authenticator app to verify the setup.',
      'Save your backup codes in a secure location in case you lose access to your device.',
      'Two-factor authentication is now enabled for your account.'
    ];
  }

  /**
   * Get supported authenticator apps
   * @returns Array of supported authenticator apps
   */
  getSupportedAuthenticatorApps(): { name: string; platforms: string[]; downloadUrl: string }[] {
    return [
      {
        name: 'Google Authenticator',
        platforms: ['iOS', 'Android'],
        downloadUrl: 'https://support.google.com/accounts/answer/1066447'
      },
      {
        name: 'Microsoft Authenticator',
        platforms: ['iOS', 'Android'],
        downloadUrl: 'https://www.microsoft.com/en-us/security/mobile-authenticator-app'
      },
      {
        name: 'Authy',
        platforms: ['iOS', 'Android', 'Desktop'],
        downloadUrl: 'https://authy.com/download/'
      },
      {
        name: '1Password',
        platforms: ['iOS', 'Android', 'Desktop'],
        downloadUrl: 'https://1password.com/downloads/'
      }
    ];
  }
}