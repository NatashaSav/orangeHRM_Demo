import { type Locator, type Page, expect } from '@playwright/test';

export class DashboardWidget {
  private readonly widgetContainers: Locator;
  private readonly widget: Locator;

  constructor(
    page: Page,
    title: string,
    widgetContainers: Locator = page.locator(
      '.orangehrm-dashboard-widget.oxd-sheet',
    ),
  ) {
    this.widgetContainers = widgetContainers;
    this.widget = widgetContainers.filter({
      has: page.getByText(title, { exact: true }),
    });
  }

  async expectVisible() {
    await expect(this.widget).toBeVisible();
  }

  async expectAbsent() {
    await expect(this.widgetContainers.first()).toBeVisible();
    await expect(this.widget).toHaveCount(0);
  }

  async expectChartVisible() {
    await expect(this.widget.locator('canvas')).toBeVisible();
  }

  async expectLabelVisible(label: string) {
    await expect(this.widget.getByText(label, { exact: true })).toBeVisible();
  }

  async expectLabelAbsent(label: string) {
    await expect(this.widget.getByText(label, { exact: true })).toHaveCount(0);
  }
}
