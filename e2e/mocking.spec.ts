import { test, expect } from '@playwright/test';

test.describe('API Mocking', () => {
  test('should display mocked data', async ({ page }) => {
    await page.route('**/api/data', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([{ id: 1, name: 'Mocked Item 1 from test' }]),
      });
    });

    await page.goto('/data');
    await expect(page.getByText('Mocked Item 1 from test')).toBeVisible();
  });
});
