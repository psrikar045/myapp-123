# Application Architecture (myapp-123)

This document outlines the architecture of the `myapp-123` Angular application.

## 1. Overview

`myapp-123` is built using Angular 18, leveraging modern Angular features such as standalone components (where appropriate), functional interceptors, and a modular design. It incorporates Server-Side Rendering (SSR) with Angular Universal and Progressive Web App (PWA) capabilities.

## 2. Core Principles

*   **Modularity**: Code is organized into `CoreModule`, `SharedModule`, and distinct `FeatureModules` to ensure separation of concerns and maintainability.
*   **Lazy Loading**: Feature modules are lazy-loaded to improve initial application load time.
*   **Reusability**: Common components, directives, and pipes are placed in `SharedModule` to be reused across the application.
*   **Single Responsibility**: Services and components are designed to have a single, well-defined responsibility.
*   **Testability**: Code is structured to be easily unit-testable.
*   **Scalability**: The architecture is designed to accommodate future growth and complexity.

## 3. Module Structure

### 3.1. AppModule (`app.config.ts` based)
The application is bootstrapped using a standalone `AppComponent` and configured via `app.config.ts`. This file handles:
*   Router configuration (`provideRouter`)
*   HttpClient configuration (`provideHttpClient` with interceptors)
*   Global Error Handling
*   PWA Service Worker registration
*   Browser Animations
*   Core application-wide providers (Guards, etc.)

### 3.2. CoreModule (`src/app/core`)
*   **Purpose**: Contains services, components, and modules that are intended to be singletons and used application-wide. Only imported once in the root configuration (`app.config.ts` or `app.module.ts` if it existed).
*   **Contents**:
    *   **Services**: `AuthService`, `ApiService`, `LoggingService`, `SpinnerService`. These are typically provided in 'root'.
    *   **Guards**: `AuthGuard`, `RoleGuard`.
    *   **Interceptors**: `AuthInterceptor` (functional, provided globally).
    *   **Handlers**: `GlobalErrorHandler`.
    *   **Components**: `SpinnerComponent` (exported for use in `AppComponent`).
    *   **Models**: Core data models used across the application (if any, e.g., `User`).

### 3.3. SharedModule (`src/app/shared`)
*   **Purpose**: Contains commonly used components, directives, and pipes that are shared across different feature modules. Imported by feature modules that need them.
*   **Contents**:
    *   **Components**: Reusable UI elements (e.g., custom buttons, modals, info cards).
    *   **Directives**: `AutoFocusDirective`, `PermissionCheckDirective`.
    *   **Pipes**: Custom data transformation pipes (e.g., `truncate`, `filter`).
    *   **Models**: Shared data models relevant to UI components or utilities.
    *   **Services**: `UtilService` (if it provides general, non-singleton utilities needed by shared components).
    *   **Angular Material Modules**: Exports commonly used Material modules if not using standalone components extensively.

### 3.4. Feature Modules (`src/app/features/*`)
*   **Purpose**: Encapsulate specific business functionalities or application features (e.g., Dashboard, Admin, User Profile, Authentication).
*   **Structure**: Each feature module is self-contained and typically includes:
    *   Its own routing module (`*-routing.module.ts`).
    *   Components specific to the feature.
    *   Services specific to the feature (if any).
    *   Models specific to the feature.
*   **Lazy Loading**: Feature modules are lazy-loaded via the main application router (`app.routes.ts`) to improve performance.
*   **Examples**:
    *   `features/dashboard/dashboard.module.ts`
    *   `features/admin/admin.module.ts`
    *   `features/auth/auth.module.ts` (for login, registration pages etc.)

## 4. State Management (Placeholder)

*   Currently, component-level state and RxJS BehaviorSubjects in services (e.g., `AuthService.loggedIn$`, `SpinnerService.loading$`) are used for simple state management.
*   For more complex state, a dedicated state management library like NgRx, Elf, or Signals could be considered.

## 5. Styling

*   Global styles are defined in `src/styles.css`.
*   Component-specific styles are encapsulated within their respective component's CSS files.
*   Angular Material theming is used for UI components.

## 6. Server-Side Rendering (SSR) - Angular Universal

*   **Entry Point**: `server.ts`
*   **App Server Config**: `app.config.server.ts`
*   **Guidelines**:
    *   Avoid direct manipulation of `window` or `document`. Use `PLATFORM_ID` and `isPlatformBrowser`/`isPlatformServer`.
    *   Ensure third-party libraries are SSR-compatible.
    *   Utilize `TransferState` for data fetched on the server to prevent re-fetching on the client.

## 7. Progressive Web App (PWA)

*   **Manifest**: `public/manifest.webmanifest` (or `src/manifest.webmanifest`)
*   **Service Worker**: `ngsw-config.json` defines caching strategies. `SwUpdate` for handling updates.
*   **Offline Capabilities**: Core assets and potentially API calls are cached for offline use.

## 8. Naming Conventions (Examples)

*   **Components**: `feature-name.component.ts` (e.g., `user-profile.component.ts`)
*   **Services**: `service-name.service.ts` (e.g., `user.service.ts`)
*   **Modules**: `module-name.module.ts` (e.g., `user.module.ts`)
*   **Guards**: `guard-name.guard.ts` (e.g., `auth.guard.ts`)
*   **Directives**: `directive-name.directive.ts` (e.g., `auto-focus.directive.ts`)
*   **File Suffixes**: `.component.ts`, `.service.ts`, `.module.ts`, `.guard.ts`, `.directive.ts`, `.pipe.ts`, `.interceptor.ts`, `.routes.ts`, `.config.ts`, `.spec.ts`.

## 9. Future Considerations

*   Internationalization (i18n)
*   Advanced state management solution (if needed)
*   End-to-end testing framework

This document provides a high-level overview and is subject to updates as the project evolves.
