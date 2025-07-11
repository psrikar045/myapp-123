import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
// Class-based guard imports are no longer needed if guards are functional
// import { AuthGuard } from './core/guards/auth.guard';
// import { RoleGuard } from './core/guards/role.guard';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from './core/handlers/global-error-handler';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http'; // Import withFetch
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()), // Added withFetch()
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideAnimationsAsync(),
    // AuthGuard, // Removed class-based guard from providers
    // RoleGuard, // Removed class-based guard from providers (if it's also functional now)
    // If RoleGuard is still class-based and needed as a service elsewhere, it might stay.
    // However, for CanActivate, functional guards don't need to be in providers.
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
