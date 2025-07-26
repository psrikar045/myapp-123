import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AppThemeService, AppThemeConfig, ThemePreset } from '../../../core/services/app-theme.service';
import { AppThemePanelService } from '../../services/app-theme-panel.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-theme-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="theme-panel-overlay" (click)="closePanel()"></div>
    <div class="theme-panel">
      <div class="theme-panel-header">
        <h5 class="mb-0">
          <i class="bi bi-palette me-2"></i>
          Theme Settings
          <span *ngIf="canAccessAdvanced" class="badge bg-primary ms-2">
            <i class="bi bi-star-fill me-1"></i>Premium
          </span>
        </h5>
        <button type="button" class="btn-close" (click)="closePanel()"></button>
      </div>

      <div class="theme-panel-body">
        <!-- Basic Theme Controls (Always Available) -->
        <div class="theme-section">
          <h6 class="theme-section-title">
            <i class="bi bi-brightness-high me-2"></i>
            Appearance
          </h6>
          
          <!-- Light/Dark Mode Toggle -->
          <div class="theme-control">
            <label class="theme-label">Theme Mode</label>
            <div class="btn-group w-100" role="group">
              <input type="radio" class="btn-check" id="mode-light" 
                     [value]="'light'" [(ngModel)]="currentConfig.mode" 
                     (change)="updateTheme()">
              <label class="btn btn-outline-primary" for="mode-light">
                <i class="bi bi-sun me-1"></i>Light
              </label>
              
              <input type="radio" class="btn-check" id="mode-dark" 
                     [value]="'dark'" [(ngModel)]="currentConfig.mode" 
                     (change)="updateTheme()">
              <label class="btn btn-outline-primary" for="mode-dark">
                <i class="bi bi-moon me-1"></i>Dark
              </label>
              
              <input type="radio" class="btn-check" id="mode-auto" 
                     [value]="'auto'" [(ngModel)]="currentConfig.mode" 
                     (change)="updateTheme()">
              <label class="btn btn-outline-primary" for="mode-auto">
                <i class="bi bi-circle-half me-1"></i>Auto
              </label>
            </div>
          </div>

          <!-- Theme Presets -->
          <div class="theme-control">
            <label class="theme-label">Quick Presets</label>
            <div class="preset-grid">
              <button *ngFor="let preset of availablePresets" 
                      class="preset-btn"
                      [class.active]="currentConfig.preset === preset.id"
                      [class.premium]="preset.isPremium"
                      (click)="applyPreset(preset.id)"
                      [title]="preset.description">
                <span class="preset-name">{{ preset.name }}</span>
                <i *ngIf="preset.isPremium" class="bi bi-star-fill preset-star"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Advanced Theme Controls (After Login) -->
        <div *ngIf="canAccessAdvanced" class="theme-section">
          <h6 class="theme-section-title">
            <i class="bi bi-gear me-2"></i>
            Advanced Customization
            <span class="badge bg-success ms-2">Premium</span>
          </h6>

          <!-- Colors -->
          <div class="theme-control">
            <label class="theme-label">Primary Color</label>
            <input type="color" class="form-control form-control-color" 
                   [(ngModel)]="currentConfig.primaryColor" 
                   (change)="updateTheme()">
          </div>

          <div class="theme-control">
            <label class="theme-label">Accent Color</label>
            <input type="color" class="form-control form-control-color" 
                   [(ngModel)]="currentConfig.accentColor" 
                   (change)="updateTheme()">
          </div>

          <!-- Typography -->
          <div class="theme-control">
            <label class="theme-label">Font Size</label>
            <select class="form-select" [(ngModel)]="currentConfig.fontSize" (change)="updateTheme()">
              <option value="small">Small (14px)</option>
              <option value="medium">Medium (16px)</option>
              <option value="large">Large (18px)</option>
              <option value="extra-large">Extra Large (20px)</option>
            </select>
          </div>

          <div class="theme-control">
            <label class="theme-label">Font Family</label>
            <select class="form-select" [(ngModel)]="currentConfig.fontFamily" (change)="updateTheme()">
              <option value="default">Default (Sans-serif)</option>
              <option value="serif">Serif</option>
              <option value="mono">Monospace</option>
            </select>
          </div>

          <div class="theme-control">
            <label class="theme-label">Font Weight</label>
            <select class="form-select" [(ngModel)]="currentConfig.fontWeight" (change)="updateTheme()">
              <option value="light">Light (300)</option>
              <option value="normal">Normal (400)</option>
              <option value="medium">Medium (500)</option>
              <option value="bold">Bold (600)</option>
            </select>
          </div>

          <!-- Layout -->
          <div class="theme-control">
            <label class="theme-label">Border Radius</label>
            <select class="form-select" [(ngModel)]="currentConfig.borderRadius" (change)="updateTheme()">
              <option value="none">None</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="full">Full</option>
            </select>
          </div>

          <div class="theme-control">
            <label class="theme-label">Spacing</label>
            <select class="form-select" [(ngModel)]="currentConfig.spacing" (change)="updateTheme()">
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="comfortable">Comfortable</option>
            </select>
          </div>

          <!-- Effects -->
          <div class="theme-control">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="animations"
                     [(ngModel)]="currentConfig.animations" (change)="updateTheme()">
              <label class="form-check-label" for="animations">
                Enable Animations
              </label>
            </div>
          </div>

          <div class="theme-control">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="shadows"
                     [(ngModel)]="currentConfig.shadows" (change)="updateTheme()">
              <label class="form-check-label" for="shadows">
                Enable Shadows
              </label>
            </div>
          </div>

          <div class="theme-control">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="blur"
                     [(ngModel)]="currentConfig.blur" (change)="updateTheme()">
              <label class="form-check-label" for="blur">
                Enable Blur Effects
              </label>
            </div>
          </div>

          <!-- Accessibility -->
          <div class="theme-control">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="highContrast"
                     [(ngModel)]="currentConfig.highContrast" (change)="updateTheme()">
              <label class="form-check-label" for="highContrast">
                High Contrast Mode
              </label>
            </div>
          </div>

          <div class="theme-control">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="reducedMotion"
                     [(ngModel)]="currentConfig.reducedMotion" (change)="updateTheme()">
              <label class="form-check-label" for="reducedMotion">
                Reduce Motion
              </label>
            </div>
          </div>
        </div>

        <!-- Upgrade Prompt (Before Login) -->
        <div *ngIf="!canAccessAdvanced" class="theme-section upgrade-section">
          <div class="upgrade-card">
            <div class="upgrade-icon">
              <i class="bi bi-star-fill"></i>
            </div>
            <h6>Unlock Premium Themes</h6>
            <p class="text-muted mb-3">
              Get access to advanced customization, premium presets, and more!
            </p>
            <button class="btn btn-primary btn-sm w-100" (click)="promptLogin()">
              <i class="bi bi-box-arrow-in-right me-1"></i>
              Sign In to Unlock
            </button>
          </div>
        </div>
      </div>

      <div class="theme-panel-footer">
        <button class="btn btn-outline-secondary btn-sm" (click)="resetToDefaults()">
          <i class="bi bi-arrow-clockwise me-1"></i>
          Reset to Defaults
        </button>
        <button class="btn btn-primary btn-sm" (click)="closePanel()">
          <i class="bi bi-check-lg me-1"></i>
          Done
        </button>
      </div>
    </div>
  `,
  styles: [`
    .theme-panel-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1050;
      backdrop-filter: blur(4px);
    }

    .theme-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      background: var(--bs-body-bg);
      border-left: 1px solid var(--bs-border-color);
      z-index: 1051;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
      animation: slideInRight 0.3s ease-out;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    .theme-panel-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--bs-border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bs-body-bg);
    }

    .theme-panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }

    .theme-panel-footer {
      padding: 1.5rem;
      border-top: 1px solid var(--bs-border-color);
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      background: var(--bs-body-bg);
    }

    .theme-section {
      margin-bottom: 2rem;
    }

    .theme-section-title {
      color: var(--bs-primary);
      margin-bottom: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
    }

    .theme-control {
      margin-bottom: 1rem;
    }

    .theme-label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: var(--bs-body-color);
    }

    .preset-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .preset-btn {
      padding: 0.75rem;
      border: 2px solid var(--bs-border-color);
      border-radius: var(--bs-border-radius);
      background: var(--bs-body-bg);
      color: var(--bs-body-color);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      text-align: left;
      
      &:hover {
        border-color: var(--bs-primary);
        background: var(--bs-secondary-bg);
      }
      
      &.active {
        border-color: var(--bs-primary);
        background: var(--bs-primary);
        color: white;
      }
      
      &.premium {
        border-style: dashed;
      }
    }

    .preset-name {
      display: block;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .preset-star {
      position: absolute;
      top: 0.25rem;
      right: 0.25rem;
      color: #fbbf24;
      font-size: 0.75rem;
    }

    .upgrade-section {
      text-align: center;
    }

    .upgrade-card {
      padding: 2rem 1.5rem;
      border: 2px dashed var(--bs-border-color);
      border-radius: var(--theme-border-radius);
      background: var(--theme-background);
    }

    .upgrade-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-accent));
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      color: white;
      font-size: 1.25rem;
    }

    .form-control-color {
      width: 100%;
      height: 40px;
      border-radius: var(--theme-border-radius);
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .theme-panel {
        width: 100%;
        right: 0;
      }
      
      .preset-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Dark Mode */
    [data-bs-theme="dark"] {
      .theme-panel {
        background: var(--theme-surface);
        border-left-color: #30363d;
      }
      
      .theme-panel-header,
      .theme-panel-footer {
        background: var(--theme-background);
        border-color: #30363d;
      }
      
      .preset-btn {
        border-color: #30363d;
        background: var(--theme-background);
        
        &:hover {
          border-color: var(--theme-primary);
        }
      }
      
      .upgrade-card {
        border-color: #30363d;
        background: var(--theme-surface);
      }
    }
  `]
})
export class AppThemePanelComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private themeService = inject(AppThemeService);
  private themePanelService = inject(AppThemePanelService);
  private router = inject(Router);

  currentConfig: AppThemeConfig = this.themeService.getCurrentConfig();
  availablePresets: ThemePreset[] = [];
  canAccessAdvanced = false;

  ngOnInit(): void {
    // Subscribe to theme config changes
    this.themeService.themeConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.currentConfig = { ...config };
      });

    // Subscribe to available presets
    this.themeService.availablePresets$
      .pipe(takeUntil(this.destroy$))
      .subscribe(presets => {
        this.availablePresets = presets;
      });

    // Subscribe to authentication status
    this.themeService.canAccessAdvancedFeatures$
      .pipe(takeUntil(this.destroy$))
      .subscribe(canAccess => {
        this.canAccessAdvanced = canAccess;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateTheme(): void {
    this.themeService.updateConfig(this.currentConfig);
  }

  applyPreset(presetId: string): void {
    this.themeService.applyPreset(presetId);
  }

  resetToDefaults(): void {
    this.themeService.resetToDefaults();
  }

  promptLogin(): void {
    this.themePanelService.close();
    this.router.navigate(['/auth/login']);
  }

  closePanel(): void {
    this.themePanelService.close();
  }
}