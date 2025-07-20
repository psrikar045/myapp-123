import { test, expect } from '@playwright/test';

test.describe('Interactive Elements', () => {
  test('button should have correct states', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Get Started' });

    // Hover state
    await button.hover();
    await expect(button).toHaveCSS('background-color', 'rgb(0, 0, 0)'); // Replace with your actual hover color

    // Focus state
    await button.focus();
    await expect(button).toHaveCSS('outline-color', 'rgb(0, 0, 0)'); // Replace with your actual focus color

    // Active state
    // This is tricky to test with Playwright, but you can try to mousedown and check the style
  });
});
