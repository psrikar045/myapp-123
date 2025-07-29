import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AppThemeService } from '../../../core/services/app-theme.service';
import { AppThemePanelService } from '../../services/app-theme-panel.service';
import { LayoutService } from '../../../core/services/layout.service';

export interface SettingsConfig {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  sidebarWidth: 'compact' | 'normal' | 'wide';
  animations: boolean;
  notifications: boolean;
  autoSave: boolean;
  language: string;
}

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="settings-panel-overlay" 
         [class.visible]="isVisible"
         (click)="closePanel()">
    </div>
    
    <div class="settings-panel" 
         [class.visible]="isVisible"
         [attr.data-bs-theme]="isDarkMode ? 'dark' : 'light'">
      
      <!-- Header -->
      <div class="settings-header">
        <h5 class="settings-title">
          <i class="bi-gear-fill me-2"></i>
          Application Settings
        </h5>
        <button class="btn-close-settings" 
                type="button"
                (click)="closePanel()"
                aria-label="Close settings">
          <i class="bi-x-lg"></i>
        </button>
      </div>

      <!-- Settings Content -->
      <div class="settings-content">
        
        <!-- Appearance Section -->
        <div class="settings-section">
          <h6 class="section-title">
            <i class="bi-palette me-2"></i>
            Appearance
          </h6>
          
          <!-- Theme Selection -->
          <div class="setting-item">
            <label class="setting-label">Theme</label>
            <div class="theme-options">
              <button class="theme-option" 
                      [class.active]="settings.theme === 'light'"
                      (click)="updateTheme('light')">
                <i class="bi-sun-fill"></i>
                <span>Light</span>
              </button>
              <button class="theme-option" 
                      [class.active]="settings.theme === 'dark'"
                      (click)="updateTheme('dark')">
                <i class="bi-moon-fill"></i>
                <span>Dark</span>
              </button>
              <button class="theme-option" 
                      [class.active]="settings.theme === 'auto'"
                      (click)="updateTheme('auto')">
                <i class="bi-circle-half"></i>
                <span>Auto</span>
              </button>
            </div>
          </div>

          <!-- Font Size -->
          <div class="setting-item">
            <label class="setting-label">Font Size</label>
            <select class="form-select form-select-sm" 
                    [(ngModel)]="settings.fontSize"
                    (ngModelChange)="updateFontSize($event)">
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <!-- Sidebar Width -->
          <div class="setting-item">
            <label class="setting-label">Sidebar Width</label>
            <select class="form-select form-select-sm" 
                    [(ngModel)]="settings.sidebarWidth"
                    (ngModelChange)="updateSidebarWidth($event)">
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="wide">Wide</option>
            </select>
          </div>
        </div>

        <!-- Behavior Section -->
        <div class="settings-section">
          <h6 class="section-title">
            <i class="bi-sliders me-2"></i>
            Behavior
          </h6>
          
          <!-- Animations Toggle -->
          <div class="setting-item">
            <div class="form-check form-switch">
              <input class="form-check-input" 
                     type="checkbox" 
                     id="animationsToggle"
                     [(ngModel)]="settings.animations"
                     (ngModelChange)="updateAnimations($event)">
              <label class="form-check-label" for="animationsToggle">
                Enable Animations
              </label>
            </div>
          </div>

          <!-- Notifications Toggle -->
          <div class="setting-item">
            <div class="form-check form-switch">
              <input class="form-check-input" 
                     type="checkbox" 
                     id="notificationsToggle"
                     [(ngModel)]="settings.notifications"
                     (ngModelChange)="updateNotifications($event)">
              <label class="form-check-label" for="notificationsToggle">
                Enable Notifications
              </label>
            </div>
          </div>

          <!-- Auto Save Toggle -->
          <div class="setting-item">
            <div class="form-check form-switch">
              <input class="form-check-input" 
                     type="checkbox" 
                     id="autoSaveToggle"
                     [(ngModel)]="settings.autoSave"
                     (ngModelChange)="updateAutoSave($event)">
              <label class="form-check-label" for="autoSaveToggle">
                Auto Save Changes
              </label>
            </div>
          </div>
        </div>

        <!-- Advanced Theme Section (only show if feature is enabled) -->
        <div class="settings-section" *ngIf="isAdvancedThemeFeatureEnabled">
          <h6 class="section-title">
            <i class="bi-palette-fill me-2"></i>
            Advanced Theme
          </h6>
          
          <!-- Advanced Theme Toggle -->
          <div class="setting-item">
            <div class="form-check form-switch">
              <input class="form-check-input" 
                     type="checkbox" 
                     id="advancedThemeToggle"
                     [checked]="isAdvancedThemeEnabled()"
                     (change)="toggleAdvancedTheme()">
              <label class="form-check-label" for="advancedThemeToggle">
                Enable Advanced Theme Customization
              </label>
            </div>
            <small class="form-text text-muted">
              Unlock advanced color customization, presets, and theme options
            </small>
          </div>

          <!-- Open Advanced Theme Panel Button -->
          <div class="setting-item" *ngIf="isAdvancedThemeEnabled()">
            <button class="btn btn-outline-primary btn-sm w-100" 
                    (click)="openAdvancedThemePanel()">
              <i class="bi-palette me-1"></i>
              Open Theme Customization
            </button>
          </div>
        </div>

        <!-- Language Section -->
        <div class="settings-section">
          <h6 class="section-title">
            <i class="bi-translate me-2"></i>
            Language & Region
          </h6>
          
          <div class="setting-item">
            <label class="setting-label">Language</label>
            <select class="form-select form-select-sm" 
                    [(ngModel)]="settings.language"
                    (ngModelChange)="updateLanguage($event)">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="pt">Português</option>
            </select>
          </div>
        </div>

        <!-- Actions Section -->
        <div class="settings-section">
          <h6 class="section-title">
            <i class="bi-tools me-2"></i>
            Actions
          </h6>
          
          <div class="setting-actions">
            <button class="btn btn-outline-secondary btn-sm" 
                    (click)="resetToDefaults()">
              <i class="bi-arrow-clockwise me-1"></i>
              Reset to Defaults
            </button>
            
            <button class="btn btn-outline-primary btn-sm" 
                    (click)="exportSettings()">
              <i class="bi-download me-1"></i>
              Export Settings
            </button>
            
            <button class="btn btn-outline-success btn-sm" 
                    (click)="importSettings()">
              <i class="bi-upload me-1"></i>
              Import Settings
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="settings-footer">
        <small class="text-muted">
          Settings are automatically saved
        </small>
      </div>
    </div>
  `,
  styleUrls: ['./settings-panel.component.scss']
})
export class SettingsPanelComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private appThemeService = inject(AppThemeService);
  private appThemePanelService = inject(AppThemePanelService);
  private layoutService = inject(LayoutService);

  isVisible = false;
  isDarkMode = false;

  settings: SettingsConfig = {
    theme: 'light',
    fontSize: 'medium',
    sidebarWidth: 'normal',
    animations: true,
    notifications: true,
    autoSave: true,
    language: 'en'
  };

  // Theme features availability
  get isAdvancedThemeFeatureEnabled(): boolean {
    return this.appThemeService.isAdvancedThemeEnabled();
  }

  ngOnInit(): void {
    this.loadSettings();
    this.subscribeToTheme();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToTheme(): void {
    this.appThemeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;
      });
  }



  private loadSettings(): void {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
    this.applySettings();
  }

  private saveSettings(): void {
    localStorage.setItem('app-settings', JSON.stringify(this.settings));
    this.applySettings();
  }

  private applySettings(): void {
    // Apply theme
    if (this.settings.theme === 'auto') {
      this.appThemeService.setAutoTheme();
    } else {
      this.appThemeService.setTheme(this.settings.theme === 'dark');
    }

    // Apply font size
    document.documentElement.setAttribute('data-font-size', this.settings.fontSize);

    // Apply animations
    document.documentElement.setAttribute('data-animations', this.settings.animations.toString());

    // Apply sidebar width
    document.documentElement.setAttribute('data-sidebar-width', this.settings.sidebarWidth);
  }

  // Public methods for opening/closing panel
  openPanel(): void {
    this.isVisible = true;
    document.body.classList.add('settings-panel-open');
  }

  closePanel(): void {
    this.isVisible = false;
    document.body.classList.remove('settings-panel-open');
  }

  // Setting update methods
  updateTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.settings.theme = theme;
    this.saveSettings();
  }

  updateFontSize(fontSize: 'small' | 'medium' | 'large'): void {
    this.settings.fontSize = fontSize;
    this.saveSettings();
  }

  updateSidebarWidth(width: 'compact' | 'normal' | 'wide'): void {
    this.settings.sidebarWidth = width;
    this.saveSettings();
  }

  updateAnimations(enabled: boolean): void {
    this.settings.animations = enabled;
    this.saveSettings();
  }

  updateNotifications(enabled: boolean): void {
    this.settings.notifications = enabled;
    this.saveSettings();
  }

  updateAutoSave(enabled: boolean): void {
    this.settings.autoSave = enabled;
    this.saveSettings();
  }

  updateLanguage(language: string): void {
    this.settings.language = language;
    this.saveSettings();
  }

  // Action methods
  resetToDefaults(): void {
    this.settings = {
      theme: 'light',
      fontSize: 'medium',
      sidebarWidth: 'normal',
      animations: true,
      notifications: true,
      autoSave: true,
      language: 'en'
    };
    this.saveSettings();
  }

  exportSettings(): void {
    const dataStr = JSON.stringify(this.settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'marketify-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  importSettings(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const importedSettings = JSON.parse(e.target.result);
            this.settings = { ...this.settings, ...importedSettings };
            this.saveSettings();
          } catch (error) {
            console.error('Error importing settings:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  toggleAdvancedTheme(): void {
    const newState = !this.isAdvancedThemeEnabled();
    this.appThemeService.enableAdvancedTheme(newState);
  }

  isAdvancedThemeEnabled(): boolean {
    return this.appThemeService.isAdvancedThemeEnabled();
  }

  openAdvancedThemePanel(): void {
    if (this.appThemeService.isAdvancedThemeEnabled()) {
      this.appThemePanelService.open();
      this.closePanel(); // Close settings panel when opening advanced theme panel
    } else {
      console.log('Advanced theme features require authentication');
    }
  }
}