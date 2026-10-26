import { expect, test as base } from '@playwright/test';
import { validCredentials } from '../data/credentials';
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
    await expect(page).toHaveURL(/dashboard/);
    await use(page);
  },
});

export { expect };
