import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import {
  validCredentials,
  invalidCredentials,
  invalidLoginCases,
  emptyFieldCases,
} from '../data/credentials';
import { expectedMessages } from '../data/expectedMessages';

test.describe('OrangeHRM Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.open();
  });

  test('Login with valid credentials', async ({ page }) => {
    await loginPage.login(validCredentials.username, validCredentials.password);

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test.describe('Invalid credentials', () => {
    test('Login with invalid username and password', async () => {
      await loginPage.login(invalidCredentials.username, invalidCredentials.password);

      await expect(loginPage.errorMessage).toHaveText(expectedMessages.invalidCredentials);
    });

    for (const credentials of invalidLoginCases) {
      test(`Login with ${credentials.name}`, async () => {
        await loginPage.login(credentials.username, credentials.password);

        await expect(loginPage.errorMessage).toHaveText(expectedMessages.invalidCredentials);
      });
    }
  });

  test.describe('Required field validation', () => {
    test('Login with both fields empty', async () => {
      await loginPage.loginButton.click();

      const requiredMessages = loginPage.page.getByText(expectedMessages.required, { exact: true });

      await expect(requiredMessages).toHaveCount(2);
    });

    for (const credentials of emptyFieldCases) {
      test(`Login with ${credentials.name}`, async () => {
        await loginPage.login(credentials.username, credentials.password);

        const requiredMessages = loginPage.page.getByText(expectedMessages.required, { exact: true });

        await expect(requiredMessages).toHaveCount(1);
      });
    }
  });
});
