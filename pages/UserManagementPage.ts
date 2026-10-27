import { type Locator, type Page, expect } from '@playwright/test';
import { EmployeesApi } from '../api/EmployeesApi';
import { SystemUsersApi } from '../api/SystemUsersApi';
import {
  ACCESSIBILITY_ROLES,
  HTTP_METHODS,
  UI_LABELS,
  URLS,
  USER_ROLES,
  USER_STATUSES,
  type UserStatus,
} from '../data/constants';
import type {
  ApiCollection,
  CreatedSystemUserResponse,
  EmployeeRecord,
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
  private readonly rows: Locator;
  private readonly roleOption: Locator;
  private readonly enabledStatusOption: Locator;
  private readonly editIcon: Locator;
  private readonly deleteIcon: Locator;
  private readonly deleteConfirmationButton: Locator;
  private readonly employeesApi: EmployeesApi;
  private readonly systemUsersApi: SystemUsersApi;

  constructor(page: Page) {
    this.page = page;
    this.employeesApi = new EmployeesApi(page.request, page.url());
    this.systemUsersApi = new SystemUsersApi(page.request, page.url());
    this.inputGroups = page.locator('.oxd-input-group');

    this.searchUsernameInput = this.getInput('Username');

    this.formUsernameInput = this.getInput('Username');
    this.employeeNameInput = page.getByPlaceholder(
      UI_LABELS.employeeNamePlaceholder,
    );
    this.passwordInput = this.getPasswordInput(UI_LABELS.password);
    this.confirmPasswordInput = this.getPasswordInput(
      UI_LABELS.confirmPassword,
    );
    this.userRoleSelect = this.getDropdown(UI_LABELS.userRole);
    this.userStatusSelect = this.getDropdown(UI_LABELS.status);

    this.addButton = page.getByRole(ACCESSIBILITY_ROLES.button, {
      name: UI_LABELS.add,
    });
    this.saveButton = page.getByRole(ACCESSIBILITY_ROLES.button, {
      name: UI_LABELS.save,
    });
    this.searchButton = page.getByRole(ACCESSIBILITY_ROLES.button, {
      name: UI_LABELS.search,
    });
    this.resetButton = page.getByRole(ACCESSIBILITY_ROLES.button, {
      name: UI_LABELS.reset,
    });

    this.systemUsersHeading = page.getByRole(ACCESSIBILITY_ROLES.heading, {
      name: UI_LABELS.systemUsers,
    });
    this.editUserHeading = page.getByRole(ACCESSIBILITY_ROLES.heading, {
      name: UI_LABELS.editUser,
    });
    this.rows = page.getByRole(ACCESSIBILITY_ROLES.row);
    this.roleOption = page.getByRole(ACCESSIBILITY_ROLES.option, {
      name: USER_ROLES.ess,
      exact: true,
    });
    this.enabledStatusOption = page.getByRole(ACCESSIBILITY_ROLES.option, {
      name: USER_STATUSES.enabled,
      exact: true,
    });
    this.editIcon = page.locator('i.bi-pencil-fill');
    this.deleteIcon = page.locator('i.bi-trash');
    this.deleteConfirmationButton = page.getByRole(ACCESSIBILITY_ROLES.button, {
      name: UI_LABELS.deleteConfirmation,
    });
  }

  private inputGroup(label: string): Locator {
    return this.inputGroups.filter({
      has: this.page.getByText(label, { exact: true }),
    });
  }

  private getInput(label: string): Locator {
    return this.inputGroup(label).getByRole(ACCESSIBILITY_ROLES.textbox);
  }

  private getPasswordInput(label: string): Locator {
    return this.inputGroup(label).locator('input[type="password"]');
  }

  private getDropdown(label: string): Locator {
    return this.inputGroup(label).locator('.oxd-select-text');
  }

  private async selectAvailableEmployee() {
    const [employees, users] = await Promise.all([
      this.employeesApi.getAllEmployees(),
      this.systemUsersApi.getAllUsers(),
    ]);

    const assignedEmployeeNumbers = new Set(
      users
        .map((user) => user.employee?.empNumber)
        .filter((empNumber): empNumber is number => empNumber !== undefined),
    );
    const availableEmployees = employees.filter(
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
        response.request().method() === HTTP_METHODS.get &&
        responseUrl.pathname.endsWith(URLS.employeeCollection) &&
        responseUrl.searchParams.get('nameOrId') === employeeId
      );
    });

    await this.employeeNameInput.fill(employeeId);
    const searchResponse = await autocompleteResponse;
    const matchingEmployees =
      await this.employeesApi.readEmployeeSearchResponse(searchResponse);
    expect(
      matchingEmployees.some(
        (result) =>
          result.empNumber === employee.empNumber &&
          result.employeeId === employeeId &&
          result.terminationId === null,
      ),
      `Autocomplete did not return the active employee matching ID ${employeeId}`,
    ).toBe(true);

    const employeeOption = this.page.getByRole(ACCESSIBILITY_ROLES.option, {
      name: new RegExp(
        `^${employeeNameParts.map(escapeRegExp).join('\\s+')}$`,
      ),
      exact: true,
    });
    await expect(employeeOption).toHaveCount(1);
    await expect(employeeOption).toBeVisible();
    await employeeOption.click();
  }

  async open() {
    await this.page.goto(URLS.systemUsersPage);
    await expect(this.systemUsersHeading).toBeVisible();
  }

  async addUser(username: string, password: string) {
    await this.addButton.click();

    await this.selectAvailableEmployee();

    await this.userRoleSelect.click();
    await expect(this.roleOption).toBeVisible();
    await this.roleOption.click();

    await this.userStatusSelect.click();
    await expect(this.enabledStatusOption).toBeVisible();
    await this.enabledStatusOption.click();

    await this.formUsernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);

    const saveResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes(URLS.adminUsers) &&
        response.request().method() === HTTP_METHODS.post,
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
        response.url().includes(`${URLS.adminUsers}?`) &&
        response.request().method() === HTTP_METHODS.get,
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
    return this.rows.filter({
      has: this.page.getByRole(ACCESSIBILITY_ROLES.cell, {
        name: username,
        exact: true,
      }),
    });
  }

  async editUser(username: string) {
    const userRow = this.getUserRow(username);
    await expect(userRow).toBeVisible();

    const editButton = userRow
      .getByRole(ACCESSIBILITY_ROLES.button)
      .filter({ has: this.editIcon });
    await expect(editButton).toHaveCount(1);
    await editButton.click();
    await expect(this.editUserHeading).toBeVisible();
  }

  async updateUserStatus(status: UserStatus) {
    await this.userStatusSelect.click();

    const statusOption = this.page.getByRole(ACCESSIBILITY_ROLES.option, {
      name: status,
      exact: true,
    });
    await expect(statusOption).toBeVisible();
    await statusOption.click();

    const updateResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes(URLS.adminUsers) &&
        response.request().method() !== HTTP_METHODS.get,
    );
    await this.saveButton.click();
    expect((await updateResponse).ok()).toBeTruthy();
    await this.open();
  }

  async deleteUser(username: string) {
    const userRow = this.getUserRow(username);
    await expect(userRow).toBeVisible();

    const deleteButton = userRow
      .getByRole(ACCESSIBILITY_ROLES.button)
      .filter({ has: this.deleteIcon });
    await expect(deleteButton).toHaveCount(1);
    await deleteButton.click();

    const confirmDeleteButton = this.deleteConfirmationButton;

    await expect(confirmDeleteButton).toBeVisible();
    const deleteResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes(URLS.adminUsers) &&
        response.request().method() !== HTTP_METHODS.get,
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