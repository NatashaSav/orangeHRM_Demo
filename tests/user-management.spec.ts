import { test, expect } from '../fixtures/authenticatedTest';
import { UserManagementPage } from '../pages/UserManagementPage';
import { generateTestUser } from '../utils/testData';
import type { TestUser } from '../types';
import { USER_ROLES, USER_STATUSES } from '../data/constants';

test.describe('OrangeHRM User Management', () => {
  let user: TestUser | undefined;

  async function createUser(
    userManagementPage: UserManagementPage,
  ): Promise<TestUser> {
    user = generateTestUser();
    await userManagementPage.open();
    await userManagementPage.addUser(user.username, user.password);
    return user;
  }

  test.afterEach(async ({ authenticatedPage }) => {
    if (user) {
      const userManagementPage = new UserManagementPage(authenticatedPage);
      await userManagementPage.deleteUserIfExists(user.username);
      user = undefined;
    }
  });

  test('Creates a user', async ({ authenticatedPage }) => {
    const userManagementPage = new UserManagementPage(authenticatedPage);
    const createdUser = await createUser(userManagementPage);
    await userManagementPage.searchUser(createdUser.username);
    const userRow = userManagementPage.getUserRow(createdUser.username);

    await expect(userRow).toBeVisible();
    await expect(userRow).toContainText(USER_ROLES.ess);
    await expect(userRow).toContainText(USER_STATUSES.enabled);
  });

  test('Edits a user status', async ({ authenticatedPage }) => {
    const userManagementPage = new UserManagementPage(authenticatedPage);
    const createdUser = await createUser(userManagementPage);
    await userManagementPage.searchUser(createdUser.username);
    await userManagementPage.editUser(createdUser.username);
    await userManagementPage.updateUserStatus(USER_STATUSES.disabled);
    await userManagementPage.searchUser(createdUser.username);
    const userRow = userManagementPage.getUserRow(createdUser.username);

    await expect(userRow).toBeVisible();
    await expect(userRow).toContainText(USER_STATUSES.disabled);
  });

  test('Deletes a user', async ({ authenticatedPage }) => {
    const userManagementPage = new UserManagementPage(authenticatedPage);
    const createdUser = await createUser(userManagementPage);
    await userManagementPage.searchUser(createdUser.username);
    await userManagementPage.deleteUser(createdUser.username);
    await userManagementPage.searchUser(createdUser.username);

    await expect(
      userManagementPage.getUserRow(createdUser.username),
    ).toHaveCount(0);
  });
});
