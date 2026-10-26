import { type Locator, type Page, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly dashboardHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
  }

  async open() {
    await this.page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(this.dashboardHeading).toBeVisible();
  }

  getChartWidget(title: string): Locator {
    return this.page
      .locator('.orangehrm-dashboard-widget.oxd-sheet')
      .filter({ has: this.page.getByText(title, { exact: true }) });
  }
}
