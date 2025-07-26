import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppThemePanelService {
  private _isOpen = new BehaviorSubject<boolean>(false);
  
  public isOpen$ = this._isOpen.asObservable();

  open(): void {
    this._isOpen.next(true);
    document.body.classList.add('theme-panel-open');
    // Prevent body scroll when panel is open
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this._isOpen.next(false);
    document.body.classList.remove('theme-panel-open');
    // Restore body scroll
    document.body.style.overflow = '';
  }

  toggle(): void {
    if (this._isOpen.value) {
      this.close();
    } else {
      this.open();
    }
  }

  isOpen(): boolean {
    return this._isOpen.value;
  }
}