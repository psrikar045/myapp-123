import { test, expect } from '@playwright/test';
import * as users from '../test-data/fixtures/users.json';

test.describe('Data-driven tests', () => {
  for (const user of users) {
    test(`should be able to login as ${user.username}`, async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel('Username').fill(user.username);
      await page.getByLabel('Password').fill(user.password);
      await page.getByRole('button', { name: 'Log in' }).click();
      await expect(page).toHaveURL('/dashboard');
    });
  }
});
