import type { UserManagementPage } from '../pages/UserManagementPage';
import type { TestUser } from '../types';

export async function createUser(
  userManagementPage: UserManagementPage,
  user: TestUser,
): Promise<void> {
  await userManagementPage.open();
  await userManagementPage.addUser(user.username, user.password);
}
