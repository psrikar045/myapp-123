import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { LoggingService } from '../services/logging.service';
import { SpinnerService } from '../services/spinner.service';
// Import HttpErrorResponse if you plan to specifically handle HTTP errors
// import { HttpErrorResponse } from '@angular/common/http';

@Injectable() // Needs to be injectable if it has dependencies
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {
    // Using Injector to lazily load services if needed, or to avoid circular dependencies.
    // Alternatively, inject services directly if no such issues are anticipated:
    // constructor(private loggingService: LoggingService, private spinnerService: SpinnerService) {}
  }

  handleError(error: any): void {
    try {
      // Lazily inject services here with error handling
      const loggingService = this.injector.get(LoggingService);
      const spinnerService = this.injector.get(SpinnerService);

      // Ensure spinner is turned off in case of an error
      spinnerService.hide(); // Assuming SpinnerService has hide() and a loading$ subject

      // Log the error
      const message = error.message ? error.message : error.toString();
      // You could add more details, like stack trace
      loggingService.error(`GlobalErrorHandler caught: ${message}`, error.stack);
    } catch (injectorError) {
      // Injector has been destroyed, fall back to console logging
      console.debug('GlobalErrorHandler: Injector destroyed, using fallback logging');
      const message = error.message ? error.message : error.toString();
      console.error(`GlobalErrorHandler caught: ${message}`, error.stack);
    }

    // Further error handling logic can go here:
    // - Check if it's an HttpErrorResponse
    // - Send error to a remote logging server
    // - Show a user-friendly error message (e.g., via a toast notification service)

    // For now, just re-throw or log to console for development visibility
    console.error('GlobalErrorHandler:', error);
    // For production, you might not want to re-throw or log raw errors to console.
  }
}
