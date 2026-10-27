import { type Locator, type Page, expect } from '@playwright/test';
import { ACCESSIBILITY_ROLES, UI_LABELS, URLS } from '../data/constants';
import { expectedMessages } from '../data/expectedMessages';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole(ACCESSIBILITY_ROLES.textbox, {
      name: UI_LABELS.username,
    });
    this.passwordInput = page.getByRole(ACCESSIBILITY_ROLES.textbox, {
      name: UI_LABELS.password,
    });
    this.loginButton = page.getByRole(ACCESSIBILITY_ROLES.button, {
      name: UI_LABELS.login,
    });
    this.errorMessage = page.getByRole(ACCESSIBILITY_ROLES.alert);
  }

  async open() {
    await this.page.goto(URLS.loginPage);
    await expect(this.usernameInput).toBeVisible();
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  getRequiredMessages(): Locator {
    return this.page.getByText(expectedMessages.required, { exact: true });
  }
}
