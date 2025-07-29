import { test, expect, devices } from '@playwright/test';

const viewports = [
  { name: 'Mobile', viewport: { width: 375, height: 667 } },
  { name: 'Tablet', viewport: { width: 768, height: 1024 } },
  { name: 'Desktop', viewport: { width: 1280, height: 720 } },
];

for (const { name, viewport } of viewports) {
  test.describe(`Responsiveness - ${name}`, () => {
    test.use({ viewport });

    test('should have a responsive layout', async ({ page }) => {
      await page.goto('/');
      // Add assertions here to check for layout changes at different viewport sizes.
      // For example, you can check if a navigation menu is visible or hidden.
      if (name === 'Mobile') {
        await expect(page.getByRole('button', { name: 'menu' })).toBeVisible();
      } else {
        await expect(page.getByRole('navigation')).toBeVisible();
      }
    });
  });
}
