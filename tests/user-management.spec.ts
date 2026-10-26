import { test, expect } from '../fixtures/authenticatedTest';
import { UserManagementPage } from '../pages/UserManagementPage';
import { generateTestUser } from '../utils/testData';
import type { TestUser } from '../types';

test.describe('OrangeHRM User Management', () => {
  let user: TestUser | undefined;

  test.afterEach(async ({ authenticatedPage }) => {
    if (user) {
      const userManagementPage = new UserManagementPage(authenticatedPage);
      await userManagementPage.deleteUserIfExists(user.username);
      user = undefined;
    }
  });

  test('Create, edit and delete a user', async ({ authenticatedPage }) => {
    user = generateTestUser();
    const userManagementPage = new UserManagementPage(authenticatedPage);

    await userManagementPage.open();

    await userManagementPage.addUser(user.username, user.password);

    await userManagementPage.searchUser(user.username);

    let userRow = userManagementPage.getUserRow(user.username);

    await expect(userRow).toBeVisible();
    await expect(userRow).toContainText('ESS');
    await expect(userRow).toContainText('Enabled');

    await userManagementPage.editUser(user.username);
    await userManagementPage.updateUserStatus('Disabled');

    await userManagementPage.searchUser(user.username);

    userRow = userManagementPage.getUserRow(user.username);

    await expect(userRow).toBeVisible();
    await expect(userRow).toContainText('Disabled');

    await userManagementPage.deleteUser(user.username);
    await userManagementPage.searchUser(user.username);

    await expect(
      userManagementPage.getUserRow(user.username),
    ).toHaveCount(0);
    user = undefined;
  });
});
