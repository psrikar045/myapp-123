import { test, expect } from '@playwright/test';

test.describe('Visual Regression Testing', () => {
  test('Homepage should match the snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot();
  });
});
