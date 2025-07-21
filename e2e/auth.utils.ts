import { Page } from '@playwright/test';

const AUTH_TOKEN_KEY = 'auth_token';

export async function login(page: Page, token: string) {
  await page.context().addCookies([{ name: AUTH_TOKEN_KEY, value: token, url: await page.context().browser().contexts()[0].pages()[0].url() }]);
  await page.goto('/');
}

export async function logout(page: Page) {
  await page.context().clearCookies();
  await page.goto('/login');
}

export async function bypassLogin(page: Page, token = 'mocked-token') {
  await page.addInitScript((key, token) => {
    window.localStorage.setItem(key, token);
  }, [AUTH_TOKEN_KEY, token]);
  await page.goto('/');
}
