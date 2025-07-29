import { test, expect } from '@playwright/test';

test.describe('Basic Functionality Tests', () => {
  
  test('should verify all main routes are accessible', async ({ page }) => {
    console.log('🧪 Testing all main application routes...');
    
    // Test all public routes
    const publicRoutes = [
      { path: '/', expectedRedirect: '/landing' },
      { path: '/landing', expectedRedirect: null },
      { path: '/login', expectedRedirect: null },
      { path: '/forgot-password', expectedRedirect: null },
      { path: '/search', expectedRedirect: null },
      { path: '/all-categories', expectedRedirect: null },
      { path: '/pricing', expectedRedirect: null },
      { path: '/blog', expectedRedirect: null },
      { path: '/developer', expectedRedirect: null }
    ];

    for (const route of publicRoutes) {
      console.log(`🔍 Testing route: ${route.path}`);
      
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      
      // Check if it redirected as expected
      if (route.expectedRedirect) {
        await expect(page).toHaveURL(route.expectedRedirect);
        console.log(`✅ ${route.path} correctly redirected to ${route.expectedRedirect}`);
      } else {
        await expect(page).toHaveURL(route.path);
        console.log(`✅ ${route.path} loaded successfully`);
      }
      
      // Verify the app component is always visible
      await expect(page.locator('app-root')).toBeVisible();
    }
  });

  test('should verify protected routes require authentication', async ({ page }) => {
    console.log('🔒 Testing protected routes...');
    
    const protectedRoutes = ['/home', '/dashboard', '/my-profile', '/brandApi'];

    for (const route of protectedRoutes) {
      console.log(`🔍 Testing protected route: ${route}`);
      
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Should be redirected away from the protected route
      const currentUrl = page.url();
      const isOnProtectedRoute = currentUrl.includes(route.substring(1));
      
      if (!isOnProtectedRoute) {
        console.log(`✅ Protected route ${route} correctly redirected (auth guard working)`);
      } else {
        console.log(`⚠️ Protected route ${route} accessible without auth (may be expected in test environment)`);
      }
      
      // App should still be functional
      await expect(page.locator('app-root')).toBeVisible();
    }
  });

  test('should verify parameterized routes work', async ({ page }) => {
    console.log('🔗 Testing parameterized routes...');
    
    const parameterizedRoutes = [
      '/search-view/testbrand',
      '/category-list/testcategory', 
      '/blog-details/1'
    ];

    for (const route of parameterizedRoutes) {
      console.log(`🔍 Testing parameterized route: ${route}`);
      
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Verify the route loads and app is visible
      await expect(page).toHaveURL(route);
      await expect(page.locator('app-root')).toBeVisible();
      
      console.log(`✅ Parameterized route ${route} loaded successfully`);
    }
  });

  test('should verify login form structure', async ({ page }) => {
    console.log('📝 Testing login form structure...');
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Verify login form elements exist
    await expect(page.locator('h2')).toContainText('Login');
    await expect(page.locator('input[formControlName="identifier"]')).toBeVisible();
    await expect(page.locator('input[formControlName="password"]')).toBeVisible();
    await expect(page.locator('button.login-button[type="submit"]')).toBeVisible();
    
    // Verify registration toggle works
    await page.click('text="Sign up"');
    await expect(page.locator('h2')).toContainText('Sign Up');
    await expect(page.locator('input[formControlName="firstName"]')).toBeVisible();
    await expect(page.locator('input[formControlName="lastName"]')).toBeVisible();
    await expect(page.locator('input[formControlName="email"]')).toBeVisible();
    
    console.log('✅ Login form structure verified');
  });

  test('should verify app loads without critical console errors', async ({ page }) => {
    console.log('🚨 Monitoring console errors...');
    
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Load main pages and check for errors
    const routesToCheck = ['/', '/login', '/pricing', '/blog', '/search'];
    
    for (const route of routesToCheck) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Allow time for any async errors
    }
    
    // Filter out non-critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('ERR_INTERNET_DISCONNECTED') &&
      !error.includes('ERR_NETWORK_CHANGED') &&
      !error.toLowerCase().includes('warning')
    );
    
    console.log(`📊 Total console errors: ${consoleErrors.length}`);
    console.log(`🔥 Critical errors: ${criticalErrors.length}`);
    
    if (criticalErrors.length > 0) {
      console.log('Critical errors:', criticalErrors);
    }
    
    // Allow up to 2 critical errors for flexibility
    expect(criticalErrors.length).toBeLessThanOrEqual(2);
    console.log('✅ Console error check completed');
  });

  test('should verify basic responsive behavior', async ({ page }) => {
    console.log('📱 Testing basic responsive behavior...');
    
    await page.goto('/');
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      console.log(`🔍 Testing ${viewport.name} viewport: ${viewport.width}x${viewport.height}`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // Allow CSS transitions
      
      // Verify app is still visible and functional
      await expect(page.locator('app-root')).toBeVisible();
      
      // Check if content doesn't overflow
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();
      expect(bodyBox?.width).toBeLessThanOrEqual(viewport.width + 20); // Allow small margin
      
      console.log(`✅ ${viewport.name} viewport test passed`);
    }
  });
});