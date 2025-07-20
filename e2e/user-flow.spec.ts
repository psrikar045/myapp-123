import { test, expect } from '@playwright/test';

test.describe('User Flow', () => {
  test('user can login and logout', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL('/');
  });
});
