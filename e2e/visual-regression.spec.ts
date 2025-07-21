import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('Homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('About Page', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveScreenshot('about-page.png');
  });
});
