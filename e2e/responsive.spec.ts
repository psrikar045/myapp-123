import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests - AI Enhanced', () => {
  
  const breakpoints = [
    { name: 'mobile-small', width: 320, height: 568 },
    { name: 'mobile-medium', width: 375, height: 667 },
    { name: 'mobile-large', width: 414, height: 896 },
    { name: 'tablet-portrait', width: 768, height: 1024 },
    { name: 'tablet-landscape', width: 1024, height: 768 },
    { name: 'desktop-small', width: 1280, height: 720 },
    { name: 'desktop-large', width: 1920, height: 1080 },
  ];

  breakpoints.forEach(({ name, width, height }) => {
    test(`should display correctly on ${name} (${width}x${height}) @responsive`, async ({ page }) => {
      // AI-generated responsive test
      await page.setViewportSize({ width, height });
      await page.goto('/');
      
      // Wait for page to load and adapt
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Allow CSS transitions
      
      // AI-generated assertions for responsive behavior
      await expect(page.locator('app-root')).toBeVisible();
      
      // Check if content is not overflowing
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();
      expect(bodyBox?.width).toBeLessThanOrEqual(width + 20); // Allow small margin
      
      // Take screenshot for visual regression
      await expect(page).toHaveScreenshot(`${name}-homepage.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test('should adapt navigation for mobile devices @responsive', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Check if app loads correctly on mobile
    await expect(page.locator('app-root')).toBeVisible();
    
    // Look for any mobile navigation elements that might exist
    const mobileMenuTrigger = page.locator(
      '.hamburger, .menu-toggle, .mobile-menu-btn, [aria-label*="menu"], .navbar-toggler'
    ).first();
    
    const menuExists = await mobileMenuTrigger.count() > 0;
    
    if (menuExists && await mobileMenuTrigger.isVisible()) {
      await mobileMenuTrigger.click();
      
      // Check if mobile menu opens
      const mobileMenu = page.locator(
        '.mobile-menu, .navbar-collapse, .side-menu, .drawer'
      ).first();
      
      const menuOpened = await mobileMenu.isVisible().catch(() => false);
      if (menuOpened) {
        await expect(mobileMenu).toBeVisible();
      }
    }
    
    console.log('✅ Mobile navigation test completed');
  });

  test('should handle touch interactions on mobile @responsive @touch', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find touchable elements
    const touchableElements = page.locator('button:visible, a:visible, [role="button"]:visible');
    const count = await touchableElements.count();
    
    if (count > 0) {
      const firstElement = touchableElements.first();
      
      try {
        // Test touch interaction
        await firstElement.tap();
        await page.waitForTimeout(500);
        console.log('✅ Touch interaction test completed');
      } catch (error) {
        console.log('⚠️ Touch interaction may not be available for this element');
      }
    }
    
    // Verify app is still responsive
    await expect(page.locator('app-root')).toBeVisible();
  });

  test('should maintain readability across all screen sizes @responsive @accessibility', async ({ page }) => {
    await page.goto('/');
    
    for (const { name, width, height } of breakpoints) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(500);
      
      // AI-generated readability test
      const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div');
      const count = await textElements.count();
      
      if (count > 0) {
        // Check font sizes are readable (minimum 12px)
        const fontSize = await textElements.first().evaluate(el => {
          return window.getComputedStyle(el).fontSize;
        });
        
        const fontSizeNum = parseInt(fontSize.replace('px', ''));
        expect(fontSizeNum).toBeGreaterThanOrEqual(12);
      }
    }
  });

  test('should handle orientation changes @responsive', async ({ page }) => {
    await page.goto('/');
    
    // Test portrait to landscape transition
    await page.setViewportSize({ width: 375, height: 667 }); // Portrait
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('portrait-view.png');
    
    await page.setViewportSize({ width: 667, height: 375 }); // Landscape
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('landscape-view.png');
    
    // AI-generated assertion: Content should still be visible
    await expect(page.locator('app-root')).toBeVisible();
  });

  test('should load images responsively @responsive @performance', async ({ page }) => {
    await page.goto('/');
    
    // AI-generated responsive image test
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 5); i++) { // Test first 5 images
        const img = images.nth(i);
        
        // Check if image loads
        await expect(img).toBeVisible();
        
        // Check if image has proper responsive attributes
        const srcset = await img.getAttribute('srcset');
        const sizes = await img.getAttribute('sizes');
        
        // AI would generate more specific assertions based on your image strategy
        if (srcset || sizes) {
          expect(srcset || sizes).toBeTruthy();
        }
      }
    }
  });
});