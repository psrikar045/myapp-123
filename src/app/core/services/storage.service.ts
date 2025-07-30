import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private platformId = inject(PLATFORM_ID);

  private isLocalStorageAvailable(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private isSessionStorageAvailable(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  setItem(key: string, value: any): void {
    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }

  getItem<T>(key: string): T | null {
    if (this.isLocalStorageAvailable()) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
      }
    }
    return null;
  }

  removeItem(key: string): void {
    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    }
  }

  clear(): void {
    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  }

  // Session Storage methods
  setSessionItem(key: string, value: any): void {
    if (this.isSessionStorageAvailable()) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Error saving to sessionStorage:', error);
      }
    }
  }

  getSessionItem<T>(key: string): T | null {
    if (this.isSessionStorageAvailable()) {
      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Error reading from sessionStorage:', error);
        return null;
      }
    }
    return null;
  }

  removeSessionItem(key: string): void {
    if (this.isSessionStorageAvailable()) {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from sessionStorage:', error);
      }
    }
  }
}