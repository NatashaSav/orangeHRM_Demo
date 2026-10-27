import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import {
  validCredentials,
  invalidLoginCases,
  emptyFieldCases,
} from '../data/credentials';
import { expectedMessages } from '../data/expectedMessages';
import { PAGE_URL_PATTERNS } from '../data/constants';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('OrangeHRM Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.open();
  });

  test('Login with valid credentials', async ({ page }) => {
    await loginPage.login(validCredentials.username, validCredentials.password);

    await expect(page).toHaveURL(PAGE_URL_PATTERNS.dashboard);
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.dashboardHeading).toBeVisible();
  });

  test.describe('Invalid credentials', () => {
    for (const credentials of invalidLoginCases) {
      test(`Login with ${credentials.name}`, async () => {
        await loginPage.login(credentials.username, credentials.password);

        await expect(loginPage.errorMessage).toHaveText(
          expectedMessages.invalidCredentials,
        );
      });
    }
  });

  test.describe('Required field validation', () => {
    test('Login with both fields empty', async () => {
      await loginPage.loginButton.click();

      await expect(loginPage.getRequiredMessages()).toHaveCount(2);
    });

    for (const credentials of emptyFieldCases) {
      test(`Login with ${credentials.name}`, async () => {
        await loginPage.login(credentials.username, credentials.password);

        await expect(loginPage.getRequiredMessages()).toHaveCount(1);
      });
    }
  });
});
