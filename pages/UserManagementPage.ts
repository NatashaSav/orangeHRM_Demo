import { type Locator, type Page, expect } from '@playwright/test';
import type {
  ApiCollection,
  CreatedSystemUserResponse,
  EmployeeRecord,
  EmployeeSearchResult,
  SystemUserRecord,
} from '../types';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class UserManagementPage {
  readonly page: Page;
  private readonly inputGroups: Locator;

  readonly searchUsernameInput: Locator;
  readonly formUsernameInput: Locator;
  private readonly employeeNameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly userRoleSelect: Locator;
  readonly userStatusSelect: Locator;

  readonly addButton: Locator;
  readonly saveButton: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;


  readonly systemUsersHeading: Locator;
  readonly editUserHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inputGroups = page.locator('.oxd-input-group');

    this.searchUsernameInput = this.getInput('Username');

    this.formUsernameInput = this.getInput('Username');
    this.employeeNameInput = page.getByPlaceholder('Type for hints...');
    this.passwordInput = this.getPasswordInput('Password');
    this.confirmPasswordInput = this.getPasswordInput('Confirm Password');
    this.userRoleSelect = this.getSelect('User Role');
    this.userStatusSelect = this.getSelect('Status');

    this.addButton = page.getByRole('button', { name: 'Add' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });

    this.systemUsersHeading = page.getByRole('heading', {
      name: 'System Users',
    });
    this.editUserHeading = page.getByRole('heading', {
      name: 'Edit User',
    });
  }

  private inputGroup(label: string): Locator {
    return this.inputGroups.filter({
      has: this.page.getByText(label, { exact: true }),
    });
  }

  private getInput(label: string): Locator {
    return this.inputGroup(label).getByRole('textbox');
  }

  private getPasswordInput(label: string): Locator {
    return this.inputGroup(label).locator('input[type="password"]');
  }

  private getSelect(label: string): Locator {
    return this.inputGroup(label).locator('.oxd-select-text');
  }

  private async selectAvailableEmployee() {
    const employeesUrl = new URL(
      '/web/index.php/api/v2/pim/employees?limit=0',
      this.page.url(),
    );
    const usersUrl = new URL(
      '/web/index.php/api/v2/admin/users?limit=0',
      this.page.url(),
    );
    const [employeesResponse, usersResponse] = await Promise.all([
      this.page.request.get(employeesUrl.toString()),
      this.page.request.get(usersUrl.toString()),
    ]);

    expect(employeesResponse.ok()).toBeTruthy();
    expect(usersResponse.ok()).toBeTruthy();

    const employeeCollection =
      (await employeesResponse.json()) as ApiCollection<EmployeeRecord>;
    const userCollection =
      (await usersResponse.json()) as ApiCollection<SystemUserRecord>;
    expect(Array.isArray(employeeCollection.data)).toBe(true);
    expect(Array.isArray(userCollection.data)).toBe(true);

    const assignedEmployeeNumbers = new Set(
      userCollection.data
        .map((user) => user.employee?.empNumber)
        .filter((empNumber): empNumber is number => empNumber !== undefined),
    );
    const availableEmployees = employeeCollection.data.filter(
      (employee) =>
        employee.terminationId === null &&
        !assignedEmployeeNumbers.has(employee.empNumber) &&
        typeof employee.employeeId === 'string' &&
        employee.employeeId.trim().length > 0 &&
        [employee.firstName, employee.middleName, employee.lastName]
          .some((namePart) => namePart.trim().length > 0),
    );
    const employee = availableEmployees.find((candidate) => {
      const candidateName = [
        candidate.firstName,
        candidate.middleName,
        candidate.lastName,
      ]
        .filter((namePart) => namePart.trim().length > 0)
        .join(' ');

      return availableEmployees.filter((item) => {
        const itemName = [item.firstName, item.middleName, item.lastName]
          .filter((namePart) => namePart.trim().length > 0)
          .join(' ');
        return itemName === candidateName;
      }).length === 1;
    });

    if (!employee) {
      throw new Error(
        'No active employee with a unique name and no existing system user was found',
      );
    }

    if (typeof employee.employeeId !== 'string') {
      throw new Error('The selected employee does not have an employee ID');
    }
    const employeeId = employee.employeeId;

    const employeeNameParts = [
      employee.firstName,
      employee.middleName,
      employee.lastName,
    ].filter((namePart) => namePart.trim().length > 0);
    const autocompleteResponse = this.page.waitForResponse((response) => {
      const responseUrl = new URL(response.url());
      return (
        response.request().method() === 'GET' &&
        responseUrl.pathname.endsWith('/api/v2/pim/employees') &&
        responseUrl.searchParams.get('nameOrId') === employeeId
      );
    });

    await this.employeeNameInput.fill(employeeId);
    const response = await autocompleteResponse;
    expect(response.ok()).toBeTruthy();

    const searchResult =
      (await response.json()) as EmployeeSearchResult;
    expect(Array.isArray(searchResult.data)).toBe(true);
    expect(
      searchResult.data.some(
        (result) =>
          result.empNumber === employee.empNumber &&
          result.employeeId === employeeId &&
          result.terminationId === null,
      ),
      `Autocomplete did not return the active employee matching ID ${employeeId}`,
    ).toBe(true);

    const employeeOption = this.page.getByRole('option', {
      name: new RegExp(
        `^${employeeNameParts.map(escapeRegExp).join('\\s+')}$`,
      ),
    });
    await expect(employeeOption).toHaveCount(1);
    await expect(employeeOption).toBeVisible();
    await employeeOption.click();
  }

  async open() {
    await this.page.goto('/web/index.php/admin/viewSystemUsers');
    await expect(this.systemUsersHeading).toBeVisible();
  }

  async addUser(username: string, password: string) {
    await this.addButton.click();

    await this.selectAvailableEmployee();

    await this.userRoleSelect.click();
    const employeeRoleOption = this.page.getByRole('option', {
      name: 'ESS',
      exact: true,
    });
    await expect(employeeRoleOption).toBeVisible();
    await employeeRoleOption.click();

    await this.userStatusSelect.click();
    const enabledStatusOption = this.page.getByRole('option', {
      name: 'Enabled',
      exact: true,
    });
    await expect(enabledStatusOption).toBeVisible();
    await enabledStatusOption.click();

    await this.formUsernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);

    const saveResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/v2/admin/users') &&
        response.request().method() === 'POST',
    );
    await this.saveButton.click();
    const response = await saveResponse;
    expect(response.ok()).toBeTruthy();
    const createdUser =
      (await response.json()) as CreatedSystemUserResponse;
    expect(createdUser.data.userName).toBe(username);

    await this.open();
  }

  async searchUser(username: string): Promise<boolean> {
    await expect(this.systemUsersHeading).toBeVisible();

    await this.resetButton.click();
    await this.searchUsernameInput.fill(username);
    const searchResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/v2/admin/users?') &&
        response.request().method() === 'GET',
    );
    await this.searchButton.click();
    const response = await searchResponse;
    expect(response.ok()).toBeTruthy();
    const searchResult =
      (await response.json()) as ApiCollection<SystemUserRecord>;
    expect(Array.isArray(searchResult.data)).toBe(true);

    return searchResult.data.some((result) => result.userName === username);
  }

  getUserRow(username: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', {
        name: username,
        exact: true,
      }),
    });
  }

  async editUser(username: string) {
    const userRow = this.getUserRow(username);
    await expect(userRow).toBeVisible();

    const editButton = userRow
      .getByRole('button')
      .filter({ has: this.page.locator('i.bi-pencil-fill') });
    await expect(editButton).toHaveCount(1);
    await editButton.click();
    await expect(this.editUserHeading).toBeVisible();
  }

  async updateUserStatus(status: 'Enabled' | 'Disabled') {
    await this.userStatusSelect.click();

    const statusOption = this.page.getByRole('option', {
      name: status,
      exact: true,
    });
    await expect(statusOption).toBeVisible();
    await statusOption.click();

    const updateResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/v2/admin/users') &&
        response.request().method() !== 'GET',
    );
    await this.saveButton.click();
    expect((await updateResponse).ok()).toBeTruthy();
    await this.open();
  }

  async deleteUser(username: string) {
    const userRow = this.getUserRow(username);
    await expect(userRow).toBeVisible();

    const deleteButton = userRow
      .getByRole('button')
      .filter({ has: this.page.locator('i.bi-trash') });
    await expect(deleteButton).toHaveCount(1);
    await deleteButton.click();

    const confirmDeleteButton = this.page.getByRole('button', {
      name: 'Yes, Delete',
    });

    await expect(confirmDeleteButton).toBeVisible();
    const deleteResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/v2/admin/users') &&
        response.request().method() !== 'GET',
    );
    await confirmDeleteButton.click();
    expect((await deleteResponse).ok()).toBeTruthy();
  }

  async deleteUserIfExists(username: string) {
    await this.open();
    const userExists = await this.searchUser(username);

    if (userExists) {
      await this.deleteUser(username);
    }
  }
}