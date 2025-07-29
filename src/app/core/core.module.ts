import { NgModule, Optional, SkipSelf, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';

// Core Services
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';
import { SpinnerService } from './services/spinner.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { ThemeService } from './services/theme.service';
import { LoggingService } from './services/logging.service';
import { LayoutService } from './services/layout.service';
import { ValidationService } from './services/validation.service';

// Core Components
import { GlobalSpinnerComponent } from './components/global-spinner/global-spinner.component';
import { ErrorBoundaryComponent } from './components/error-boundary/error-boundary.component';

// Guards (Note: Functional guards don't need to be provided in modules)
// They are used directly in routing configurations

// Interceptors are provided in app.config.ts for the standalone architecture

// Handlers
import { GlobalErrorHandler } from './handlers/global-error-handler';

@NgModule({
  declarations: [
    // Only declare non-standalone components here
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    
    // Import standalone components
    GlobalSpinnerComponent,
    ErrorBoundaryComponent
  ],
  exports: [
    // Export standalone components for use in other modules
    GlobalSpinnerComponent,
    ErrorBoundaryComponent
  ],
  providers: [
    // Core Services (Singleton)
    ApiService,
    AuthService,
    StorageService,
    SpinnerService,
    ErrorHandlerService,
    ThemeService,
    LoggingService,
    LayoutService,
    ValidationService,
    
    // Note: Functional guards are not provided here
    // They are used directly in route configurations
    
    // Global Error Handler
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    
    // HTTP Interceptors are provided in app.config.ts for standalone components
    // For module-based components, they would be provided here, but we're using standalone architecture
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}
