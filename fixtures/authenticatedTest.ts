import { expect, test as base } from '@playwright/test';
import { validCredentials } from '../data/credentials';
import { PAGE_URL_PATTERNS } from '../data/constants';
import { LoginPage } from '../pages/LoginPage';
import type { AuthenticatedFixtures } from '../types';

export const test = base.extend<AuthenticatedFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(
      validCredentials.username,
      validCredentials.password,
    );
    await expect(page).toHaveURL(PAGE_URL_PATTERNS.dashboard);
    await use(page);
  },
});

export { expect };
