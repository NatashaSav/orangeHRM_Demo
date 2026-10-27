import { type Locator, type Page } from '@playwright/test';
import { ACCESSIBILITY_ROLES, UI_LABELS } from '../data/constants';

export class SideNavigation {
  private readonly dashboardLink: Locator;
  private readonly myInfoLink: Locator;
  private readonly recruitmentLink: Locator;
  private readonly vacanciesLink: Locator;

  constructor(page: Page) {
    this.dashboardLink = page.getByRole(ACCESSIBILITY_ROLES.link, {
      name: UI_LABELS.dashboard,
    });
    this.myInfoLink = page.getByRole(ACCESSIBILITY_ROLES.link, {
      name: UI_LABELS.myInfo,
    });
    this.recruitmentLink = page.getByRole(ACCESSIBILITY_ROLES.link, {
      name: UI_LABELS.recruitment,
    });
    this.vacanciesLink = page.getByRole(ACCESSIBILITY_ROLES.link, {
      name: UI_LABELS.vacancies,
    });
  }

  async openDashboard() {
    await this.dashboardLink.click();
  }

  async openMyInfo() {
    await this.myInfoLink.click();
  }

  async openVacancies() {
    await this.recruitmentLink.click();
    await this.vacanciesLink.click();
  }
}
