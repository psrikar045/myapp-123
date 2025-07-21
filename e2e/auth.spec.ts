import { test, expect } from '@playwright/test';
import { bypassLogin } from './auth.utils';

test.describe('Auth', () => {
  test('should bypass login and see dashboard', async ({ page }) => {
    await bypassLogin(page);
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
