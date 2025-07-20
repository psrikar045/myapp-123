import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test('should display an error message when the server returns an error', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/data', route => {
      route.fulfill({
        status: 500,
        body: 'Internal Server Error',
      });
    });

    await page.goto('/data');
    await expect(page.getByText('An error occurred')).toBeVisible();
  });
});
