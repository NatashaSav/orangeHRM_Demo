import { type Locator, type Page, expect } from '@playwright/test';
import { ACCESSIBILITY_ROLES, UI_LABELS } from '../data/constants';
import { DashboardWidget } from './DashboardWidget';
import { SideNavigation } from './SideNavigation';

export class DashboardPage {
  readonly page: Page;
  readonly dashboardHeading: Locator;
  private readonly sideNavigation: SideNavigation;

  constructor(page: Page) {
    this.page = page;
    this.dashboardHeading = page.getByRole(ACCESSIBILITY_ROLES.heading, {
      name: UI_LABELS.dashboard,
    });
    this.sideNavigation = new SideNavigation(page);
  }

  async open() {
    await this.sideNavigation.openDashboard();
    await expect(this.dashboardHeading).toBeVisible();
  }

  getWidget(title: string): DashboardWidget {
    return new DashboardWidget(this.page, title);
  }
}
