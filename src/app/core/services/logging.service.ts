import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment'; // Adjusted path

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  constructor() {
    // Constructor can be empty if no immediate DI needs.
  }

  private canLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const currentLogLevel = environment.logLevel;
    if (currentLogLevel === 'none') {
      return false;
    }
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(currentLogLevel);
  }

  debug(message: string, ...optionalParams: unknown[]): void {
    if (this.canLog('debug')) {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...optionalParams);
    }
  }

  info(message: string, ...optionalParams: unknown[]): void {
    if (this.canLog('info')) {
      console.info(`[INFO] ${new Date().toISOString()}: ${message}`, ...optionalParams);
    }
  }

  warn(message: string, ...optionalParams: unknown[]): void {
    if (this.canLog('warn')) {
      console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...optionalParams);
    }
  }

  error(message: string, ...optionalParams: unknown[]): void {
    if (this.canLog('error')) {
      console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, ...optionalParams);
      // Potentially send to a remote logging server here
      // e.g., this.remoteLoggingService.logError({ message, optionalParams, timestamp: new Date() });
    }
  }
}
