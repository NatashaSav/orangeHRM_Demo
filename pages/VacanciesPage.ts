import { type Locator, type Page, expect } from '@playwright/test';
import {
  ACCESSIBILITY_ROLES,
  HTTP_METHODS,
  UI_LABELS,
  URLS,
  VACANCY_STATUSES,
} from '../data/constants';
import { SideNavigation } from './SideNavigation';

export class VacanciesPage {
  readonly page: Page;
  readonly vacanciesHeading: Locator;
  private readonly inputGroups: Locator;
  private readonly searchButton: Locator;
  private readonly sideNavigation: SideNavigation;
  private readonly rows: Locator;
  private readonly resultRows: Locator;
  private readonly columnHeaders: Locator;
  private readonly activeCells: Locator;

  constructor(page: Page) {
    this.page = page;
    this.vacanciesHeading = page.getByRole(ACCESSIBILITY_ROLES.heading, {
      name: UI_LABELS.vacancies,
    });
    this.inputGroups = page.locator('.oxd-input-group');
    this.searchButton = page.getByRole(ACCESSIBILITY_ROLES.button, {
      name: UI_LABELS.search,
      exact: true,
    });
    this.sideNavigation = new SideNavigation(page);
    this.rows = page.getByRole(ACCESSIBILITY_ROLES.row);
    this.resultRows = this.rows.filter({
      has: page.getByRole(ACCESSIBILITY_ROLES.cell),
    });
    this.columnHeaders = page.getByRole(ACCESSIBILITY_ROLES.columnheader);
    this.activeCells = page.getByRole(ACCESSIBILITY_ROLES.cell, {
      name: VACANCY_STATUSES.active,
      exact: true,
    });
  }

  private filterGroup(label: string): Locator {
    return this.inputGroups.filter({
      has: this.page.getByText(label, { exact: true }),
    });
  }

  async open() {
    await this.sideNavigation.openVacancies();
    await expect(this.vacanciesHeading).toBeVisible();
  }

  async selectFilter(label: string, option: string) {
    await this.filterGroup(label).locator('.oxd-select-text').click();
    const optionLocator = this.page.getByRole(ACCESSIBILITY_ROLES.option, {
      name: option,
      exact: true,
    });
    await expect(optionLocator).toBeVisible();
    await optionLocator.click();
  }

  async getActiveVacancyJobTitle(): Promise<string> {
    const activeRows = this.rows.filter({
      has: this.activeCells,
    });
    await expect(activeRows).not.toHaveCount(0);

    const headers = await this.columnHeaders.allTextContents();
    const jobTitleColumn = headers.findIndex((header) =>
      header.includes(UI_LABELS.jobTitle),
    );
    expect(jobTitleColumn).toBeGreaterThanOrEqual(0);

    for (const row of await activeRows.all()) {
      const rowCells = await row
        .getByRole(ACCESSIBILITY_ROLES.cell)
        .allTextContents();
      const jobTitle = rowCells[jobTitleColumn]?.trim();
      if (jobTitle) {
        return jobTitle;
      }
    }

    throw new Error('No active vacancy row has a job title.');
  }

  async search() {
    const resultsLoaded = this.page.waitForResponse(
      (response) => {
        const responseUrl = new URL(response.url());
        return (
          responseUrl.pathname.endsWith(URLS.vacancies) &&
          response.request().method() === HTTP_METHODS.get
        );
      },
    );
    await this.searchButton.click();
    const response = await resultsLoaded;
    expect(response.ok()).toBeTruthy();
  }

  async expectAllResultRowsToContainCellText(text: string) {
    const matchingRows = this.resultRows.filter({
      has: this.page.getByRole(ACCESSIBILITY_ROLES.cell, {
        name: text,
        exact: true,
      }),
    });

    await expect
      .poll(async () => {
        const totalRows = await this.resultRows.count();
        return (
          totalRows > 0 && (await matchingRows.count()) === totalRows
        );
      })
      .toBe(true);
  }
}
