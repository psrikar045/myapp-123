import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../components/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * Open a confirmation dialog
   */
  confirm(data: ConfirmationDialogData): Observable<boolean> {
    const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(
      ConfirmationDialogComponent,
      {
        width: '400px',
        data,
        disableClose: true,
        autoFocus: false
      }
    );

    return dialogRef.afterClosed();
  }

  /**
   * Quick confirmation dialog for delete actions
   */
  confirmDelete(itemName: string = 'this item'): Observable<boolean> {
    return this.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
  }

  /**
   * Quick confirmation dialog for save actions
   */
  confirmSave(message: string = 'Do you want to save your changes?'): Observable<boolean> {
    return this.confirm({
      title: 'Save Changes',
      message,
      confirmText: 'Save',
      cancelText: 'Cancel',
      type: 'success'
    });
  }

  /**
   * Quick confirmation dialog for discard actions
   */
  confirmDiscard(message: string = 'You have unsaved changes. Do you want to discard them?'): Observable<boolean> {
    return this.confirm({
      title: 'Discard Changes',
      message,
      confirmText: 'Discard',
      cancelText: 'Keep Editing',
      type: 'warning'
    });
  }

  /**
   * Quick info dialog
   */
  info(title: string, message: string): Observable<boolean> {
    return this.confirm({
      title,
      message,
      confirmText: 'OK',
      cancelText: '',
      type: 'info'
    });
  }

  /**
   * Quick warning dialog
   */
  warning(title: string, message: string): Observable<boolean> {
    return this.confirm({
      title,
      message,
      confirmText: 'OK',
      cancelText: '',
      type: 'warning'
    });
  }

  /**
   * Quick error dialog
   */
  error(title: string, message: string): Observable<boolean> {
    return this.confirm({
      title,
      message,
      confirmText: 'OK',
      cancelText: '',
      type: 'danger'
    });
  }

  /**
   * Quick success dialog
   */
  success(title: string, message: string): Observable<boolean> {
    return this.confirm({
      title,
      message,
      confirmText: 'OK',
      cancelText: '',
      type: 'success'
    });
  }
}