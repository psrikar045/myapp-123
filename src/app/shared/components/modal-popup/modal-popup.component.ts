import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ModalButton {
  label: string;
  action: string;
  variant?: string;
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  disableWhenNoData?: boolean;
  enableWhenNoData?: boolean;
}

export interface ModalConfig {
  title?: string;
  showCancelIcon?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
  backdrop?: boolean;
  buttons?: ModalButton[];
  responsive?: boolean;
}

@Component({
  selector: 'app-modal-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-popup.component.html',
  styleUrls: ['./modal-popup.component.scss']
})
export class ModalPopupComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() config: ModalConfig = {};
  @Input() hasData = false; // For smart button state management

  @Output() buttonClick = new EventEmitter<{ action: string; data?: any }>();
  @Output() modalClose = new EventEmitter<void>();
  @Output() backdropClick = new EventEmitter<void>();

  private originalBodyOverflow = '';

  ngOnInit(): void {
    this.setupDefaultConfig();
  }

  ngOnDestroy(): void {
    this.restoreBodyScroll();
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.disableBodyScroll();
      this.updateButtonStates();
    } else {
      this.restoreBodyScroll();
    }
  }

  /**
   * Setup default configuration
   */
  private setupDefaultConfig(): void {
    this.config = {
      title: 'Modal',
      showCancelIcon: true,
      size: 'md',
      centered: true,
      backdrop: true,
      responsive: true,
      buttons: [],
      ...this.config
    };
  }

  /**
   * Disable body scroll when modal is open
   */
  private disableBodyScroll(): void {
    this.originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  /**
   * Restore body scroll when modal is closed
   */
  private restoreBodyScroll(): void {
    document.body.style.overflow = this.originalBodyOverflow;
  }

  /**
   * Update button states based on data availability
   */
  private updateButtonStates(): void {
    if (!this.config.buttons) return;

    this.config.buttons.forEach(button => {
      // Auto-disable buttons when no data
      if (button.disableWhenNoData) {
        button.disabled = !this.hasData;
      }

      // Auto-enable buttons when no data
      if (button.enableWhenNoData) {
        button.disabled = false;
      }

      // Default behavior for common actions
      switch (button.action) {
        case 'save':
        case 'apply':
        case 'ok':
        case 'submit':
          if (!button.hasOwnProperty('disableWhenNoData')) {
            button.disabled = !this.hasData;
          }
          break;

        case 'clear':
        case 'delete':
        case 'remove':
          if (!button.hasOwnProperty('disableWhenNoData')) {
            button.disabled = !this.hasData;
          }
          break;

        case 'cancel':
        case 'close':
          // Always enabled
          button.disabled = false;
          break;
      }
    });
  }

  /**
   * Handle button clicks
   */
  onButtonClick(action: string): void {
    const button = this.config.buttons?.find(b => b.action === action);
    
    // Handle built-in actions
    switch (action) {
      case 'cancel':
      case 'close':
        this.closeModal();
        break;
    }

    // Emit button click event
    this.buttonClick.emit({ action, data: button });
  }

  /**
   * Handle cancel icon click
   */
  onCancelIconClick(): void {
    this.onButtonClick('cancel');
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget && this.config.backdrop) {
      this.backdropClick.emit();
    }
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.isOpen = false;
    this.modalClose.emit();
    this.restoreBodyScroll();
  }

  /**
   * Get modal size class
   */
  getModalSizeClass(): string {
    const sizeMap = {
      'sm': 'modal-sm',
      'md': 'modal-md',
      'lg': 'modal-lg',
      'xl': 'modal-xl'
    };
    return sizeMap[this.config.size || 'md'];
  }

  /**
   * Get button CSS classes
   */
  getButtonClass(button: ModalButton): string {
    const baseClass = 'btn';
    const variantClass = `btn-${button.variant || 'secondary'}`;
    return `${baseClass} ${variantClass}`;
  }

  /**
   * Check if button should be disabled
   */
  isButtonDisabled(button: ModalButton): boolean {
    return button.disabled || button.loading || false;
  }

  /**
   * Track buttons for ngFor
   */
  trackButton(index: number, button: ModalButton): string {
    return button.action;
  }
}