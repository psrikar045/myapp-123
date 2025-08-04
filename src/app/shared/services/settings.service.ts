import { Injectable, ComponentRef, ViewContainerRef, inject, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { SettingsPanelComponent } from '../components/settings-panel/settings-panel.component';

@Injectable({
  providedIn: 'root'
})
export class SettingsService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private settingsPanelRef: ComponentRef<SettingsPanelComponent> | null = null;
  private viewContainerRef: ViewContainerRef | null = null;

  setViewContainerRef(viewContainerRef: ViewContainerRef): void {
    this.viewContainerRef = viewContainerRef;
  }

  openSettingsPanel(): void {
    if (!this.viewContainerRef) {
      console.error('ViewContainerRef not set. Call setViewContainerRef first.');
      return;
    }

    // Close existing panel if open
    this.closeSettingsPanel();

    // Create new panel
    this.settingsPanelRef = this.viewContainerRef.createComponent(SettingsPanelComponent);
    this.settingsPanelRef.instance.openPanel();
  }

  closeSettingsPanel(): void {
    if (this.settingsPanelRef) {
      this.settingsPanelRef.instance.closePanel();
      
      // Delay destruction to allow close animation
      setTimeout(() => {
        // Check if service is still active before destroying component
        if (!this.destroy$.closed && this.settingsPanelRef) {
          this.settingsPanelRef.destroy();
          this.settingsPanelRef = null;
        }
      }, 400);
    }
  }

  isSettingsPanelOpen(): boolean {
    return this.settingsPanelRef !== null;
  }

  ngOnDestroy(): void {
    // Clean up any open panels
    if (this.settingsPanelRef) {
      this.settingsPanelRef.destroy();
      this.settingsPanelRef = null;
    }
    
    this.destroy$.next();
    this.destroy$.complete();
  }
}