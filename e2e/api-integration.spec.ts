import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('should display data from the API', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/data', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ message: 'Hello from the API!' }),
      });
    });

    await page.goto('/data');
    await expect(page.getByText('Hello from the API!')).toBeVisible();
  });
});
