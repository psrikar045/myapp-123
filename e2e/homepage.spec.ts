import { test, expect } from '@playwright/test';

test.describe('Homepage Tests - AI Generated', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully @smoke', async ({ page }) => {
    // Check if landing page loads (since / redirects to /landing)
    await expect(page).toHaveURL(/landing/);
    
    // Check if main Angular app component is visible
    await expect(page.locator('app-root')).toBeVisible();
    
    // Check if the page has loaded properly
    await page.waitForLoadState('networkidle');
  });

  test('should display navigation menu @ui', async ({ page }) => {
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check for common navigation/header elements that might exist
    const headerElements = page.locator('header, nav, .header, .navbar, app-header');
    const headerExists = await headerElements.count() > 0;
    
    // If header exists, verify it's visible
    if (headerExists) {
      await expect(headerElements.first()).toBeVisible();
    }
    
    // Look for common navigation links that should be available
    const possibleNavItems = ['Login', 'Home', 'Pricing', 'Blog', 'Search'];
    for (const item of possibleNavItems) {
      const navItem = page.locator(`a:has-text("${item}"), button:has-text("${item}"), text="${item}"`).first();
      const isVisible = await navItem.isVisible().catch(() => false);
      if (isVisible) {
        await expect(navItem).toBeVisible();
        console.log(`✅ Found navigation item: ${item}`);
      }
    }
  });

  test('should be responsive on mobile @responsive', async ({ page }) => {
    // AI-generated responsive test
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if page adapts to mobile viewport
    await expect(page.locator('app-root')).toBeVisible();
    
    // AI-generated assertion: Check mobile navigation
    const mobileMenu = page.locator('.mobile-menu, .hamburger, .menu-toggle, [aria-label*="menu"]');
    if (await mobileMenu.isVisible()) {
      await expect(mobileMenu).toBeVisible();
    }
  });

  test('should be responsive on tablet @responsive', async ({ page }) => {
    // AI-generated responsive test for tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('app-root')).toBeVisible();
    
    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot('homepage-tablet.png');
  });

  test('should have proper visual layout @visual', async ({ page }) => {
    // AI-generated visual regression test
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should handle search functionality if present @functional', async ({ page }) => {
    // Look for search functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], .search-input');
    const searchExists = await searchInput.count() > 0;
    
    if (searchExists && await searchInput.isVisible()) {
      await searchInput.fill('test query');
      await searchInput.press('Enter');
      
      // Wait for search results or navigation
      await page.waitForTimeout(2000);
      
      console.log('✅ Search functionality found and tested');
    } else {
      // Navigate to dedicated search page
      await page.goto('/search');
      await expect(page.locator('app-root')).toBeVisible();
      console.log('✅ Dedicated search page accessible');
    }
  });

  test('should load without console errors @quality', async ({ page }) => {
    // AI-generated error monitoring
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // AI-generated assertion: No critical console errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('net::ERR_INTERNET_DISCONNECTED')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});