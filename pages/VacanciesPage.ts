import { type Locator, type Page, expect } from '@playwright/test';

export class VacanciesPage {
  readonly page: Page;
  readonly vacanciesHeading: Locator;
  private readonly inputGroups: Locator;
  private readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.vacanciesHeading = page.getByRole('heading', { name: 'Vacancies' });
    this.inputGroups = page.locator('.oxd-input-group');
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true });
  }

  private filterGroup(label: string): Locator {
    return this.inputGroups.filter({
      has: this.page.getByText(label, { exact: true }),
    });
  }

  async open() {
    await this.page.getByRole('link', { name: 'Recruitment' }).click();
    await this.page.getByRole('link', { name: 'Vacancies' }).click();
    await expect(this.vacanciesHeading).toBeVisible();
  }

  async selectFilter(label: string, option: string) {
    await this.filterGroup(label).locator('.oxd-select-text').click();
    const optionLocator = this.page.getByRole('option', {
      name: option,
      exact: true,
    });
    await expect(optionLocator).toBeVisible();
    await optionLocator.click();
  }

  async getActiveVacancyJobTitle(): Promise<string> {
    const activeRows = this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: 'Active', exact: true }),
    });
    await expect(activeRows).not.toHaveCount(0);

    const headers = await this.page.getByRole('columnheader').allTextContents();
    const jobTitleColumn = headers.findIndex((header) =>
      header.includes('Job Title'),
    );
    expect(jobTitleColumn).toBeGreaterThanOrEqual(0);

    for (const row of await activeRows.all()) {
      const cells = await row.getByRole('cell').allTextContents();
      const jobTitle = cells[jobTitleColumn]?.trim();
      if (jobTitle) {
        return jobTitle;
      }
    }

    throw new Error('No active vacancy row has a job title.');
  }

  async search() {
    const resultsLoaded = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/v2/recruitment/vacancies?limit=50') &&
        response.request().method() === 'GET',
    );
    await this.searchButton.click();
    const response = await resultsLoaded;
    expect(response.ok()).toBeTruthy();
  }

  getRowsByCellText(text: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: text, exact: true }),
    });
  }
}
