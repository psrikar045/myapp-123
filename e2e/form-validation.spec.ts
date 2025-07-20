import { test, expect } from '@playwright/test';

test.describe('Form Validation', () => {
  test('should display error messages for invalid input', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Message is required')).toBeVisible();

    await page.getByLabel('Email').fill('invalid-email');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Invalid email format')).toBeVisible();
  });
});
