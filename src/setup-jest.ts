import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import '@angular/localize/init';

setupZoneTestEnv();

// Global test setup for AI-enhanced testing
Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance']
    };
  }
});

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});

Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true
    };
  }
});

// Mock IntersectionObserver for responsive testing
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
} as any;

// Mock ResizeObserver for responsive testing
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia for responsive breakpoint testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage and sessionStorage
const createStorageMock = (): Storage => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
});

global.localStorage = createStorageMock();
global.sessionStorage = createStorageMock();

// Custom matchers for AI-enhanced assertions
expect.extend({
  toBeVisible(received) {
    const pass = received && received.style.display !== 'none' && received.style.visibility !== 'hidden';
    return {
      message: () => `expected element to ${pass ? 'not ' : ''}be visible`,
      pass,
    };
  },
  toHaveClass(received, className) {
    const pass = received && received.classList && received.classList.contains(className);
    return {
      message: () => `expected element to ${pass ? 'not ' : ''}have class "${className}"`,
      pass,
    };
  },
  toBeResponsive(received) {
    // Custom matcher for responsive testing
    const pass = received && received.offsetWidth > 0 && received.offsetHeight > 0;
    return {
      message: () => `expected element to ${pass ? 'not ' : ''}be responsive`,
      pass,
    };
  }
});

// Declare custom matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeVisible(): R;
      toHaveClass(className: string): R;
      toBeResponsive(): R;
    }
  }
}