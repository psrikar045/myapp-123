import { defineConfig, devices } from '@playwright/test';

/**
 * AI-Enhanced Playwright Configuration
 * Optimized for responsive testing and visual regression
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  
  /* Run tests in files in parallel for faster execution */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env['CI'],
  
  /* Retry on CI only */
  retries: process.env['CI'] ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env['CI'] ? 1 : undefined,
  
  /* Reporter configuration for automated documentation */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
    ['allure-playwright', { 
      detail: true, 
      outputFolder: 'allure-results',
      suiteTitle: false 
    }],
    ['list'] // Console output
  ],
  
  /* Shared settings for all projects */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:4200',
    
    /* Collect trace for debugging - enhanced documentation */
    trace: 'on-first-retry',
    
    /* Take screenshots only for failed tests to save storage */
    screenshot: 'only-on-failure', // Capture screenshots only when tests fail
    
    /* Record videos for ALL tests - success AND failure for team documentation */
    video: 'on', // Record all test executions for complete documentation
    
    /* Global timeout for each action */
    actionTimeout: 10000,
    
    /* Global timeout for navigation */
    navigationTimeout: 30000,
    
    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for comprehensive testing */
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    
    // Desktop browsers - Full HD resolution
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup'],
    },

    // Responsive breakpoints testing
    {
      name: 'tablet-landscape',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
        deviceScaleFactor: 1,
      },
      dependencies: ['setup'],
    },
    {
      name: 'tablet-portrait',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 1,
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-large',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 414, height: 896 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-medium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
      dependencies: ['setup'],
    },

    // Real mobile devices
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup'],
    },
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
      dependencies: ['setup'],
    },
  ],

  /* Global setup and teardown */
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['IC'],
    timeout: 120000,
  },

  /* Test timeout */
  timeout: 30000,
  
  /* Expect configuration for visual testing */
  expect: {
    /* Timeout for expect() assertions */
    timeout: 10000,
    
    /* Visual comparison settings */
    toHaveScreenshot: { 
      threshold: 0.2,
      animations: 'disabled',
      caret: 'hide'
    },
    toMatchSnapshot: { 
      threshold: 0.2
    }
  },
});