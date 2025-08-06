import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  /**
   * Copy text to clipboard with comprehensive fallback support
   */
  async copyToClipboard(text: string, successMessage?: string, errorMessage?: string): Promise<boolean> {
    if (!text) {
      console.warn('ClipboardService: No text provided to copy');
      return false;
    }

    const defaultSuccessMessage = 'Copied to clipboard';
    const defaultErrorMessage = 'Failed to copy to clipboard';

    try {
      // Try modern Clipboard API first
      if (this.isClipboardApiAvailable()) {
        await navigator.clipboard.writeText(text);
        if (successMessage !== null) {
          this.showMessage(successMessage || defaultSuccessMessage, 'success');
        }
        return true;
      } else {
        // Use fallback method
        return this.fallbackCopyToClipboard(text, successMessage, errorMessage);
      }
    } catch (error) {
      console.error('Clipboard API failed:', error);
      // Try fallback method
      return this.fallbackCopyToClipboard(text, successMessage, errorMessage);
    }
  }

  /**
   * Check if Clipboard API is available and functional
   */
  private isClipboardApiAvailable(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function' &&
      window.isSecureContext !== false &&
      // Additional check for permissions
      this.isSecureContext()
    );
  }

  /**
   * Check if we're in a secure context
   */
  private isSecureContext(): boolean {
    // Check if we're in a secure context (HTTPS, localhost, or file://)
    if (typeof window === 'undefined') return false;
    
    return (
      window.isSecureContext ||
      location.protocol === 'https:' ||
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1' ||
      location.protocol === 'file:'
    );
  }

  /**
   * Fallback method using the legacy document.execCommand approach
   */
  private fallbackCopyToClipboard(text: string, successMessage?: string, errorMessage?: string): boolean {
    try {
      // Create a temporary textarea element
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Make it invisible but still functional
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      textArea.style.zIndex = '-1';
      textArea.setAttribute('readonly', '');
      textArea.setAttribute('aria-hidden', 'true');
      textArea.setAttribute('tabindex', '-1');
      
      // Add to DOM, select, copy, and remove
      document.body.appendChild(textArea);
      
      // Focus and select the text
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);
      
      // Try to copy using execCommand
      const successful = document.execCommand('copy');
      
      // Clean up
      document.body.removeChild(textArea);
      
      if (successful) {
        if (successMessage !== null) {
          this.showMessage(successMessage || 'Copied to clipboard', 'success');
        }
        return true;
      } else {
        this.showManualCopyDialog(text);
        return false;
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      this.showManualCopyDialog(text);
      return false;
    }
  }

  /**
   * Show manual copy dialog when all automated methods fail
   */
  private showManualCopyDialog(text: string): void {
    Swal.fire({
      title: 'Manual Copy Required',
      html: `
        <p class="mb-3">Automatic copying is not available. Please manually copy the text below:</p>
        <div class="input-group mb-3">
          <input type="text" class="form-control font-monospace" value="${this.escapeHtml(text)}" readonly id="manual-copy-input">
          <button class="btn btn-outline-secondary" type="button" onclick="
            const input = document.getElementById('manual-copy-input');
            input.select();
            input.setSelectionRange(0, 99999);
          ">
            <i class="bi bi-cursor-text"></i> Select All
          </button>
        </div>
        <div class="alert alert-info alert-sm">
          <i class="bi bi-info-circle me-2"></i>
          <small>Use <kbd>Ctrl+C</kbd> (or <kbd>Cmd+C</kbd> on Mac) to copy the selected text</small>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Done',
      width: '500px',
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        htmlContainer: 'swal2-content-custom'
      },
      didOpen: () => {
        // Auto-select the text when dialog opens
        const input = document.getElementById('manual-copy-input') as HTMLInputElement;
        if (input) {
          setTimeout(() => {
            input.focus();
            input.select();
            input.setSelectionRange(0, text.length);
          }, 100);
        }
      }
    });
  }

  /**
   * Show success/error message (you can customize this based on your notification system)
   */
  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // You can replace this with your preferred notification system
    // For now, using a simple toast-like approach
    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    toast.fire({
      icon: type,
      title: message
    });
  }

  /**
   * Escape HTML to prevent XSS in manual copy dialog
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Check if clipboard functionality is supported at all
   */
  isClipboardSupported(): boolean {
    return (
      this.isClipboardApiAvailable() ||
      (typeof document !== 'undefined' && typeof document.execCommand === 'function')
    );
  }

  /**
   * Get clipboard support information for debugging
   */
  getClipboardSupportInfo(): {
    clipboardApiAvailable: boolean;
    execCommandAvailable: boolean;
    secureContext: boolean;
    userAgent: string;
  } {
    return {
      clipboardApiAvailable: this.isClipboardApiAvailable(),
      execCommandAvailable: typeof document !== 'undefined' && typeof document.execCommand === 'function',
      secureContext: this.isSecureContext(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
    };
  }
}