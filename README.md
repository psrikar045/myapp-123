# myapp-123 (Angular 18 Application)

This project is an Angular 18 application, `myapp-123`, bootstrapped with Angular CLI. It features Server-Side Rendering (SSR) with Angular Universal and Progressive Web App (PWA) capabilities.

## Core Technologies

*   **Framework**: Angular 18
*   **UI Components**: Angular Material
*   **Styling**: CSS
*   **SSR**: Angular Universal
*   **PWA**: Angular Service Worker

## Project Structure Highlights

*   `src/app/core/`: Core modules, services (Auth, Api, Logging, Spinner), guards, interceptors, and global error handling.
*   `src/app/shared/`: Shared modules, components, directives (AutoFocus, PermissionCheck), pipes, and utility services.
*   `src/app/features/`: Feature modules (Dashboard, Admin, Auth) with lazy loading.
*   `src/environments/`: Environment configuration files.

## Key Features Implemented (Initial Setup)

*   **Modular Architecture**: Separation of concerns with Core, Shared, and Feature modules.
*   **Server-Side Rendering (SSR)**: Enabled via `@angular/ssr`.
*   **Progressive Web App (PWA)**: Basic PWA setup with manifest and service worker.
*   **Routing**: Lazy loading for feature modules, with route guards (`AuthGuard`, `RoleGuard`).
*   **JWT Authentication**:
    *   `AuthService` for token handling (localStorage, SSR-aware).
    *   `AuthInterceptor` (functional) to attach JWT tokens to HTTP requests.
*   **Global Spinner**: `SpinnerService` and `SpinnerComponent` for visual feedback during async operations.
*   **Global Error Handling**: `GlobalErrorHandler` to catch and process unhandled errors.
*   **Linting & Formatting**: ESLint and Prettier configured for code consistency.
*   **Responsive Design**: Angular Material integration for UI components and responsive layouts.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

To run the SSR development server:
```bash
npm run serve:ssr:myapp-123
# or
ng serve --ssr
```
Navigate to `http://localhost:4200` (or the port specified by SSR server, often the same or 4000).

## Build

Run `ng build` to build the client-side application.
Run `ng build --configuration production` for a production client build.

To build for SSR:
```bash
ng build && ng run myapp-123:server # Development SSR build
ng build --configuration production && ng run myapp-123:server:production # Production SSR build
```
The build artifacts will be stored in the `dist/myapp-123/browser` and `dist/myapp-123/server` directories.

## Running unit tests

Run `ng test` to execute the unit tests via Karma.
Run `ng test --code-coverage` to get a code coverage report.

## Linting and Formatting

To lint the code:
```bash
npx eslint .
```
To automatically fix lint issues:
```bash
npx eslint --fix .
```
To format code with Prettier:
```bash
npx prettier --write .
```
To check formatting:
```bash
npx prettier --check .
```

## PWA Notes

*   The `manifest.webmanifest` file in `src/assets/` (or `public/`) defines the PWA's appearance and behavior.
*   `ngsw-config.json` configures the Angular service worker for caching strategies.
*   Test PWA features using Lighthouse in Chrome DevTools.
*   Ensure `SwUpdate` from `@angular/service-worker` is used to handle app updates.

## Angular Universal (SSR) Coding Guidelines

*   **Platform Awareness**: Use `isPlatformBrowser()` or `isPlatformServer()` from `@angular/common` when interacting with browser-specific (e.g., `window`, `document`, `localStorage`) or server-specific APIs.
*   **Avoid Browser Globals Directly**: Wrap access to `window`, `document`, etc.
*   **HTTP Requests**: Ensure HTTP requests made on the server complete. Use `TransferState` to pass data fetched on the server to the client to avoid re-fetching.
*   **Third-party Libraries**: Verify that third-party libraries are SSR-compatible.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
