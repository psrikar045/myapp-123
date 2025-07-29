import { Injectable, ComponentRef, ViewContainerRef, inject } from '@angular/core';
import { SettingsPanelComponent } from '../components/settings-panel/settings-panel.component';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
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
        if (this.settingsPanelRef) {
          this.settingsPanelRef.destroy();
          this.settingsPanelRef = null;
        }
      }, 400);
    }
  }

  isSettingsPanelOpen(): boolean {
    return this.settingsPanelRef !== null;
  }
}