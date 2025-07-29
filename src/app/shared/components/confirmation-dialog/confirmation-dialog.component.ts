import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirmation-dialog" [class]="'confirmation-dialog--' + data.type">
      <div class="confirmation-dialog__header">
        <mat-icon class="confirmation-dialog__icon">
          {{ getIcon() }}
        </mat-icon>
        <h2 mat-dialog-title class="confirmation-dialog__title">{{ data.title }}</h2>
      </div>
      
      <div mat-dialog-content class="confirmation-dialog__content">
        <p>{{ data.message }}</p>
      </div>
      
      <div mat-dialog-actions class="confirmation-dialog__actions">
        <button 
          mat-button 
          (click)="onCancel()"
          class="confirmation-dialog__button confirmation-dialog__button--cancel">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button 
          mat-raised-button 
          [color]="getButtonColor()"
          (click)="onConfirm()"
          class="confirmation-dialog__button confirmation-dialog__button--confirm">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      min-width: 300px;
      max-width: 500px;
    }

    .confirmation-dialog__header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .confirmation-dialog__icon {
      margin-right: 12px;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .confirmation-dialog--warning .confirmation-dialog__icon {
      color: #ff9800;
    }

    .confirmation-dialog--danger .confirmation-dialog__icon {
      color: #f44336;
    }

    .confirmation-dialog--info .confirmation-dialog__icon {
      color: #2196f3;
    }

    .confirmation-dialog--success .confirmation-dialog__icon {
      color: #4caf50;
    }

    .confirmation-dialog__title {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .confirmation-dialog__content {
      margin-bottom: 24px;
      color: #666;
      line-height: 1.5;
    }

    .confirmation-dialog__actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin: 0;
      padding: 0;
    }

    .confirmation-dialog__button {
      min-width: 80px;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {
    // Set default type if not provided
    this.data.type = this.data.type || 'info';
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      case 'success':
        return 'check_circle';
      case 'info':
      default:
        return 'info';
    }
  }

  getButtonColor(): string {
    switch (this.data.type) {
      case 'danger':
        return 'warn';
      case 'success':
        return 'primary';
      case 'warning':
      case 'info':
      default:
        return 'primary';
    }
  }
}