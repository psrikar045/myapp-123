import { test, expect, devices } from '@playwright/test';

const viewports = [
  { name: 'Mobile', ...devices['Pixel 5'] },
  { name: 'Tablet', ...devices['iPad (gen 7)'] },
  { name: 'Desktop', { viewport: { width: 1280, height: 720 } } },
];

for (const viewport of viewports) {
  test.describe(`Responsiveness - ${viewport.name}`, () => {
    test.use(viewport);

    test('should have a responsive layout', async ({ page }) => {
      await page.goto('/');
      // Add assertions here to check for layout changes at different viewport sizes.
      // For example, you can check if a navigation menu is visible or hidden.
      if (viewport.name === 'Mobile') {
        await expect(page.getByRole('button', { name: 'menu' })).toBeVisible();
      } else {
        await expect(page.getByRole('navigation')).toBeVisible();
      }
    });
  });
}
